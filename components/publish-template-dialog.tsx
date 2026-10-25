"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publishTemplate } from "@/actions/templates";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { THUMB_TARGET_WIDTH } from "@/lib/canvas/thumbnail";
import { renderSlidesToImages } from "@/lib/export/carousel";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/lib/templates/categories";

interface PublishTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
}

async function captureTemplateAssets(): Promise<{
  previewUrl: string | null;
  thumbnails: Array<string | null>;
}> {
  const state = useCanvasStore.getState();
  const slides = state.slides.map((slide) => ({
    id: slide.id,
    canvasJSON: slide.canvasJSON,
  }));
  if (slides.length === 0) return { previewUrl: null, thumbnails: [] };

  const width = Math.max(1, state.canvasDimensions.width);
  const thumbs = await renderSlidesToImages(slides, state.canvasDimensions, {
    format: "jpeg",
    quality: 0.72,
    multiplier: Math.min(1, Math.max(0.05, THUMB_TARGET_WIDTH / width)),
  });
  const thumbnails = slides.map(
    (slide) => thumbs.find((shot) => shot.id === slide.id)?.dataUrl ?? null,
  );

  let previewUrl = thumbnails[0] ?? null;
  try {
    const [preview] = await renderSlidesToImages(slides.slice(0, 1), state.canvasDimensions, {
      format: "jpeg",
      quality: 0.92,
      multiplier: Math.min(1, 720 / width),
    });
    previewUrl = preview?.dataUrl ?? previewUrl;
  } catch (err) {
    console.error(err);
  }

  return { previewUrl, thumbnails };
}

export function PublishTemplateDialog({
  open,
  onOpenChange,
  onAuthRequired,
}: PublishTemplateDialogProps) {
  const { status } = useSession();
  const slidesController = useSlidesController();

  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const slides = useCanvasStore((s) => s.slides);

  const [title, setTitle] = useState(projectTitle);
  const [category, setCategory] = useState<TemplateCategory>(TEMPLATE_CATEGORIES[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewUrl(null);
    slidesController?.saveCurrent();

    void captureTemplateAssets()
      .then((assets) => {
        if (!cancelled) setPreviewUrl(assets.previewUrl);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setPreviewUrl(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, slidesController]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setTitle(useCanvasStore.getState().projectTitle);
      setCategory(TEMPLATE_CATEGORIES[0]);
      setDone(false);
      setError(null);
      setLoading(false);
    }
    onOpenChange(next);
  };

  const handlePublish = async () => {
    if (status !== "authenticated") {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    setError(null);
    slidesController?.saveCurrent();

    let preview = previewUrl;
    let thumbnails: Array<string | null> | undefined;
    try {
      const assets = await captureTemplateAssets();
      preview = assets.previewUrl ?? preview;
      thumbnails = assets.thumbnails;
      setPreviewUrl(preview);
      const live = useCanvasStore.getState();
      assets.thumbnails.forEach((thumb, index) => {
        const slide = live.slides[index];
        if (slide && thumb) live.updateSlideThumbnail(slide.id, thumb);
      });
    } catch (err) {
      console.error(err);
    }

    const state = useCanvasStore.getState();
    const res = await publishTemplate({
      title: title.trim() || state.projectTitle,
      category,
      aspectRatio: state.currentRatio,
      canvasJSON: {
        slides: state.slides.map((s) => s.canvasJSON),
      },
      thumbnails,
      previewUrl: preview,
    });

    setLoading(false);

    if (res.success === false) {
      setError(res.error);
      return;
    }

    setDone(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("core:templates-changed"));
    }
    setTimeout(() => onOpenChange(false), 700);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[360px] rounded-2xl border-none p-5 gap-5 shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Publish
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            {slides.length} slide{slides.length === 1 ? "" : "s"} · {currentRatio}
          </p>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Check className="size-4" />
            </div>
            <p className="text-[13px] font-medium">Published</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl bg-muted/40">
                <div className="flex h-36 w-full items-center justify-center">
                  {previewLoading && !previewUrl ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="First slide preview"
                      className="max-h-36 max-w-full object-contain"
                    />
                  ) : (
                    <p className="px-4 text-center text-[13px] text-muted-foreground">
                      First slide preview unavailable
                    </p>
                  )}
                </div>
                <p className="px-3 py-2 text-[13px] text-muted-foreground">
                  Preview is the first slide
                </p>
              </div>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Template name"
                disabled={loading}
                className="h-8 rounded-full border-0 bg-muted/50 px-4 text-[13px] shadow-none"
              />

              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "inline-flex h-8 items-center rounded-full px-3 text-[13px] transition-colors",
                      category === item
                        ? "bg-foreground text-background"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-[13px] text-destructive">{error}</p>}

            <Button
              type="button"
              className="w-full rounded-full gap-2"
              size="lg"
              disabled={!title.trim() || loading}
              onClick={() => void handlePublish()}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Publish template"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
