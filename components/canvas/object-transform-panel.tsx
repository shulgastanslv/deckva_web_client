"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterClockwise as RotateCcw } from "@phosphor-icons/react";
import type { FabricObject } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
import {
  getSceneBoundingRect,
  moveObjectBoundingRectTo,
} from "@/lib/canvas/auto-flow";
import { cn } from "@/lib/utils";
import { controlH } from "@/components/ui/control";

function normalizeAngle(deg: number): number {
  let n = ((deg % 360) + 360) % 360;
  if (n > 180) n -= 360;
  return Math.round(n);
}

type TransformTab = "position" | "tilt";

type ObjectMeta = FabricObject & {
  swibpBaseScaleX?: number;
  swibpBaseScaleY?: number;
};

function meta(obj: FabricObject): ObjectMeta {
  return obj as ObjectMeta;
}

function canvasSceneSize(object: FabricObject): { width: number; height: number } {
  const canvas = object.canvas;
  if (!canvas) return { width: 1080, height: 1080 };
  const zoom = canvas.getZoom() || 1;
  return {
    width: (canvas.getWidth() || 1080) / zoom,
    height: (canvas.getHeight() || 1080) / zoom,
  };
}

const GRID_COLS = 5;
const GRID_ROWS = 3;
const SKEW_MAX = 45;

type ObjectTransformPanelProps = {
  object: FabricObject;
  canvas: {
    requestRenderAll: () => void;
    fire: (event: string, payload?: unknown) => void;
  };
  onCommit: () => void;
  onFormSync?: (patch: {
    angle?: number;
    width?: number;
    height?: number;
  }) => void;
  /** Width / height controls rendered under Position. */
  size?: {
    width: number;
    height: number;
    onWidth: (value: number) => void;
    onHeight: (value: number) => void;
  };
};

