"use client";

import React, { useRef, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Plus,
} from "@phosphor-icons/react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAttachCanvas, useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { CodeBlockEditDialog } from "@/components/canvas/code-block-edit-dialog";
import { CanvasRulers, RULER_SIZE } from "@/components/canvas/canvas-rulers";
import { clampZoom } from "@/components/canvas/zoom-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PADDING = 56;
/** Space between slides in the horizontal strip. */
const SLIDE_GAP = 56;
/** Canva-style page bar height reserved above the slide stage. */
export const PAGE_BAR_H = 44;
/** Re-rasterize once the stretched bitmap would look soft. */
const ZOOM_STRETCH = 1.35;
const ZOOM_SETTLE_MS = 90;

type StageFrame = {
  scale: number;
  width: number;
  height: number;
  top: number;
  contentWidth: number;
  contentHeight: number;
  nativeW: number;
  nativeH: number;
  /** Left edge of slide 0. */
  originX: number;
  gap: number;
  count: number;
  /** Width of the trailing “add slide” slot. */
  addSlotW: number;
};

type ZoomAnchor = {
  clientX: number;
  clientY: number;
  relX: number;
  relY: number;
};

function stageFrame(
  viewportW: number,
  viewportH: number,
  nativeW: number,
  nativeH: number,
  zoomPercent: number,
  slideCount: number,
  pageBarH = 0,
): StageFrame {
  const availW = Math.max(viewportW - PADDING * 2 - RULER_SIZE, 1);
  const availH = Math.max(viewportH - PADDING * 2 - pageBarH - RULER_SIZE, 1);
  const fit = Math.min(availW / nativeW, availH / nativeH);
  const scale = Math.max(0.05, fit * (zoomPercent / 100));
  const width = Math.max(1, Math.round(nativeW * scale));
  const height = Math.max(1, Math.round(nativeH * scale));
  const count = Math.max(1, slideCount);
  const addSlotW = 112;
  const pagesWidth =
    count * width + Math.max(0, count - 1) * SLIDE_GAP + SLIDE_GAP + addSlotW;
  const stackH = height + pageBarH;
  const contentWidth = Math.max(viewportW, pagesWidth + PADDING * 2 + RULER_SIZE);
  const contentHeight = Math.max(viewportH, stackH + PADDING * 2 + RULER_SIZE);
  const stackTop = (contentHeight - stackH) / 2;
  return {
    scale,
    width,
    height,
    top: Math.max(stackTop + pageBarH, RULER_SIZE + pageBarH + 8),
    contentWidth,
    contentHeight,
    nativeW,
    nativeH,
    originX: Math.max((contentWidth - pagesWidth) / 2, RULER_SIZE + PADDING / 2),
    gap: SLIDE_GAP,
    count,
    addSlotW,
  };
}

function slideLeft(frame: StageFrame, index: number): number {
  return frame.originX + index * (frame.width + frame.gap);
}

/** 0 at fit zoom, 1 when neighbors should fully haze out. */
function neighborHaze(zoomPercent: number): number {
  return Math.min(1, Math.max(0, (zoomPercent - 100) / 90));
}

