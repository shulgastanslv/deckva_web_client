"use client";

import React, { useRef, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAttachCanvas, useCanvasManager } from "@/context/canvas-manager";
import { clampZoom } from "@/components/canvas/zoom-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PADDING = 48;
/** Re-rasterize once the stretched bitmap would look soft. */
const ZOOM_STRETCH = 1.35;
const ZOOM_SETTLE_MS = 90;

type StageFrame = {
  scale: number;
  width: number;
  height: number;
  left: number;
  top: number;
  contentWidth: number;
  contentHeight: number;
  nativeW: number;
  nativeH: number;
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
): StageFrame {
  const availW = Math.max(viewportW - PADDING * 2, 1);
  const availH = Math.max(viewportH - PADDING * 2, 1);
  const fit = Math.min(availW / nativeW, availH / nativeH);
  const scale = Math.max(0.05, fit * (zoomPercent / 100));
  const width = Math.max(1, Math.round(nativeW * scale));
  const height = Math.max(1, Math.round(nativeH * scale));
  const contentWidth = Math.max(viewportW, width + PADDING * 2);
  const contentHeight = Math.max(viewportH, height + PADDING * 2);
  return {
    scale,
    width,
    height,
    left: (contentWidth - width) / 2,
    top: (contentHeight - height) / 2,
    contentWidth,
    contentHeight,
    nativeW,
    nativeH,
  };
}

export function CanvasView() {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const attach = useAttachCanvas();
  const manager = useCanvasManager();

  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const zoom = useCanvasStore((s) => s.zoom);
  const isLoadingProject = useCanvasStore((s) => s.isLoadingProject);
  const handActive = useCanvasStore((s) => s.handActive);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const panning = handActive || spaceDown;
  const panningRef = useRef(false);
  panningRef.current = panning;
  const managerRef = useRef(manager);
  managerRef.current = manager;
  const zoomingRef = useRef(false);
  const settledScaleRef = useRef(0);
  const settledNativeRef = useRef("");
  const prevFrameRef = useRef<StageFrame | null>(null);
  const anchorRef = useRef<ZoomAnchor | null>(null);

  const frame = useMemo(() => {
    if (viewport.width <= 0 || viewport.height <= 0) return null;
    return stageFrame(
      viewport.width,
      viewport.height,
      canvasDimensions.width,
      canvasDimensions.height,
      zoom,
    );
  }, [viewport, canvasDimensions, zoom]);
  const frameRef = useRef(frame);
  frameRef.current = frame;

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
    const anchor = anchorRef.current;
    if (container && stage && anchor && stage.offsetWidth > 0) {
      const rect = stage.getBoundingClientRect();
      container.scrollLeft += rect.left + anchor.relX * rect.width - anchor.clientX;
      container.scrollTop += rect.top + anchor.relY * rect.height - anchor.clientY;
      anchorRef.current = null;
    } else if (
      container &&
      prev &&
      (prev.width !== frame.width ||
        prev.height !== frame.height ||
        prev.left !== frame.left ||
        prev.top !== frame.top)
    ) {
      const relX = prev.width > 0 ? (container.scrollLeft + container.clientWidth / 2 - prev.left) / prev.width : 0.5;
      const relY = prev.height > 0 ? (container.scrollTop + container.clientHeight / 2 - prev.top) / prev.height : 0.5;
      container.scrollLeft = frame.left + relX * frame.width - container.clientWidth / 2;
      container.scrollTop = frame.top + relY * frame.height - container.clientHeight / 2;
    }
    prevFrameRef.current = frame;
  }, [frame, manager]);

  useEffect(() => {
    if (!manager) return;
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
    };
  }, [manager, panning, grabbing]);

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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    container.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      container.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [manager]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let settle = 0;
    let gesture = 0;
    let pending: number | null = null;

    const commit = () => {
      zoomingRef.current = false;
      const live = managerRef.current;
      const next = frameRef.current;
      if (!live || !next) return;
      live.setViewportScale(next.scale, next.nativeW, next.nativeH);
      settledScaleRef.current = next.scale;
      settledNativeRef.current = `${next.nativeW}x${next.nativeH}`;
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
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
      const pixels =
        event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * container.clientHeight : event.deltaY;
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

    const onPointerDown = () => {
      if (!zoomingRef.current) return;
      window.clearTimeout(settle);
      commit();
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("pointerdown", onPointerDown, true);
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-0 flex-1 overflow-auto bg-muted/20",
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
        <div
          ref={stageRef}
          className="absolute bg-white shadow-2xl ring-1 ring-border/20"
          style={
            frame
              ? { width: frame.width, height: frame.height, left: frame.left, top: frame.top }
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
      </div>
      {isLoadingProject && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-muted/40"
          aria-busy="true"
          aria-label="Loading project"
        >
          <div
            className="flex flex-col gap-4 bg-background p-8 shadow-2xl ring-1 ring-border/20"
            style={{
              aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}`,
              width: frame && frame.width > 0 ? frame.width : undefined,
              height: frame && frame.height > 0 ? frame.height : undefined,
              maxWidth: "calc(100% - 96px)",
              maxHeight: "calc(100% - 96px)",
            }}
          >
            <Skeleton className="h-8 w-2/3 rounded-md" />
            <Skeleton className="min-h-24 w-full flex-1 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}