/** CapCut-like labeled number field: label | value. */
function DimField({
  label,
  value,
  onChange,
  suffix,
  allowNegative = true,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  allowNegative?: boolean;
  decimals?: number;
}) {
  const format = (n: number) =>
    decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
  const [draft, setDraft] = useState(format(value));
  useEffect(() => {
    setDraft(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals]);

  const commit = () => {
    const next = Number(draft);
    if (!Number.isFinite(next)) {
      setDraft(format(value));
      return;
    }
    if (!allowNegative && next <= 0) {
      setDraft(format(value));
      return;
    }
    const rounded =
      decimals > 0
        ? Math.round(next * 10 ** decimals) / 10 ** decimals
        : Math.round(next);
    onChange(rounded);
  };

  return (
    <label
      className={cn(
        "flex min-w-0 items-center overflow-hidden rounded-md border-none bg-muted/40 shadow-none",
        controlH,
      )}
    >
      <span className="shrink-0 px-3 text-[13px] font-normal text-muted-foreground">
        {label}
      </span>
      <span className="h-4 w-px shrink-0 bg-border/40" aria-hidden />
      <input
        type="number"
        step={decimals > 0 ? 10 ** -decimals : 1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-right text-[13px] font-normal tabular-nums outline-none focus-visible:ring-0"
      />
      {suffix ? (
        <span className="pr-3 text-[12px] text-muted-foreground">{suffix}</span>
      ) : null}
    </label>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function ObjectTransformPanel({
  object,
  canvas,
  onCommit,
  onFormSync,
  size,
}: ObjectTransformPanelProps) {
  const t = useTranslations("editor.transform");
  const [tab, setTab] = useState<TransformTab>("position");
  const [tick, setTick] = useState(0);
  const padRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const angle = Math.round(object.angle ?? 0);
  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const zoomPct = Math.round(((Math.abs(scaleX) + Math.abs(scaleY)) / 2) * 100);
  const skewX = Math.round(object.skewX ?? 0);
  const skewY = Math.round(object.skewY ?? 0);
  const m = meta(object);

  const scene = useMemo(() => canvasSceneSize(object), [object, tick]);
  const rect = useMemo(() => getSceneBoundingRect(object), [object, tick]);
  const posX = Math.round(rect.left);
  const posY = Math.round(rect.top);

  /** Normalized pad cursor 0..1 for current tab. */
  const padPos = useMemo(() => {
    if (tab === "position") {
      const maxX = Math.max(1, scene.width - rect.width);
      const maxY = Math.max(1, scene.height - rect.height);
      return {
        x: clamp01(rect.left / maxX),
        y: clamp01(rect.top / maxY),
      };
    }
    return {
      x: clamp01((skewX + SKEW_MAX) / (SKEW_MAX * 2)),
      y: clamp01((skewY + SKEW_MAX) / (SKEW_MAX * 2)),
    };
  }, [tab, scene, rect, skewX, skewY]);

  const selectedCell = useMemo(
    () => ({
      col: Math.round(padPos.x * (GRID_COLS - 1)),
      row: Math.round(padPos.y * (GRID_ROWS - 1)),
    }),
    [padPos],
  );

  useEffect(() => {
    const fab = object.canvas;
    if (!fab) return;
    const bump = () => {
      if (draggingRef.current) return;
      setTick((n) => n + 1);
    };
    fab.on("object:moving", bump);
    fab.on("object:modified", bump);
    fab.on("object:scaling", bump);
    fab.on("object:rotating", bump);
    fab.on("object:skewing", bump);
    return () => {
      fab.off("object:moving", bump);
      fab.off("object:modified", bump);
      fab.off("object:scaling", bump);
      fab.off("object:rotating", bump);
      fab.off("object:skewing", bump);
    };
  }, [object]);

  const paint = (commit = false) => {
    object.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: object });
    onFormSync?.({
      angle: Math.round(object.angle ?? 0),
      width: Math.round((object.width ?? 0) * (object.scaleX ?? 1)),
      height: Math.round((object.height ?? 0) * (object.scaleY ?? 1)),
    });
    setTick((n) => n + 1);
    if (commit) onCommit();
  };

  const setZoom = (pct: number, commit = false) => {
    const next = Math.max(0.05, pct / 100);
    const signX = (object.scaleX ?? 1) < 0 ? -1 : 1;
    const signY = (object.scaleY ?? 1) < 0 ? -1 : 1;
    object.set({ scaleX: next * signX, scaleY: next * signY });
    paint(commit);
  };

  const setAngle = (deg: number, commit = false) => {
    object.set({ angle: deg });
    paint(commit);
  };

  const setSkew = (axis: "skewX" | "skewY", deg: number, commit = false) => {
    object.set({ [axis]: Math.max(-SKEW_MAX, Math.min(SKEW_MAX, deg)) });
    paint(commit);
  };

  const setPosition = (left: number, top: number, commit = false) => {
    moveObjectBoundingRectTo(object, left, top);
    paint(commit);
  };

  const applyPadNorm = (nx: number, ny: number, commit = false) => {
    const x = clamp01(nx);
    const y = clamp01(ny);
    if (tab === "position") {
      const maxX = Math.max(0, scene.width - rect.width);
      const maxY = Math.max(0, scene.height - rect.height);
      moveObjectBoundingRectTo(object, x * maxX, y * maxY);
    } else {
      object.set({
        skewX: Math.round(x * SKEW_MAX * 2 - SKEW_MAX),
        skewY: Math.round(y * SKEW_MAX * 2 - SKEW_MAX),
      });
    }
    paint(commit);
  };

  const snapToCell = (col: number, row: number) => {
    applyPadNorm(col / (GRID_COLS - 1), row / (GRID_ROWS - 1), true);
  };

  const normFromPointer = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return { x: 0.5, y: 0.5 };
    const grid = el.firstElementChild as HTMLElement | null;
    const box = (grid ?? el).getBoundingClientRect();
    // Map pointer onto cell-center continuum (first ↔ last cell)
    const cellW = box.width / GRID_COLS;
    const cellH = box.height / GRID_ROWS;
    const x = (clientX - box.left - cellW / 2) / Math.max(1, box.width - cellW);
    const y = (clientY - box.top - cellH / 2) / Math.max(1, box.height - cellH);
    return { x: clamp01(x), y: clamp01(y) };
  };

  const onPadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    const { x, y } = normFromPointer(e.clientX, e.clientY);
    applyPadNorm(x, y, false);
  };

  const onPadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const { x, y } = normFromPointer(e.clientX, e.clientY);
    applyPadNorm(x, y, false);
  };

  const onPadPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    // Snap to nearest grid point on release for CapCut feel
    const { x, y } = normFromPointer(e.clientX, e.clientY);
    snapToCell(
      Math.round(x * (GRID_COLS - 1)),
      Math.round(y * (GRID_ROWS - 1)),
    );
  };

  const ensureBaseScale = () => {
    if (typeof m.swibpBaseScaleX !== "number") {
      m.swibpBaseScaleX = Math.abs(object.scaleX ?? 1);
      m.swibpBaseScaleY = Math.abs(object.scaleY ?? 1);
    }
  };

  const resetTransform = () => {
    ensureBaseScale();
    const bx = m.swibpBaseScaleX ?? 1;
    const by = m.swibpBaseScaleY ?? 1;
    object.set({
      angle: 0,
      skewX: 0,
      skewY: 0,
      scaleX: bx,
      scaleY: by,
    });
    paint(true);
  };

  useEffect(() => {
    ensureBaseScale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex flex-1 items-center rounded-md bg-muted/40 p-0.5",
            controlH,
          )}
        >
          {(
            [
              { id: "position" as const, label: t("position") },
              { id: "tilt" as const, label: t("tilt") },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTab(opt.id)}
              className={cn(
                "flex h-full flex-1 items-center justify-center rounded-md text-[13px] font-normal transition-colors",
                tab === opt.id
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          title={t("reset")}
          onClick={resetTransform}
          className="flex size-9 shrink-0 items-center justify-center rounded-md border-none text-muted-foreground shadow-none transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>

      {/* CapCut-style regulation pad — same for Position & Tilt */}
      <div
        ref={padRef}
        className="relative h-40 touch-none select-none cursor-grab overflow-hidden rounded-xl bg-muted/40 p-5 active:cursor-grabbing dark:bg-muted/25"
        onPointerDown={onPadPointerDown}
        onPointerMove={onPadPointerMove}
        onPointerUp={onPadPointerUp}
        onPointerCancel={onPadPointerUp}
        role="application"
        aria-label={tab === "position" ? t("position") : t("tilt")}
      >
        <div
          className="pointer-events-none relative grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
            const col = i % GRID_COLS;
            const row = Math.floor(i / GRID_COLS);
            const active =
              selectedCell.col === col && selectedCell.row === row;
            return (
              <div
                key={`${col}-${row}`}
                className="relative z-0 flex items-center justify-center"
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full bg-muted-foreground/40 transition-opacity",
                    active && "opacity-0",
                  )}
                />
              </div>
            );
          })}

          {/* Floating puck — white disc + primary core, aligned to grid cell centers */}
          <div className="absolute inset-0 z-10" aria-hidden>
            <div
              className="absolute size-7 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((padPos.x * (GRID_COLS - 1) + 0.5) / GRID_COLS) * 100}%`,
                top: `${((padPos.y * (GRID_ROWS - 1) + 0.5) / GRID_ROWS) * 100}%`,
              }}
            >
              <span className="absolute inset-0 rounded-full bg-background shadow-[0_1px_4px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:shadow-[0_1px_4px_rgba(0,0,0,0.45)] dark:ring-white/10" />
              <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_45%,transparent)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tab === "position" ? (
          <>
            <DimField
              label="X"
              value={posX}
              onChange={(v) => setPosition(v, rect.top, true)}
            />
            <DimField
              label="Y"
              value={posY}
              onChange={(v) => setPosition(rect.left, v, true)}
            />
          </>
        ) : (
          <>
            <DimField
              label="X"
              value={skewX}
              suffix="°"
              onChange={(v) => setSkew("skewX", v, true)}
            />
            <DimField
              label="Y"
              value={skewY}
              suffix="°"
              onChange={(v) => setSkew("skewY", v, true)}
            />
          </>
        )}
      </div>

      {tab === "position" && size ? (
        <div className="grid grid-cols-2 gap-2">
          <DimField
            label="W"
            value={size.width}
            allowNegative={false}
            onChange={size.onWidth}
          />
          <DimField
            label="H"
            value={size.height}
            allowNegative={false}
            onChange={size.onHeight}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <PillSlider
          label={t("zoom")}
          value={zoomPct}
          min={10}
          max={300}
          step={1}
          suffix="%"
          onValueChange={(v) => setZoom(v, false)}
          onValueCommit={(v) => setZoom(v, true)}
        />
        <PillSlider
          label={t("rotation")}
          value={normalizeAngle(angle)}
          min={-180}
          max={180}
          step={1}
          suffix="°"
          onValueChange={(v) => setAngle(v, false)}
          onValueCommit={(v) => setAngle(v, true)}
        />
        {tab === "tilt" ? (
          <>
            <PillSlider
              label={t("tiltX")}
              value={skewX}
              min={-SKEW_MAX}
              max={SKEW_MAX}
              step={1}
              suffix="°"
              onValueChange={(v) => setSkew("skewX", v, false)}
              onValueCommit={(v) => setSkew("skewX", v, true)}
            />
            <PillSlider
              label={t("tiltY")}
              value={skewY}
              min={-SKEW_MAX}
              max={SKEW_MAX}
              step={1}
              suffix="°"
              onValueChange={(v) => setSkew("skewY", v, false)}
              onValueCommit={(v) => setSkew("skewY", v, true)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
