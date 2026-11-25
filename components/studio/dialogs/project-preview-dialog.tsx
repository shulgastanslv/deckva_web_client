"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight as ArrowRightIcon,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { getProjectById } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const ASPECT: Record<string, string> = {
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
  "4:3": "4 / 3",
};

export function ProjectPreviewDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("studio.communityPreview");
  const tn = useTranslations("studio.notifications");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<RatioKey | string>("4:5");
  const [slides, setSlides] = useState<Array<string | null>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open || !projectId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setTitle("");
    setSlides([]);
    setIndex(0);

    void getProjectById(projectId).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.success || !("project" in res)) {
        setError("error" in res ? res.error : t("previewUnavailable"));
        return;
      }
      setTitle(res.project.title);
      setAspectRatio(res.project.aspectRatio);
      setSlides(res.project.slides.map((s) => s.thumbnail));
    });

    return () => {
      cancelled = true;
    };
  }, [open, projectId, t]);

  const count = Math.max(slides.length, 1);
  const current = slides[index] ?? null;
  const aspect = ASPECT[aspectRatio] ?? "4 / 5";
  const go = (next: number) => setIndex((next + count) % count);

  const openEditor = () => {
    if (!projectId) return;
    onOpenChange(false);
    router.push(`/studio/editor?project=${projectId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[min(88dvh,820px)] w-full max-w-[min(720px,calc(100%-1.5rem))] flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-[min(720px,calc(100%-2rem))]"
      >
        <DialogTitle className="sr-only">{title || t("title")}</DialogTitle>

        <div className="relative flex min-h-0 flex-1 flex-col bg-muted/20">
          <div className="relative flex min-h-0 flex-1 items-center justify-center gap-2 px-3 py-6 sm:gap-4 sm:px-8">
            <button
              type="button"
              aria-label={t("prevSlide")}
              disabled={count <= 1}
              onClick={() => go(index - 1)}
              className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60 disabled:opacity-30 sm:inline-flex"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div
              className="relative max-h-full w-full max-w-[min(100%,380px)] overflow-hidden rounded-2xl bg-muted/40"
              style={{ aspectRatio: aspect }}
            >
              {loading ? (
                <div className="flex size-full items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex size-full items-center justify-center px-6 text-center text-[13px] text-muted-foreground">
                  {error}
                </div>
              ) : current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current}
                  alt=""
                  className="size-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex size-full items-center justify-center px-6 text-center text-[13px] text-muted-foreground">
                  {t("previewUnavailable")}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label={t("nextSlide")}
              disabled={count <= 1}
              onClick={() => go(index + 1)}
              className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60 disabled:opacity-30 sm:inline-flex"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {count > 1 && !loading && !error ? (
            <div className="shrink-0 overflow-x-auto px-4 pb-4 sm:px-8">
              <div className="mx-auto flex w-max items-end gap-2">
                {slides.map((thumb, i) => (
                  <button
                    key={`${projectId}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative h-14 w-10 shrink-0 overflow-hidden rounded-xl bg-muted/40 transition-all sm:h-16 sm:w-12",
                      i === index
                        ? "ring-2 ring-foreground/80 ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100",
                    )}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="size-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/40 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-foreground">
              {loading ? t("loading") : title || t("title")}
            </p>
            {!loading && slides.length > 0 ? (
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {t("slidesMeta", {
                  count: slides.length,
                  ratio: aspectRatio,
                })}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            disabled={!projectId || Boolean(error)}
            className="shrink-0 rounded-md px-3.5 text-[13px] font-normal"
            onClick={openEditor}
          >
            {tn("openProject")}
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
