"use client";

import { useEffect, useRef, useState } from "react";
import { useCanvasManager } from "@/context/canvas-manager";
import { ColorPicker } from "@/components/ui/color-picker";
import { PillSlider } from "@/components/ui/pill-slider";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/useCanvasStore";
import {
  BACKGROUND_PATTERNS,
  drawPatternTile,
  type BackgroundPatternId,
} from "@/lib/canvas/background-patterns";

function PatternSwatch({
  id,
  ink = "#52525b",
  paper = "#f4f4f5",
}: {
  id: BackgroundPatternId;
  ink?: string;
  paper?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pattern = ctx.createPattern(drawPatternTile(id, ink), "repeat");
    if (!pattern) return;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [id, ink, paper]);

  return (
    <canvas
      ref={ref}
      width={96}
      height={96}
      className="pointer-events-none size-full scale-110"
    />
  );
}

export function BackgroundPattern() {
  const manager = useCanvasManager();
  const paletteBackground = useCanvasStore((s) => s.palette.background);
  const [patternId, setPatternId] = useState<BackgroundPatternId | null>(null);
  const [patternBase, setPatternBase] = useState("#ffffff");
  const [patternScale, setPatternScale] = useState(1);
  const [patternOpacity, setPatternOpacity] = useState(0.28);
  const [patternColor, setPatternColor] = useState("#1a1a1a");
  const colorDirty = useRef(false);

  const active = BACKGROUND_PATTERNS.find((pattern) => pattern.id === patternId) ?? null;

  const paintPattern = (
    id: BackgroundPatternId,
    scale: number,
    opacity: number,
    color: string,
    commit: boolean,
  ) => {
    if (!manager) return;
    const current = manager.canvas.backgroundColor;
    const base = typeof current === "string" ? current : patternBase || paletteBackground;
    setPatternBase(base);
    setPatternId(id);
    manager.applyBackgroundPattern(id, { fallback: base, scale, opacity, color, commit });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {BACKGROUND_PATTERNS.map((pattern) => {
          const selected = patternId === pattern.id;
          return (
            <button
              key={pattern.id}
              type="button"
              disabled={!manager}
              title={pattern.label}
              aria-label={pattern.label}
              aria-pressed={selected}
              onClick={() =>
                paintPattern(pattern.id, patternScale, patternOpacity, patternColor, true)
              }
              className={cn(
                "relative aspect-square overflow-hidden rounded-full bg-muted/40 transition-transform disabled:pointer-events-none disabled:opacity-40",
                "hover:scale-105 active:scale-95",
                selected && "outline outline-2 outline-offset-2 outline-foreground",
              )}
            >
              <PatternSwatch id={pattern.id} />
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/85">
              {active.label}
            </span>
            <ColorPicker
              compact
              value={patternColor}
              title="Pattern color"
              onChange={(color) => {
                colorDirty.current = true;
                setPatternColor(color);
                paintPattern(active.id, patternScale, patternOpacity, color, false);
              }}
              onCommit={() => {
                if (!colorDirty.current) return;
                colorDirty.current = false;
                manager?.commit();
              }}
              caption={
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {patternColor}
                </span>
              }
            />
          </div>
          <PillSlider
            label="Size"
            min={0.7}
            max={2}
            step={0.05}
            value={patternScale}
            formatValue={(n) => n.toFixed(2)}
            onValueChange={(scale) => {
              setPatternScale(scale);
              paintPattern(active.id, scale, patternOpacity, patternColor, false);
            }}
            onValueCommit={(scale) =>
              paintPattern(active.id, scale, patternOpacity, patternColor, true)
            }
          />
          <PillSlider
            label="Tone"
            min={0.08}
            max={0.72}
            step={0.02}
            value={patternOpacity}
            formatValue={(n) => n.toFixed(2)}
            onValueChange={(opacity) => {
              setPatternOpacity(opacity);
              paintPattern(active.id, patternScale, opacity, patternColor, false);
            }}
            onValueCommit={(opacity) =>
              paintPattern(active.id, patternScale, opacity, patternColor, true)
            }
          />
        </div>
      ) : (
        <p className="px-0.5 text-[12px] leading-snug text-muted-foreground">
          Pick a texture to overlay on the current fill.
        </p>
      )}
    </div>
  );
}
