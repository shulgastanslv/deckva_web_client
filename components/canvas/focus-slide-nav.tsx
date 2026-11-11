"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSlides } from "@/hooks/use-slides";

/** Prev/next slide controls pinned to the left and right of the canvas in focus mode. */
export function FocusSlideNav() {
  const { currentIndex, slides, canGoPrev, canGoNext, prev, next } = useSlides();

  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3 sm:pl-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canGoPrev}
          onClick={() => void prev()}
          title="Previous slide"
          aria-label="Previous slide"
          className="pointer-events-auto size-10 rounded-md bg-background/90 text-foreground hover:bg-background disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-3 sm:pr-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canGoNext}
          onClick={() => void next()}
          title="Next slide"
          aria-label="Next slide"
          className="pointer-events-auto size-10 rounded-md bg-background/90 text-foreground hover:bg-background disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2">
        <span className="rounded-md bg-background/90 px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
          {currentIndex + 1}/{Math.max(slides.length, 1)}
        </span>
      </div>
    </>
  );
}
