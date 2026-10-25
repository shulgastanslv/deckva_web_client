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

function PatternSwatch({ id }: { id: BackgroundPatternId }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pattern = ctx.createPattern(drawPatternTile(id, "#f4f4f4"), "repeat");
    if (!pattern) return;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [id]);

  return <canvas ref={ref} width={96} height={64} className="h-full w-full" />;
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
    <div className="space-y-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {BACKGROUND_PATTERNS.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            disabled={!manager}
            title={pattern.label}
            onClick={() => paintPattern(pattern.id, patternScale, patternOpacity, patternColor, true)}
            className={cn(
              "overflow-hidden rounded-lg border bg-background transition-colors hover:border-foreground/30 disabled:pointer-events-none disabled:opacity-40",
              patternId === pattern.id ? "border-foreground/50" : "border-border/60",
            )}
          >
            <span className="block aspect-[3/2] w-full">
              <PatternSwatch id={pattern.id} />
            </span>
            <span className="block truncate px-1 py-1 text-center text-[10px] leading-none text-muted-foreground">
              {pattern.label}
            </span>
          </button>
        ))}
      </div>
      {patternId ? (
        <div className="flex flex-col gap-1.5 px-0.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-[10px] text-muted-foreground">Color</span>
            <ColorPicker
              compact
              value={patternColor}
              title="Pattern color"
              onChange={(color) => {
                colorDirty.current = true;
                setPatternColor(color);
                paintPattern(patternId, patternScale, patternOpacity, color, false);
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
              paintPattern(patternId, scale, patternOpacity, patternColor, false);
            }}
            onValueCommit={(scale) =>
              paintPattern(patternId, scale, patternOpacity, patternColor, true)
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
              paintPattern(patternId, patternScale, opacity, patternColor, false);
            }}
            onValueCommit={(opacity) =>
              paintPattern(patternId, patternScale, opacity, patternColor, true)
            }
          />
        </div>
      ) : null}
    </div>
  );
}
