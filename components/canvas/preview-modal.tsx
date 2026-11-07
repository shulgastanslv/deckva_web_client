"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useSlidesController } from "@/context/canvas-manager";
import { Canvas as FabricCanvas } from "fabric";
import { withRemoteImageCors } from "@/lib/canvas/image-cors";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";
import {
  SOCIAL_PREVIEW_NETWORKS,
  SocialPhonePreview,
  type SocialPreviewNetwork,
} from "@/components/canvas/social-phone-preview";

interface PreviewModalProps {
  open: boolean;
  initialSlideId: number;
  onClose: () => void;
}

interface SlideSnapshot {
  id: number;
  /** High-res image for the main stage */
  preview: string | null;
  /** Compact image for the filmstrip */
  thumbnail: string | null;
  loading: boolean;
}

/** Target long-edge for the main preview (~retina-friendly on ~860px stage). */
const PREVIEW_LONG_EDGE = 1600;
const THUMB_LONG_EDGE = 280;

export function PreviewModal({ open, initialSlideId, onClose }: PreviewModalProps) {
  const slides = useCanvasStore((s) => s.slides);
  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const postCaption = useCanvasStore((s) => s.postCaption);
  const updateSlideThumbnail = useCanvasStore((s) => s.updateSlideThumbnail);

  const slidesController = useSlidesController();

  const [activeId, setActiveId] = useState(initialSlideId);
  const [snapshots, setSnapshots] = useState<SlideSnapshot[]>([]);
  const [rendering, setRendering] = useState(false);
  const [view, setView] = useState<"slides" | "phone">("slides");
  const [network, setNetwork] = useState<SocialPreviewNetwork>("instagram");

  const isMountedRef = useRef(true);
  const offscreenRef = useRef<FabricCanvas | null>(null);

  const slideIds = slides.map((s) => s.id);
  const activeIdx = Math.max(0, slideIds.indexOf(activeId));
  const aspectRatio = canvasDimensions.width / canvasDimensions.height;
  const author =
    projectTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "")
      .slice(0, 18) || "deckva";

  useEffect(() => {
    if (!open) return;
    isMountedRef.current = true;

    slidesController?.saveCurrent();

    const freshSlides = useCanvasStore.getState().slides;
    const { width, height } = canvasDimensions;
    const longEdge = Math.max(width, height);

    setActiveId(initialSlideId);
    setSnapshots(
      freshSlides.map((s) => ({
        id: s.id,
        preview: null,
        thumbnail: s.thumbnail ?? null,
        loading: !!s.canvasJSON,
      })),
    );

    if (freshSlides.length === 0) return;

    setRendering(true);

    const offscreenEl = document.createElement("canvas");
    offscreenEl.width = width;
    offscreenEl.height = height;

    const offscreenCanvas = new FabricCanvas(offscreenEl, {
      width,
      height,
      renderOnAddRemove: false,
      enableRetinaScaling: false,
    });
    offscreenRef.current = offscreenCanvas;

    const previewMultiplier = Math.min(2, PREVIEW_LONG_EDGE / longEdge);
    const thumbMultiplier = Math.min(1, THUMB_LONG_EDGE / longEdge);

    (async () => {
      for (const slide of freshSlides) {
        if (!isMountedRef.current) break;
        if (!slide.canvasJSON) {
          if (isMountedRef.current) {
            setSnapshots((prev) =>
              prev.map((s) => (s.id === slide.id ? { ...s, loading: false } : s)),
            );
          }
          continue;
        }

        try {
          await offscreenCanvas.loadFromJSON(withRemoteImageCors(slide.canvasJSON));

          if (!offscreenCanvas.backgroundColor) {
            offscreenCanvas.backgroundColor = "#ffffff";
          }
          offscreenCanvas.requestRenderAll();

          const previewURL = offscreenCanvas.toDataURL({
            format: "jpeg",
            multiplier: previewMultiplier,
            quality: 0.92,
          });

          const thumbURL = offscreenCanvas.toDataURL({
            format: "jpeg",
            multiplier: thumbMultiplier,
            quality: 0.72,
          });

          if (!isMountedRef.current) break;

          updateSlideThumbnail(slide.id, thumbURL);
          setSnapshots((prev) =>
            prev.map((s) =>
              s.id === slide.id
                ? { ...s, preview: previewURL, thumbnail: thumbURL, loading: false }
                : s,
            ),
          );
        } catch (error) {
          reportError(error, messages.errors.renderSlide);
          if (isMountedRef.current) {
            setSnapshots((prev) =>
              prev.map((s) => (s.id === slide.id ? { ...s, loading: false } : s)),
            );
          }
        }
      }

      if (offscreenRef.current === offscreenCanvas) {
        offscreenCanvas.dispose();
        offscreenRef.current = null;
      }
      if (isMountedRef.current) setRendering(false);
    })();

    return () => {
      isMountedRef.current = false;
      if (offscreenRef.current) {
        offscreenRef.current.dispose();
        offscreenRef.current = null;
      }
    };
  }, [open, slidesController, initialSlideId, canvasDimensions, updateSlideThumbnail]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setActiveId((id) => {
          const i = slideIds.indexOf(id);
          return slideIds[Math.min(slideIds.length - 1, i + 1)] ?? id;
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setActiveId((id) => {
          const i = slideIds.indexOf(id);
          return slideIds[Math.max(0, i - 1)] ?? id;
        });
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, slideIds, onClose]);

  if (!open) return null;

  const activeSnap = snapshots.find((s) => s.id === activeId);
  const activeImage = activeSnap?.preview ?? activeSnap?.thumbnail ?? null;

  const goPrev = () => {
    setActiveId((id) => slideIds[Math.max(0, slideIds.indexOf(id) - 1)] ?? id);
  };

  const goNext = () => {
    setActiveId((id) => slideIds[Math.min(slideIds.length - 1, slideIds.indexOf(id) + 1)] ?? id);
  };

  const thumbW = 56;
  const thumbH = Math.round(thumbW / aspectRatio);

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in-0 flex-col bg-background/95 backdrop-blur-md duration-200 select-none">
      <div className="grid shrink-0 grid-cols-3 items-center px-6 py-4">
        <div className="flex items-center gap-3">
          {rendering && (
            <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Preparing slides…
            </span>
          )}
        </div>
        <div className="flex items-center justify-self-center rounded-full bg-muted p-0.5 text-[13px]">
          <button
            type="button"
            onClick={() => setView("slides")}
            className={cn(
              "h-7 rounded-full px-3 transition-colors",
              view === "slides" ? "bg-background text-foreground" : "text-muted-foreground",
            )}
          >
            Slides
          </button>
          <button
            type="button"
            onClick={() => setView("phone")}
            className={cn(
              "h-7 rounded-full px-3 transition-colors",
              view === "phone" ? "bg-background text-foreground" : "text-muted-foreground",
            )}
          >
            Phone
          </button>
        </div>
        <div className="flex items-center justify-self-end gap-3">
          <span className="font-mono text-[13px] text-muted-foreground">
            {activeIdx + 1} / {slides.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {view === "phone" ? (
        <div className="flex shrink-0 justify-center px-4 pb-3">
          <div className="flex max-w-[min(100%,42rem)] gap-0.5 overflow-x-auto rounded-full bg-muted/50 p-1">
            {SOCIAL_PREVIEW_NETWORKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNetwork(item.id)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-[12px] font-medium tracking-tight transition-colors",
                  network === item.id
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 items-center justify-center gap-4 px-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="h-10 w-10 shrink-0 rounded-full disabled:opacity-20"
        >
          <ChevronLeft className="size-5" />
        </Button>

        {view === "phone" ? (
          <SocialPhonePreview
            network={network}
            image={activeImage}
            loading={activeSnap?.loading}
            aspectRatio={aspectRatio}
            slideIndex={activeIdx}
            slideTotal={Math.max(slides.length, 1)}
            author={author}
            caption={postCaption}
            onPrev={goPrev}
            onNext={goNext}
          />
        ) : (
          <div
            className="relative overflow-hidden rounded-xl bg-muted/20 ring-1 ring-border/50 transition-all duration-200"
            style={{
              aspectRatio,
              height: aspectRatio < 1 ? "min(72vh, 680px)" : undefined,
              width: aspectRatio >= 1 ? "min(72vw, 860px)" : undefined,
              maxHeight: "72vh",
              maxWidth: "88vw",
            }}
          >
            {activeSnap?.loading && !activeImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={`Slide ${activeIdx + 1}`}
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center border border-dashed border-border/60 bg-background">
                <span className="text-[13px] text-muted-foreground">Empty slide</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={activeIdx === slides.length - 1}
          className="h-10 w-10 shrink-0 rounded-full disabled:opacity-20"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2 overflow-x-auto border-t border-border/40 px-6 py-4">
        {snapshots.map((snap, i) => {
          const isActive = snap.id === activeId;
          const stripSrc = snap.thumbnail ?? snap.preview;
          return (
            <button
              key={snap.id}
              type="button"
              onClick={() => setActiveId(snap.id)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-md ring-2 transition-all duration-150",
                isActive
                  ? "scale-105 ring-foreground"
                  : "ring-transparent opacity-50 hover:opacity-100 hover:ring-border",
              )}
              style={{ width: thumbW, height: thumbH }}
            >
              {snap.loading && !stripSrc ? (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                </div>
              ) : stripSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stripSrc}
                  alt={`Preview ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
