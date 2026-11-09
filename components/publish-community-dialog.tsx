"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Loader2 } from "lucide-react";

import {
  getProjectCommunityMeta,
  publishProjectToCommunity,
  unpublishProject,
  type CommunityProjectMeta,
} from "@/actions/community";
import { saveProjectThumbnails } from "@/actions/projects";
import {
  COMMUNITY_CATEGORIES,
  type CommunityCategory,
} from "@/lib/community/categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProject } from "@/hooks/use-project";
import { THUMB_TARGET_WIDTH } from "@/lib/canvas/thumbnail";
import { renderSlidesToImages } from "@/lib/export/carousel";
import { cn } from "@/lib/utils";

interface PublishCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
}

async function captureThumbnails(): Promise<Array<string | null>> {
  const state = useCanvasStore.getState();
  const slides = state.slides.map((slide) => ({
    id: slide.id,
    canvasJSON: slide.canvasJSON,
  }));
  if (slides.length === 0) return [];

  const width = Math.max(1, state.canvasDimensions.width);
  const thumbs = await renderSlidesToImages(slides, state.canvasDimensions, {
    format: "jpeg",
    quality: 0.72,
    multiplier: Math.min(1, Math.max(0.05, THUMB_TARGET_WIDTH / width)),
  });
  return slides.map(
    (slide) => thumbs.find((shot) => shot.id === slide.id)?.dataUrl ?? null,
  );
}

function formatWhen(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function PublishCommunityDialog({
  open,
  onOpenChange,
  onAuthRequired,
}: PublishCommunityDialogProps) {
  const { status } = useSession();
  const slidesController = useSlidesController();
  const { currentProjectId, persist } = useProject();

  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const slides = useCanvasStore((s) => s.slides);
  const currentRatio = useCanvasStore((s) => s.currentRatio);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [doneLabel, setDoneLabel] = useState("Published");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<CommunityProjectMeta | null>(null);
  const [category, setCategory] = useState<CommunityCategory>("Other");

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setError(null);
    setLoading(false);
    setMeta(null);

    let cancelled = false;
    const fallbackThumb = useCanvasStore.getState().slides[0]?.thumbnail ?? null;
    setPreviewLoading(true);
    setPreviewUrl(fallbackThumb);
    slidesController?.saveCurrent();

    void captureThumbnails()
      .then((thumbnails) => {
        if (!cancelled) {
          setPreviewUrl(
            thumbnails[0] ??
              useCanvasStore.getState().slides[0]?.thumbnail ??
              null,
          );
        }
      })
      .catch((err) => {
        reportError(err, messages.errors.templatePreview);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    if (currentProjectId) {
      void getProjectCommunityMeta(currentProjectId).then((res) => {
        if (cancelled || !res.success) return;
        setMeta(res.meta);
        if (
          res.meta.category &&
          COMMUNITY_CATEGORIES.includes(res.meta.category as CommunityCategory)
        ) {
          setCategory(res.meta.category as CommunityCategory);
        }
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isRepublish = Boolean(meta?.isPublished);

  const handlePublish = async () => {
    if (status !== "authenticated") {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    setError(null);
    slidesController?.saveCurrent();

    try {
      let projectId = currentProjectId;
      if (!projectId) {
        const saved = await persist();
        if (!saved.success || !("projectId" in saved) || !saved.projectId) {
          setError(messages.errors.saveFirst);
          return;
        }
        projectId = saved.projectId;
      }

      const thumbnails = await captureThumbnails();
      const live = useCanvasStore.getState();
      thumbnails.forEach((thumb, index) => {
        const slide = live.slides[index];
        if (slide && thumb) live.updateSlideThumbnail(slide.id, thumb);
      });
      if (thumbnails.length > 0) {
        await saveProjectThumbnails(projectId, thumbnails);
      }

      const res = await publishProjectToCommunity({
        projectId,
        category,
      });
      if (!res.success) {
        setError("error" in res ? res.error : messages.errors.publishCommunity);
        return;
      }

      setDoneLabel(res.republished ? "Republished" : "Submitted for review");
      setDone(true);
      window.dispatchEvent(new CustomEvent("core:community-changed"));
      setTimeout(() => onOpenChange(false), 700);
    } catch (err) {
      reportError(err, messages.errors.publishCommunity);
      setError(messages.errors.publishCommunity);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!currentProjectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await unpublishProject(currentProjectId);
      if (!res.success) {
        setError("error" in res ? res.error : messages.errors.generic);
        return;
      }
      setDoneLabel("Removed from community");
      setDone(true);
      window.dispatchEvent(new CustomEvent("core:community-changed"));
      setTimeout(() => onOpenChange(false), 700);
    } catch (err) {
      reportError(err, messages.errors.generic);
      setError(messages.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const updatedLabel = formatWhen(meta?.communityUpdatedAt ?? meta?.publishedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-3xl p-5 sm:max-w-[400px]">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {isRepublish ? "Update community post" : "Publish to community"}
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            {projectTitle.trim() || "Untitled"} · {slides.length} slide
            {slides.length === 1 ? "" : "s"} · {currentRatio}
          </p>
          {isRepublish && updatedLabel ? (
            <p className="text-[12px] text-muted-foreground">
              Last community update · {updatedLabel}
              {meta?.communityStatus === "PENDING" ? " · pending review" : ""}
            </p>
          ) : null}
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Check className="size-4" />
            </div>
            <p className="text-[13px] font-medium">{doneLabel}</p>
          </div>
        ) : (
          <>
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
            </div>

            <div className="space-y-2">
              <p className="text-[12px] font-medium text-muted-foreground">
                Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMUNITY_CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={cn(
                      "inline-flex h-8 items-center rounded-full px-3 text-[12px] font-medium transition-colors",
                      category === item
                        ? "bg-foreground text-background"
                        : "bg-muted/40 text-foreground hover:bg-muted/60",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[13px] leading-snug text-muted-foreground">
              {isRepublish
                ? "Republish refreshes the public listing with your latest slides and marks who updated it."
                : "Your carousel gets a public link and appears in Community after review."}
            </p>

            {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="h-10 w-full gap-2 rounded-full shadow-none"
                disabled={loading || slides.length === 0}
                onClick={() => void handlePublish()}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isRepublish ? (
                  "Republish"
                ) : (
                  "Publish"
                )}
              </Button>
              {isRepublish ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 w-full rounded-full border-none bg-muted/40 shadow-none hover:bg-muted/60"
                  disabled={loading}
                  onClick={() => void handleUnpublish()}
                >
                  Remove from community
                </Button>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
