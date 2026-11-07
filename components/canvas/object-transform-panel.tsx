"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Move, RotateCcw } from "lucide-react";
import type { FabricObject } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
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
};

export function ObjectTransformPanel({
  object,
  canvas,
  onCommit,
  onFormSync,
}: ObjectTransformPanelProps) {
  const [tab, setTab] = useState<TransformTab>("position");
  const [preview, setPreview] = useState<string | null>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
    skewX: number;
    skewY: number;
  } | null>(null);

  const angle = Math.round(object.angle ?? 0);
  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const zoomPct = Math.round(((Math.abs(scaleX) + Math.abs(scaleY)) / 2) * 100);
  const skewX = Math.round(object.skewX ?? 0);
  const skewY = Math.round(object.skewY ?? 0);
  const m = meta(object);

  const refreshPreview = useCallback(() => {
    setPreview(objectPreviewUrl(object));
  }, [object]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview, angle, zoomPct, skewX, skewY, object.left, object.top]);

  const paint = (commit = false) => {
    object.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: object });
    onFormSync?.({
      angle: Math.round(object.angle ?? 0),
      width: Math.round((object.width ?? 0) * (object.scaleX ?? 1)),
      height: Math.round((object.height ?? 0) * (object.scaleY ?? 1)),
    });
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

  const onPreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      left: object.left ?? 0,
      top: object.top ?? 0,
      skewX: object.skewX ?? 0,
      skewY: object.skewY ?? 0,
    };
  };

  const onPreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (tab === "position") {
      object.set({ left: start.left + dx * 1.4, top: start.top + dy * 1.4 });
    } else {
      object.set({
        skewX: Math.max(-60, Math.min(60, start.skewX + dx * 0.35)),
        skewY: Math.max(-60, Math.min(60, start.skewY + dy * 0.35)),
      });
    }
    paint(false);
  };

  const onPreviewPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    onCommit();
  };

  useEffect(() => {
    ensureBaseScale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object]);

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-10 flex-1 items-center rounded-full bg-muted/70 p-1 dark:bg-muted/35">
          {(
            [
              { id: "position" as const, label: "Position" },
              { id: "tilt" as const, label: "Tilt" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTab(opt.id)}
              className={cn(
                "flex h-full flex-1 items-center justify-center rounded-full text-[13px] font-medium transition-colors",
                tab === opt.id
                  ? "bg-background text-foreground dark:bg-background/85"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          title="Reset transform"
          onClick={resetTransform}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:bg-muted/35"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      <div
        className={cn(
          "relative mb-2.5 aspect-[4/3] w-full cursor-grab overflow-hidden rounded-2xl bg-muted/50 active:cursor-grabbing dark:bg-muted/30",
          "ring-1 ring-inset ring-border/40",
        )}
        onPointerDown={onPreviewPointerDown}
        onPointerMove={onPreviewPointerMove}
        onPointerUp={onPreviewPointerUp}
        onPointerCancel={onPreviewPointerUp}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full object-contain p-3"
            style={{
              transform:
                tab === "tilt"
                  ? `perspective(600px) rotateX(${skewY * 0.35}deg) rotateY(${-skewX * 0.35}deg)`
                  : undefined,
            }}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[13px] text-muted-foreground">
            Preview
          </div>
        )}
        <div
          className={cn(
            "pointer-events-none absolute flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground",
            tab === "position" ? "inset-0 m-auto" : "left-3 top-3",
          )}
        >
          {tab === "position" ? (
            <Camera className="size-4" />
          ) : (
            <Move className="size-4" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <PillSlider
          label="Zoom"
          value={zoomPct}
          min={10}
          max={300}
          step={1}
          formatValue={(v) => `${Math.round(v)}%`}
          onValueChange={(v) => setZoom(v, false)}
          onValueCommit={(v) => setZoom(v, true)}
        />
        <PillSlider
          label="Rotation"
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
              label="Tilt X"
              value={skewX}
              min={-45}
              max={45}
              step={1}
              formatValue={(v) => `${Math.round(v)}°`}
              onValueChange={(v) => setSkew("skewX", v, false)}
              onValueCommit={(v) => setSkew("skewX", v, true)}
            />
            <PillSlider
              label="Tilt Y"
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
