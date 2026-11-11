"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const RULER_SIZE = 16;

type CanvasRulersProps = {
  scrollLeft: number;
  scrollTop: number;
  originX: number;
  originY: number;
  scale: number;
  viewportW: number;
  viewportH: number;
  zoomPercent: number;
  className?: string;
};

/** Major step in canvas units so labels sit ~64px apart. */
function majorStep(scale: number): number {
  const target = 64 / Math.max(scale, 0.001);
  const pow = 10 ** Math.floor(Math.log10(Math.max(target, 1e-6)));
  const n = target / pow;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function paintRuler(
  ctx: CanvasRenderingContext2D,
  opts: {
    horizontal: boolean;
    length: number;
    origin: number;
    scroll: number;
    scale: number;
    step: number;
    dpr: number;
    tick: string;
    label: string;
  },
) {
  const { horizontal, length, origin, scroll, scale, step, dpr, tick, label } = opts;
  const half = step / 2;
  const start = Math.floor((-origin + scroll) / scale / half) * half - half;
  const end = (-origin + scroll + length) / scale + half;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, horizontal ? length : RULER_SIZE, horizontal ? RULER_SIZE : length);
  ctx.lineWidth = 1;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  for (let u = start; u <= end; u += half) {
    const value = Math.round(u * 1000) / 1000;
    const px = origin + value * scale - scroll;
    if (px < -2 || px > length + 2) continue;

    const major = Math.abs(((value % step) + step) % step) < 1e-6;
    const tickLen = major ? RULER_SIZE * 0.55 : RULER_SIZE * 0.28;

    ctx.globalAlpha = major ? 0.55 : 0.28;
    ctx.strokeStyle = tick;
    ctx.beginPath();
    if (horizontal) {
      const x = Math.round(px) + 0.5;
      ctx.moveTo(x, RULER_SIZE);
      ctx.lineTo(x, RULER_SIZE - tickLen);
    } else {
      const y = Math.round(px) + 0.5;
      ctx.moveTo(RULER_SIZE, y);
      ctx.lineTo(RULER_SIZE - tickLen, y);
    }
    ctx.stroke();

    if (!major) continue;
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = label;
    if (horizontal) {
      ctx.textAlign = "left";
      ctx.fillText(String(Math.round(value)), Math.round(px) + 3, 6);
    } else {
      ctx.save();
      ctx.translate(6, Math.round(px) - 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "left";
      ctx.fillText(String(Math.round(value)), 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

export function CanvasRulers({
  scrollLeft,
  scrollTop,
  originX,
  originY,
  scale,
  viewportW,
  viewportH,
  zoomPercent,
  className,
}: CanvasRulersProps) {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const mo = new MutationObserver(() => setThemeTick((n) => n + 1));
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const h = hRef.current;
    const v = vRef.current;
    if (!h || !v || viewportW <= 0 || viewportH <= 0 || scale <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const step = majorStep(scale);
    const tick = cssVar("--muted-foreground", "#71717a");
    const label = cssVar("--muted-foreground", "#71717a");
    const hW = Math.max(1, viewportW - RULER_SIZE);
    const vH = Math.max(1, viewportH - RULER_SIZE);

    h.width = Math.round(hW * dpr);
    h.height = Math.round(RULER_SIZE * dpr);
    h.style.width = `${hW}px`;
    h.style.height = `${RULER_SIZE}px`;

    v.width = Math.round(RULER_SIZE * dpr);
    v.height = Math.round(vH * dpr);
    v.style.width = `${RULER_SIZE}px`;
    v.style.height = `${vH}px`;

    const hCtx = h.getContext("2d");
    const vCtx = v.getContext("2d");
    if (!hCtx || !vCtx) return;

    paintRuler(hCtx, {
      horizontal: true,
      length: hW,
      origin: originX - RULER_SIZE,
      scroll: scrollLeft,
      scale,
      step,
      dpr,
      tick,
      label,
    });
    paintRuler(vCtx, {
      horizontal: false,
      length: vH,
      origin: originY - RULER_SIZE,
      scroll: scrollTop,
      scale,
      step,
      dpr,
      tick,
      label,
    });
  }, [
    scrollLeft,
    scrollTop,
    originX,
    originY,
    scale,
    viewportW,
    viewportH,
    themeTick,
  ]);

  if (viewportW <= 0 || viewportH <= 0) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-30", className)}
      aria-hidden
    >
      <div
        className="absolute left-0 top-0 z-[1] bg-muted/30"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />
      <div
        className="absolute top-0 bg-muted/20"
        style={{ left: RULER_SIZE, width: viewportW - RULER_SIZE, height: RULER_SIZE }}
      >
        <canvas ref={hRef} className="absolute inset-0" />
      </div>
      <div
        className="absolute left-0 bg-muted/20"
        style={{ top: RULER_SIZE, width: RULER_SIZE, height: viewportH - RULER_SIZE }}
      >
        <canvas ref={vRef} className="absolute inset-0" />
      </div>
      <span className="absolute bottom-2 left-0 w-4 text-center text-[9px] tabular-nums text-muted-foreground/70">
        {Math.round(zoomPercent)}
      </span>
    </div>
  );
}
