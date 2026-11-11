"use client";

import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { useCanvasManager } from "@/context/canvas-manager";
import { paintSlide } from "@/lib/canvas/document";
import {
  generateSlideBackgrounds,
  SLIDE_BACKGROUND_SETS,
  SLIDE_SET_COUNT,
  type SlideBackgroundSet,
} from "@/lib/presets/slide-background-sets";
import type { FabricCanvasJSON, SlideItem } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

const emptyCanvas = (): FabricCanvasJSON => ({
  version: "6.0.0",
  objects: [],
  background: "#ffffff",
});

function SlideSetRow({
  set,
  colors,
  onApply,
}: {
  set: SlideBackgroundSet;
  colors: string[];
  onApply: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md py-1 pr-1 pl-1 hover:bg-muted/40">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <div className="flex shrink-0 items-center -space-x-1.5">
          {colors.map((color, index) => (
            <span
              key={`${set.id}-${index}`}
              title={`Slide ${index + 1}: ${color}`}
              className="size-5 rounded-md border border-border/50 shadow-xs"
              style={{ backgroundColor: color, zIndex: colors.length - index }}
            />
          ))}
        </div>
        <span className="truncate text-foreground">{set.label}</span>
      </div>
      <Button type="button" size="xs" variant="secondary" className="rounded-md" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}

export function BackgroundSlideSets() {
  const manager = useCanvasManager();
  const slideCount = useCanvasStore((s) => s.slides.length);
  const [count, setCount] = useState(() =>
    Math.min(SLIDE_SET_COUNT.max, Math.max(2, slideCount || 2)),
  );

  const previews = useMemo(
    () =>
      SLIDE_BACKGROUND_SETS.map((set) => ({
        set,
        colors: generateSlideBackgrounds(set, count),
      })),
    [count],
  );

  const bump = (delta: number) => {
    setCount((current) =>
      Math.min(SLIDE_SET_COUNT.max, Math.max(SLIDE_SET_COUNT.min, current + delta)),
    );
  };

  const applySet = (colors: string[]) => {
    while (useCanvasStore.getState().slides.length < colors.length) {
      const { slides, addSlide } = useCanvasStore.getState();
      addSlide(slides[slides.length - 1]?.id);
    }

    const store = useCanvasStore.getState();
    const slides = store.slides.map((slide, index) => {
      const color = colors[index];
      if (!color) return slide;
      return {
        ...slide,
        canvasJSON: paintSlide(slide.canvasJSON, "background", color),
        thumbnail: null,
      };
    });

    store.setSlides(slides);
    store.setDirty(true);

    const currentIndex = slides.findIndex((slide) => slide.id === store.currentSlideId);
    const liveColor = currentIndex >= 0 ? colors[currentIndex] : undefined;
    if (liveColor && manager) {
      void manager.setBackground({ type: "solid", color: liveColor });
    }
  };

  return (
    <CollapsibleGroup id="background-slide-sets" title="Slide sets">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">Slides</span>
        <div className="flex items-center gap-1 rounded-md bg-muted/50 p-0.5">
          <button
            type="button"
            aria-label="Fewer slides"
            disabled={count <= SLIDE_SET_COUNT.min}
            onClick={() => bump(-1)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
              "hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <Minus className="size-3.5" />
          </button>
          <span className="min-w-6 text-center text-[13px] font-semibold tabular-nums text-foreground">
            {count}
          </span>
          <button
            type="button"
            aria-label="More slides"
            disabled={count >= SLIDE_SET_COUNT.max}
            onClick={() => bump(1)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
              "hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {previews.map(({ set, colors }) => (
          <SlideSetRow key={set.id} set={set} colors={colors} onApply={() => applySet(colors)} />
        ))}
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">
        Pick a count, then apply a set — each slide gets its own background. Missing slides are
        created automatically.
      </p>
    </CollapsibleGroup>
  );
}
