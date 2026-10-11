"use client";

import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

type FrameBox = {
  width: number;
  height: number;
  left: number;
  top: number;
};

/** Static skeleton over the canvas while Ollama generates slides. */
export function GenerateCanvasSkeleton({ frame }: { frame: FrameBox | null }) {
  const status = useCanvasStore((s) => s.genStatus);
  const active = status === "streaming" || status === "building";
  if (!active || !frame) return null;

  return (
    <div
      className="pointer-events-none absolute z-30 overflow-hidden rounded-sm bg-muted shadow-2xl ring-1 ring-border/20"
      style={{
        width: frame.width,
        height: frame.height,
        left: frame.left,
        top: frame.top,
      }}
      aria-hidden
    >
      <div className="absolute inset-0 animate-pulse">
        <div className="absolute top-[6%] left-[8%] h-[2.5%] w-[30%] rounded-sm bg-foreground/10" />
        <div className="absolute top-[6%] right-[8%] h-[2.5%] w-[22%] rounded-sm bg-foreground/10" />
        <div className="absolute top-[36%] left-[8%] h-[6%] w-[70%] rounded-sm bg-foreground/15" />
        <div className="absolute top-[45%] left-[8%] h-[5%] w-[52%] rounded-sm bg-foreground/12" />
        <div className="absolute top-[56%] left-[8%] h-[2%] w-[78%] rounded-sm bg-foreground/8" />
        <div className="absolute top-[60.5%] left-[8%] h-[2%] w-[64%] rounded-sm bg-foreground/8" />
        <div className="absolute top-[65%] left-[8%] h-[2%] w-[48%] rounded-sm bg-foreground/8" />
        <div className="absolute bottom-[8%] left-[8%] h-[3%] w-[40%] rounded-sm bg-foreground/10" />
        <div className="absolute bottom-[8%] right-[8%] h-[3%] w-[18%] rounded-sm bg-foreground/10" />
      </div>
      <div
        className={cn(
          "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full",
          "bg-background/80 px-3 py-1 text-[10px] font-medium text-muted-foreground shadow-sm ring-1 ring-border/40",
        )}
      >
        Generating…
      </div>
    </div>
  );
}