export function CanvasView({
  pageChrome = null,
}: {
  /** Canva-style controls docked to the top edge of the slide stage. */
  pageChrome?: React.ReactNode;
} = {}) {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const attach = useAttachCanvas();
  const manager = useCanvasManager();
  const slidesController = useSlidesController();

  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const zoom = useCanvasStore((s) => s.zoom);
  const slides = useCanvasStore((s) => s.slides);
  const currentSlideId = useCanvasStore((s) => s.currentSlideId);
  const isLoadingProject = useCanvasStore((s) => s.isLoadingProject);
  const isGeneratingCarousel = useCanvasStore((s) => s.isGeneratingCarousel);
  const handActive = useCanvasStore((s) => s.handActive);
  const eraserActive = useCanvasStore((s) => s.eraserActive);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [hoveredSlideId, setHoveredSlideId] = useState<number | null>(null);
  const panning = handActive || spaceDown;
  const panningRef = useRef(false);
  panningRef.current = panning;
  const managerRef = useRef(manager);
  managerRef.current = manager;
  const slidesControllerRef = useRef(slidesController);
  slidesControllerRef.current = slidesController;
  const zoomingRef = useRef(false);
  const settledScaleRef = useRef(0);
  const settledNativeRef = useRef("");
  const prevFrameRef = useRef<StageFrame | null>(null);
  const prevActiveLeftRef = useRef(0);
  const anchorRef = useRef<ZoomAnchor | null>(null);
  const lastFocusedIdRef = useRef(currentSlideId);
  const scrollRafRef = useRef(0);

  const pageBarH = pageChrome ? PAGE_BAR_H : 0;
  const currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.id === currentSlideId),
  );
  const haze = neighborHaze(zoom);

  const frame = useMemo(() => {
    if (viewport.width <= 0 || viewport.height <= 0) return null;
    return stageFrame(
      viewport.width,
      viewport.height,
      canvasDimensions.width,
      canvasDimensions.height,
      zoom,
      slides.length,
      pageBarH,
    );
  }, [viewport, canvasDimensions, zoom, slides.length, pageBarH]);
  const frameRef = useRef(frame);
  frameRef.current = frame;

  const activeLeft = frame ? slideLeft(frame, currentIndex) : 0;
  const frameReady = frame !== null;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = (width: number, height: number) => {
      setViewport((prev) =>
        Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5
          ? prev
          : { width, height },
      );
    };

    measure(container.clientWidth, container.clientHeight);
    const ro = new ResizeObserver(() => {
      measure(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!frameReady) return;
    const el = canvasElementRef.current;
    const initial = frameRef.current;
    if (!el || !initial) return;
    return attach(el, {
      scale: initial.scale,
      nativeW: initial.nativeW,
      nativeH: initial.nativeH,
    });
  }, [frameReady, attach]);

  useLayoutEffect(() => {
    if (!frame || !manager) return;
    const nativeKey = `${frame.nativeW}x${frame.nativeH}`;
    const settled = settledScaleRef.current;
    const stretch = settled > 0 ? frame.scale / settled : 1;
    const cssOnly =
      zoomingRef.current &&
      settledNativeRef.current === nativeKey &&
      stretch < ZOOM_STRETCH &&
      stretch > 1 / ZOOM_STRETCH;

    if (cssOnly) {
      manager.canvas.setDimensions(
        { width: frame.width, height: frame.height },
        { cssOnly: true },
      );
    } else {
      manager.setViewportScale(frame.scale, frame.nativeW, frame.nativeH);
      settledScaleRef.current = frame.scale;
      settledNativeRef.current = nativeKey;
    }

    const container = containerRef.current;
    const stage = stageRef.current;
    const prev = prevFrameRef.current;
    const prevLeft = prevActiveLeftRef.current;
    const anchor = anchorRef.current;
    if (container && stage && anchor && stage.offsetWidth > 0) {
      const rect = stage.getBoundingClientRect();
      container.scrollLeft += rect.left + anchor.relX * rect.width - anchor.clientX;
      container.scrollTop += rect.top + anchor.relY * rect.height - anchor.clientY;
      anchorRef.current = null;
      setScroll({ left: container.scrollLeft, top: container.scrollTop });
    } else if (
      container &&
      prev &&
      (prev.width !== frame.width ||
        prev.height !== frame.height ||
        prev.top !== frame.top) &&
      prevLeft === activeLeft
    ) {
      // Zoom / resize only — keep the same point under the viewport center.
      const relX =
        prev.width > 0
          ? (container.scrollLeft + container.clientWidth / 2 - prevLeft) / prev.width
          : 0.5;
      const relY =
        prev.height > 0
          ? (container.scrollTop + container.clientHeight / 2 - prev.top) / prev.height
          : 0.5;
      container.scrollLeft = activeLeft + relX * frame.width - container.clientWidth / 2;
      container.scrollTop = frame.top + relY * frame.height - container.clientHeight / 2;
      setScroll({ left: container.scrollLeft, top: container.scrollTop });
    }
    prevFrameRef.current = frame;
    prevActiveLeftRef.current = activeLeft;
  }, [frame, manager, activeLeft]);

  const scrollSlideToCenter = (index: number, behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current;
    const live = frameRef.current;
    if (!container || !live || index < 0) return;
    const left = slideLeft(live, index);
    const maxX = Math.max(0, container.scrollWidth - container.clientWidth);
    const maxY = Math.max(0, container.scrollHeight - container.clientHeight);
    const nextLeft = Math.max(0, Math.min(maxX, left + live.width / 2 - container.clientWidth / 2));
    const nextTop = Math.max(0, Math.min(maxY, live.top + live.height / 2 - container.clientHeight / 2));
    container.scrollTo({ left: nextLeft, top: nextTop, behavior });
    if (behavior === "auto") {
      setScroll({ left: container.scrollLeft, top: container.scrollTop });
    }
  };

  // Toolbar prev/next (and any non-click focus change) — bring slide to the middle.
  useEffect(() => {
    if (lastFocusedIdRef.current === currentSlideId) return;
    lastFocusedIdRef.current = currentSlideId;
    scrollSlideToCenter(currentIndex, "smooth");
  }, [currentSlideId, currentIndex]);

  useEffect(() => {
    if (!manager) return;
    if (eraserActive) manager.eraser.enable();
    else manager.eraser.disable();
    return () => manager.eraser.disable();
  }, [manager, eraserActive]);

  useEffect(() => {
    if (!manager) return;
    if (eraserActive && !spaceDown) return;
    const canvas = manager.canvas;
    const previous = {
      selection: canvas.selection,
      skipTargetFind: canvas.skipTargetFind,
      defaultCursor: canvas.defaultCursor,
      hoverCursor: canvas.hoverCursor,
    };
    if (panning) {
      canvas.selection = false;
      canvas.skipTargetFind = true;
      canvas.defaultCursor = grabbing ? "grabbing" : "grab";
      canvas.hoverCursor = grabbing ? "grabbing" : "grab";
      canvas.setCursor(grabbing ? "grabbing" : "grab");
    }
    return () => {
      canvas.selection = previous.selection;
      canvas.skipTargetFind = previous.skipTargetFind;
      canvas.defaultCursor = previous.defaultCursor;
      canvas.hoverCursor = previous.hoverCursor;
      canvas.setCursor(previous.defaultCursor);
      if (eraserActive && !panning) {
        canvas.selection = false;
        canvas.defaultCursor = "cell";
        canvas.hoverCursor = "cell";
        canvas.setCursor("cell");
      }
    };
  }, [manager, panning, grabbing, eraserActive, spaceDown]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const drag = { active: false, x: 0, y: 0, left: 0, top: 0 };

    const typing = () => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement)) return false;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable) {
        return true;
      }
      const active = manager?.getActiveObject() as { isEditing?: boolean } | null;
      return Boolean(active?.isEditing);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (typing()) return;
      if (event.code === "Space") {
        if (event.repeat) return;
        event.preventDefault();
        setSpaceDown(true);
        return;
      }
      if (event.code === "KeyH" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        useCanvasStore.getState().toggleHand();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpaceDown(false);
    };
    const onBlur = () => setSpaceDown(false);

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !panningRef.current) return;
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.left = container.scrollLeft;
      drag.top = container.scrollTop;
      setGrabbing(true);
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      container.scrollLeft = drag.left - (event.clientX - drag.x);
      container.scrollTop = drag.top - (event.clientY - drag.y);
      event.preventDefault();
    };
    const onPointerUp = () => {
      if (!drag.active) return;
      drag.active = false;
      setGrabbing(false);
    };

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        setScroll({ left: container.scrollLeft, top: container.scrollTop });
      });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    container.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("scroll", onScroll, { passive: true });
    setScroll({ left: container.scrollLeft, top: container.scrollTop });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      container.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollRafRef.current);
    };
  }, [manager]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let settle = 0;
    let gesture = 0;
    let pending: number | null = null;
    let stepLock = false;
    let stepAcc = 0;
    let stepReset = 0;

    const commit = () => {
      zoomingRef.current = false;
      const live = managerRef.current;
      const next = frameRef.current;
      if (!live || !next) return;
      live.setViewportScale(next.scale, next.nativeW, next.nativeH);
      settledScaleRef.current = next.scale;
      settledNativeRef.current = `${next.nativeW}x${next.nativeH}`;
    };

    const wheelPixels = (event: WheelEvent, axis: "x" | "y", fallback: number) => {
      const delta = axis === "x" ? event.deltaX : event.deltaY;
      if (event.deltaMode === 1) return delta * 16;
      if (event.deltaMode === 2) return delta * fallback;
      return delta;
    };

    // Physical Ctrl/Cmd — not trackpad pinch (browsers also set ctrlKey on pinch).
    let modHeld = false;
    const onModDown = (event: KeyboardEvent) => {
      if (event.key === "Control" || event.key === "Meta") modHeld = true;
    };
    const onModUp = (event: KeyboardEvent) => {
      if (event.key === "Control" || event.key === "Meta") modHeld = false;
    };
    const onModBlur = () => {
      modHeld = false;
    };

    const canBrowseStrip = () => container.scrollWidth > container.clientWidth + 1;

    const zoomAroundCursor = (event: WheelEvent) => {
      if (managerRef.current?.crop.active) return;
      event.preventDefault();
      const stage = stageRef.current;
      if (stage && stage.offsetWidth > 0 && stage.offsetHeight > 0) {
        const rect = stage.getBoundingClientRect();
        anchorRef.current = {
          clientX: event.clientX,
          clientY: event.clientY,
          relX: (event.clientX - rect.left) / rect.width,
          relY: (event.clientY - rect.top) / rect.height,
        };
      }
      const pixels = wheelPixels(event, "y", container.clientHeight);
      const base = pending ?? useCanvasStore.getState().zoom;
      pending = clampZoom(base * Math.exp(-pixels * 0.0016));
      zoomingRef.current = true;
      const id = ++gesture;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (gesture !== id) return;
        commit();
      }, ZOOM_SETTLE_MS);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = pending;
        pending = null;
        if (next == null) return;
        if (next !== useCanvasStore.getState().zoom) useCanvasStore.getState().setZoom(next);
        else anchorRef.current = null;
      });
    };

    const browseStrip = (delta: number) => {
      if (!canBrowseStrip() || delta === 0) return false;
      container.scrollLeft += delta;
      return true;
    };

    const stepSlide = (dir: 1 | -1) => {
      const { slides: list, currentSlideId: id } = useCanvasStore.getState();
      const index = list.findIndex((slide) => slide.id === id);
      const next = list[index + dir];
      if (!next) return;
      const live = frameRef.current;
      if (live) {
        const left = slideLeft(live, index + dir);
        const maxX = Math.max(0, container.scrollWidth - container.clientWidth);
        const maxY = Math.max(0, container.scrollHeight - container.clientHeight);
        container.scrollTo({
          left: Math.max(0, Math.min(maxX, left + live.width / 2 - container.clientWidth / 2)),
          top: Math.max(0, Math.min(maxY, live.top + live.height / 2 - container.clientHeight / 2)),
          behavior: "smooth",
        });
      }
      lastFocusedIdRef.current = next.id;
      void slidesControllerRef.current?.switchTo(next.id);
    };

    const stepSlideFromWheel = (event: WheelEvent) => {
      // Consume Ctrl/Cmd + wheel so the browser does not page-zoom.
      event.preventDefault();
      const dy = wheelPixels(event, "y", container.clientWidth);
      const dx = wheelPixels(event, "x", container.clientWidth);
      const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (delta === 0) return;

      stepAcc += delta;
      window.clearTimeout(stepReset);
      stepReset = window.setTimeout(() => {
        stepAcc = 0;
      }, 180);
      if (Math.abs(stepAcc) < 48 || stepLock) return;

      const dir: 1 | -1 = stepAcc > 0 ? 1 : -1;
      stepAcc = 0;
      stepLock = true;
      stepSlide(dir);
      window.setTimeout(() => {
        stepLock = false;
      }, 260);
    };

    const onWheel = (event: WheelEvent) => {
      // Ctrl/Cmd held → next / previous slide (discrete).
      if (modHeld) {
        stepSlideFromWheel(event);
        return;
      }

      const dy = wheelPixels(event, "y", container.clientWidth);
      const dx = wheelPixels(event, "x", container.clientWidth);

      // Horizontal trackpad swipe browses the strip (or native-pans when zoomed in).
      // Do this before the pinch/ctrlKey zoom branch so two-finger pan stays browse.
      if (Math.abs(dx) > Math.abs(dy) && !(event.ctrlKey || event.metaKey)) {
        if (browseStrip(dx)) {
          event.preventDefault();
          return;
        }
        return;
      }

      // Vertical wheel + trackpad pinch → zoom around the cursor.
      // (Pinch arrives with ctrlKey set; physical Ctrl is handled above via modHeld.)
      zoomAroundCursor(event);
    };

    const onPointerDown = () => {
      if (!zoomingRef.current) return;
      window.clearTimeout(settle);
      commit();
    };

    window.addEventListener("keydown", onModDown);
    window.addEventListener("keyup", onModUp);
    window.addEventListener("blur", onModBlur);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onModDown);
      window.removeEventListener("keyup", onModUp);
      window.removeEventListener("blur", onModBlur);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("pointerdown", onPointerDown, true);
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.clearTimeout(stepReset);
    };
  }, []);

  const focusSlide = (id: number) => {
    const index = slides.findIndex((slide) => slide.id === id);
    if (index < 0) return;
    // Scroll first so an off-screen left/right slide lands in the middle.
    scrollSlideToCenter(index, "smooth");
    if (id === currentSlideId) return;
    lastFocusedIdRef.current = id;
    void slidesController?.switchTo(id);
  };

  const addSlideAtEnd = () => {
    if (!slidesController) return;
    slidesController.saveCurrent();
    const lastId = useCanvasStore.getState().slides.at(-1)?.id;
    const newId = useCanvasStore.getState().addSlide(lastId);
    void slidesController.switchTo(newId);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        className={cn(
          "absolute inset-0 overflow-auto bg-background/20",
          panning && (grabbing ? "cursor-grabbing" : "cursor-grab"),
        )}
        style={{ scrollbarGutter: "stable", overflowAnchor: "none" }}
      >
        <div
          className="relative"
          style={
            frame
              ? { width: frame.contentWidth, height: frame.contentHeight }
              : { width: "100%", height: "100%" }
          }
        >
          {pageChrome && frame ? (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                left: activeLeft,
                top: frame.top - PAGE_BAR_H,
                width: frame.width,
                height: PAGE_BAR_H,
              }}
            >
              <div className="pointer-events-auto h-full w-full">{pageChrome}</div>
            </div>
          ) : null}

          {frame
            ? slides.map((slide, index) => {
                if (slide.id === currentSlideId) return null;
                const left = slideLeft(frame, index);
                const hovered = hoveredSlideId === slide.id;
                const opacity = Math.max(0.08, (hovered ? 0.95 : 0.78) * (1 - haze * 0.92));
                const blurPx = haze * (hovered ? 4 : 12);
                return (
                  <button
                    key={slide.id}
                    type="button"
                    title={`Edit slide ${index + 1}`}
                    aria-label={`Edit slide ${index + 1}`}
                    onMouseEnter={() => setHoveredSlideId(slide.id)}
                    onMouseLeave={() =>
                      setHoveredSlideId((id) => (id === slide.id ? null : id))
                    }
                    onClick={() => focusSlide(slide.id)}
                    className="absolute overflow-hidden bg-white shadow-2xl ring-1 ring-border/20 will-change-[opacity,filter]"
                    style={{
                      width: frame.width,
                      height: frame.height,
                      left,
                      top: frame.top,
                      opacity,
                      filter: blurPx > 0.15 ? `blur(${blurPx}px)` : undefined,
                      transform: haze > 0 ? `scale(${1 - haze * 0.015})` : undefined,
                      transition:
                        "opacity 220ms ease, filter 220ms ease, transform 220ms ease",
                      zIndex: hovered ? 2 : 0,
                    }}
                  >
                    {slide.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.thumbnail}
                        alt=""
                        className="pointer-events-none h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[13px] tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                    {haze > 0.2 ? (
                      <span
                        className="pointer-events-none absolute inset-0 bg-background/40"
                        style={{ opacity: haze * 0.55 }}
                      />
                    ) : null}
                  </button>
                );
              })
            : null}

          <div
            ref={stageRef}
            className="absolute z-[1] bg-white shadow-2xl ring-1 ring-border/20 touch-none"
            style={
              frame
                ? {
                    width: frame.width,
                    height: frame.height,
                    left: activeLeft,
                    top: frame.top,
                  }
                : { visibility: "hidden" }
            }
            onDragOver={(event) => {
              if ([...event.dataTransfer.types].includes("Files")) event.preventDefault();
            }}
            onDrop={(event) => {
              const file = event.dataTransfer.files?.[0];
              if (!file || !manager) return;
              event.preventDefault();
              manager.objects.fillSplitFromFile(file);
            }}
          >
            <canvas ref={canvasElementRef} />
          </div>

          {frame ? (
            <button
              type="button"
              title="Add slide"
              aria-label="Add slide"
              onClick={addSlideAtEnd}
              className={cn(
                "absolute z-[1] flex size-28 items-center justify-center rounded-full",
                "bg-muted/60 text-muted-foreground dark:bg-muted/35",
                "transition-colors hover:bg-muted/80 hover:text-foreground dark:hover:bg-muted/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
              )}
              style={{
                left: slideLeft(frame, frame.count),
                top: frame.top + (frame.height - 112) / 2,
                opacity: Math.max(0.5, 1 - haze * 0.75),
                filter: haze > 0.15 ? `blur(${haze * 6}px)` : undefined,
                transition: "opacity 220ms ease, filter 220ms ease, background-color 150ms ease",
              }}
            >
              <Plus className="size-8 stroke-[1.5]" />
            </button>
          ) : null}
        </div>
        <CodeBlockEditDialog />
      </div>
    </div>
  );
}
