"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Check,
  Plus,
} from "@phosphor-icons/react";
import { useSlides } from "@/hooks/use-slides";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { captureCanvasThumbnail } from "@/lib/canvas/thumbnail";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useScrollEdgeFade } from "@/hooks/use-scroll-edge-fade";
import type { CanvasManager } from "@/lib/canvas/manager";
import { useTranslations } from "next-intl";

const THUMB_HEIGHT = 52;

function captureLiveThumbnail(manager: CanvasManager): string | null {
  return captureCanvasThumbnail(manager.canvas, manager.isDisposed);
}

export function SlideNavigator() {
  const t = useTranslations("editor.slides");
  const manager = useCanvasManager();
  const {
    slides,
    currentSlideId,
    currentIndex,
    canGoPrev,
    canGoNext,
    switchTo,
    next,
    prev,
    add,
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
          {t("slide")}
        </div>
        <div className="text-[13px] tabular-nums text-foreground">
          {currentIndex + 1}
          <span className="text-muted-foreground/40"> / </span>
          {slides.length}
          {markedSlideIds.length > 0 && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {t("markedCount", { n: markedSlideIds.length })}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
 className="h-8 w-8 shrink-0 rounded-md text-muted-foreground"
        onClick={prev}
        disabled={!canGoPrev}
        title={t("prev")}
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
              title={t("dragReorder", { n: idx + 1 })}
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
                aria-label={marked ? t("unmarkSlide", { n: idx + 1 }) : t("markSlide", { n: idx + 1 })}
                title={marked ? t("unmark") : t("markHint")}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  skipClick.current = true;
                  toggleMarkedSlide(slide.id);
                  window.setTimeout(() => {
                    skipClick.current = false;
                  }, 0);
                }}
                className={`absolute left-1 top-1 flex size-3.5 items-center justify-center rounded-md border ${
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
          title={t("add")}
          aria-label={t("add")}
          className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground dark:bg-muted/35 dark:hover:bg-muted/50"
        >
          <Plus className="size-6 stroke-[1.5]" />
        </button>
      </div>

      <Button
        variant="ghost"
        size="icon"
 className="h-8 w-8 shrink-0 rounded-md text-muted-foreground"
        onClick={next}
        disabled={!canGoNext}
        title={t("next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </footer>
  );
}
