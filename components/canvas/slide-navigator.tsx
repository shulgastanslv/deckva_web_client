"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Copy, Plus, Trash2 } from "lucide-react";
import { useSlides } from "@/hooks/use-slides";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { captureCanvasThumbnail } from "@/lib/canvas/thumbnail";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useScrollEdgeFade } from "@/hooks/use-scroll-edge-fade";
import type { CanvasManager } from "@/lib/canvas/manager";

const THUMB_HEIGHT = 52;

function captureLiveThumbnail(manager: CanvasManager): string | null {
  return captureCanvasThumbnail(manager.canvas, manager.isDisposed);
}

export function SlideNavigator() {
  const manager = useCanvasManager();
  const {
    slides,
    currentSlideId,
    currentIndex,
    canGoPrev,
    canGoNext,
    canRemove,
    switchTo,
    next,
    prev,
    add,
    duplicate,
    remove,
    move,
    reorder,
  } = useSlides();

  const slidesController = useSlidesController();

  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const updateSlideThumbnail = useCanvasStore((s) => s.updateSlideThumbnail);
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const toggleMarkedSlide = useCanvasStore((s) => s.toggleMarkedSlide);

  const activeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<number | null>(null);
  const skipClick = useRef(false);
  const [liveThumb, setLiveThumb] = useState<string | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const { maskImage } = useScrollEdgeFade(stripRef, {
    axis: "horizontal",
    size: 32,
    deps: [slides.length, currentSlideId],
  });

  const aspect = canvasDimensions.width / canvasDimensions.height;
  const thumbW = Math.round(THUMB_HEIGHT * aspect);

  useEffect(() => {
    setLiveThumb(null);
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentSlideId]);

  useEffect(() => {
    if (!manager) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const dataUrl = captureLiveThumbnail(manager);
        if (!dataUrl) return;
        const id = useCanvasStore.getState().currentSlideId;
        setLiveThumb(dataUrl);
        updateSlideThumbnail(id, dataUrl);
      }, 280);
    };

    refresh();
    const unsubs = [
      manager.on("change", refresh),
      manager.on("load", refresh),
    ];

    return () => {
      if (timer) clearTimeout(timer);
      unsubs.forEach((off) => off());
    };
  }, [manager, canvasDimensions.width, updateSlideThumbnail, currentIndex, slides.length]);

  return (
    <footer className="z-10 flex h-[72px] shrink-0 items-center gap-2 border-t border-border/50 bg-background px-3 select-none sm:gap-3 sm:px-3.5">
      <div className="w-12 shrink-0 leading-tight sm:w-[72px]">
        <div className="text-[13px] uppercase tracking-wide text-muted-foreground">
          Slide
        </div>
        <div className="text-[13px] tabular-nums text-foreground">
          {currentIndex + 1}
          <span className="text-muted-foreground/40"> / </span>
          {slides.length}
          {markedSlideIds.length > 0 && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {markedSlideIds.length} marked
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground"
        onClick={prev}
        disabled={!canGoPrev}
        title="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={stripRef}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={
          maskImage
            ? { maskImage, WebkitMaskImage: maskImage }
            : undefined
        }
      >
        {slides.map((slide, idx) => {
          const isActive = currentSlideId === slide.id;
          const marked = markedSlideIds.includes(slide.id);
          const thumbSrc =
            isActive && liveThumb ? liveThumb : (slide.thumbnail ?? null);

          return (
            <button
              key={slide.id}
              ref={isActive ? activeRef : undefined}
              type="button"
              draggable
              onDragStart={(event) => {
                dragId.current = slide.id;
                skipClick.current = true;
                slidesController?.saveCurrent();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(slide.id));
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverId(slide.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const from = dragId.current;
                dragId.current = null;
                setOverId(null);
                if (from != null && from !== slide.id) reorder(from, slide.id);
              }}
              onDragEnd={() => {
                dragId.current = null;
                setOverId(null);
                window.setTimeout(() => {
                  skipClick.current = false;
                }, 0);
              }}
              onClick={() => {
                if (skipClick.current) return;
                switchTo(slide.id);
              }}
              title={`Slide ${idx + 1}. Drag to reorder.`}
              className={`relative shrink-0 cursor-grab overflow-hidden rounded-md border bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing ${
                isActive
                  ? "border-foreground/70"
                  : "border-transparent opacity-70 hover:opacity-100"
              } ${overId === slide.id && dragId.current !== slide.id ? "ring-2 ring-foreground/50" : ""}`}
              style={{ width: thumbW, height: THUMB_HEIGHT }}
            >
              {thumbSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbSrc}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[13px] tabular-nums text-muted-foreground">
                  {idx + 1}
                </span>
              )}
              <span
                role="checkbox"
                aria-checked={marked}
                aria-label={marked ? `Unmark slide ${idx + 1}` : `Mark slide ${idx + 1}`}
                title={marked ? "Unmark" : "Mark for font, palette, and export"}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  skipClick.current = true;
                  toggleMarkedSlide(slide.id);
                  window.setTimeout(() => {
                    skipClick.current = false;
                  }, 0);
                }}
                className={`absolute left-1 top-1 flex size-3.5 items-center justify-center rounded-full border ${
                  marked
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 bg-background/80 text-transparent"
                }`}
              >
                <Check className="size-2.5" />
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={add}
          title="Add slide"
          className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-border/70 px-2.5 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-[13px]">Add</span>
        </button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground"
        onClick={next}
        disabled={!canGoNext}
        title="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="flex shrink-0 items-center gap-0.5 border-l border-border/50 pl-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2 text-[13px] text-muted-foreground"
          onClick={() => move("left")}
          disabled={!canGoPrev}
          title="Move left"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Left</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2 text-[13px] text-muted-foreground"
          onClick={() => move("right")}
          disabled={!canGoNext}
          title="Move right"
        >
          <span className="hidden sm:inline">Right</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2 text-[13px] text-muted-foreground"
          onClick={() => duplicate()}
          title="Duplicate slide"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Duplicate</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2 text-[13px] text-muted-foreground hover:text-destructive"
          onClick={() => remove(currentSlideId)}
          disabled={!canRemove}
          title="Delete slide"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </footer>
  );
}
