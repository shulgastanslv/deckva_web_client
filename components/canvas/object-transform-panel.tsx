"use client";

import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowCounterClockwise as RotateCcw } from "@phosphor-icons/react";
import type { FabricObject } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
import {
  getSceneBoundingRect,
  moveObjectBoundingRectTo,
} from "@/lib/canvas/auto-flow";
import { cn } from "@/lib/utils";

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

function objectPreviewUrl(obj: FabricObject): string | null {
  try {
    const anyObj = obj as FabricObject & {
      toDataURL?: (opts?: Record<string, unknown>) => string;
      getSrc?: () => string;
    };
    if (typeof anyObj.toDataURL === "function") {
      const bound = obj.getBoundingRect();
      const maxSide = Math.max(bound.width || 1, bound.height || 1);
      const multiplier = Math.min(2, 180 / maxSide);
      return anyObj.toDataURL({
        format: "png",
        multiplier: Math.max(0.25, multiplier),
        enableRetinaScaling: false,
      });
    }
    if (obj.type === "image" && typeof anyObj.getSrc === "function") {
      return anyObj.getSrc() || null;
    }
  } catch {
    /* CORS / empty */
  }
  return null;
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
    <label className="flex h-10 min-w-0 items-center overflow-hidden rounded-md bg-muted/40">
      <span className="shrink-0 px-3 text-[12px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="h-4 w-px shrink-0 bg-border/50" aria-hidden />
      <input
        type="number"
        step={decimals > 0 ? 10 ** -decimals : 1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-right text-[13px] tabular-nums outline-none focus-visible:ring-0"
      />
      {suffix ? (
        <span className="pr-3 text-[12px] text-muted-foreground">{suffix}</span>
      ) : null}
    </label>
  );
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
  const [preview, setPreview] = useState<string | null>(null);
  const [posTick, setPosTick] = useState(0);

  const angle = Math.round(object.angle ?? 0);
  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const zoomPct = Math.round(((Math.abs(scaleX) + Math.abs(scaleY)) / 2) * 100);
  const skewX = Math.round(object.skewX ?? 0);
  const skewY = Math.round(object.skewY ?? 0);
  const m = meta(object);

  const scene = useMemo(() => canvasSceneSize(object), [object, posTick]);
  const rect = useMemo(() => getSceneBoundingRect(object), [object, posTick]);
  const posX = Math.round(rect.left);
  const posY = Math.round(rect.top);

  const selectedCell = useMemo(() => {
    const maxX = Math.max(1, scene.width - rect.width);
    const maxY = Math.max(1, scene.height - rect.height);
    const col = Math.round((rect.left / maxX) * (GRID_COLS - 1));
    const row = Math.round((rect.top / maxY) * (GRID_ROWS - 1));
    return {
      col: Math.max(0, Math.min(GRID_COLS - 1, col)),
      row: Math.max(0, Math.min(GRID_ROWS - 1, row)),
    };
  }, [rect, scene]);

  const refreshPreview = useCallback(() => {
    setPreview(objectPreviewUrl(object));
  }, [object]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview, angle, zoomPct, skewX, skewY, posTick]);

  const paint = (commit = false) => {
    object.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: object });
    onFormSync?.({
      angle: Math.round(object.angle ?? 0),
      width: Math.round((object.width ?? 0) * (object.scaleX ?? 1)),
      height: Math.round((object.height ?? 0) * (object.scaleY ?? 1)),
    });
    setPosTick((n) => n + 1);
    if (commit) onCommit();
    refreshPreview();
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
    object.set({ [axis]: deg });
    paint(commit);
  };

  const setPosition = (left: number, top: number, commit = false) => {
    moveObjectBoundingRectTo(object, left, top);
    paint(commit);
  };

  const snapToCell = (col: number, row: number) => {
    const maxX = Math.max(0, scene.width - rect.width);
    const maxY = Math.max(0, scene.height - rect.height);
    const left = (col / (GRID_COLS - 1)) * maxX;
    const top = (row / (GRID_ROWS - 1)) * maxY;
    setPosition(left, top, true);
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
        <div className="flex h-9 flex-1 items-center rounded-md bg-muted/40 p-0.5">
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
                "flex h-full flex-1 items-center justify-center rounded-md text-[13px] font-medium transition-colors",
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
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>

      {/* Zoom — thumbnail + scale, CapCut-like gray block */}
      <div className="flex items-center gap-2.5 rounded-xl bg-muted/30 p-2.5">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted/50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              draggable={false}
              className="size-full object-contain p-1"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
              —
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <DimField
            label={t("zoom")}
            value={zoomPct / 100}
            suffix="x"
            decimals={2}
            allowNegative={false}
            onChange={(v) => setZoom(Math.max(0.05, v) * 100, true)}
          />
        </div>
      </div>

      {tab === "position" ? (
        <div className="space-y-2.5">
          {/* Position pad — 5×3 snap grid */}
          <div className="rounded-xl bg-muted/30 px-3 py-4">
            <div
              className="mx-auto grid w-full max-w-[11rem] gap-y-5"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              }}
              role="group"
              aria-label={t("position")}
            >
              {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
                const col = i % GRID_COLS;
                const row = Math.floor(i / GRID_COLS);
                const active =
                  selectedCell.col === col && selectedCell.row === row;
                return (
                  <button
                    key={`${col}-${row}`}
                    type="button"
                    aria-label={`${t("position")} ${col + 1},${row + 1}`}
                    aria-pressed={active}
                    onClick={() => snapToCell(col, row)}
                    className="relative flex h-4 items-center justify-center"
                  >
                    <span
                      className={cn(
                        "rounded-full transition-all",
                        active
                          ? "size-3.5 bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-muted/30"
                          : "size-1.5 bg-muted-foreground/45 hover:bg-muted-foreground/70",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
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
          </div>

          {size ? (
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
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <DimField
            label="X"
            value={skewX}
            suffix="°"
            onChange={(v) => setSkew("skewX", Math.max(-45, Math.min(45, v)), true)}
          />
          <DimField
            label="Y"
            value={skewY}
            suffix="°"
            onChange={(v) => setSkew("skewY", Math.max(-45, Math.min(45, v)), true)}
          />
        </div>
      )}

      <div className="space-y-2">
        <PillSlider
          label={t("rotation")}
          value={normalizeAngle(angle)}
          min={-180}
          max={180}
          step={1}
          formatValue={(v) => `${Math.round(v)}°`}
          onValueChange={(v) => setAngle(v, false)}
          onValueCommit={(v) => setAngle(v, true)}
        />
        {tab === "tilt" ? (
          <>
            <PillSlider
              label={t("tiltX")}
              value={skewX}
              min={-45}
              max={45}
              step={1}
              formatValue={(v) => `${Math.round(v)}°`}
              onValueChange={(v) => setSkew("skewX", v, false)}
              onValueCommit={(v) => setSkew("skewX", v, true)}
            />
            <PillSlider
              label={t("tiltY")}
              value={skewY}
              min={-45}
              max={45}
              step={1}
              formatValue={(v) => `${Math.round(v)}°`}
              onValueChange={(v) => setSkew("skewY", v, false)}
              onValueCommit={(v) => setSkew("skewY", v, true)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
