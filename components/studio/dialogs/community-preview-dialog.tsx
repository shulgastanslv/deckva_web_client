"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  SpinnerGap as Loader2,
  PencilSimple as Pencil,
  Sparkle as Sparkles,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  cloneCommunityProject,
  getCommunityPreview,
  type CommunityPreview,
} from "@/actions/community";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";

const ASPECT: Record<string, string> = {
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
  "4:3": "4 / 3",
};

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

export function CommunityPreviewDialog({
  projectId,
  open,
  onOpenChange,
  onAuthRequired,
}: {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
}) {
  const t = useTranslations("studio.communityPreview");
  const tb = useTranslations("studio.browse");
  const router = useRouter();
  const { status } = useSession();
  const [preview, setPreview] = useState<CommunityPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open || !projectId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreview(null);
    setIndex(0);

    void getCommunityPreview(projectId)
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setError("error" in res ? res.error : messages.errors.loadCommunity);
          return;
        }
        setPreview(res.preview);
      })
      .catch((err) => {
        if (cancelled) return;
        reportError(err, messages.errors.loadCommunity);
        setError(messages.errors.loadCommunity);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, projectId]);

  useEffect(() => {
    if (!open || !preview) return;
    const count = Math.max(preview.slides.length, 1);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % count);
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + count) % count);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, preview]);

  const slides = preview?.slides ?? [];
  const count = Math.max(slides.length, 1);
  const current = slides[index] ?? null;
  const aspect = ASPECT[preview?.aspectRatio ?? "4:5"] ?? "4 / 5";
  const updatedAt = formatWhen(
    preview?.communityUpdatedAt ?? preview?.publishedAt ?? null,
  );

  const go = (next: number) => setIndex((next + count) % count);

  const customize = async () => {
    if (!preview) return;
    if (status !== "authenticated") {
      onAuthRequired?.();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await cloneCommunityProject(preview.id);
      if (!res.success) {
        setError("error" in res ? res.error : messages.errors.duplicateProject);
        return;
      }
      onOpenChange(false);
      router.push(`/studio/editor?project=${res.projectId}`);
    } catch (err) {
      reportError(err, messages.errors.duplicateProject);
      setError(messages.errors.duplicateProject);
    } finally {
      setBusy(false);
    }
  };

  const editOwn = () => {
    if (!preview) return;
    onOpenChange(false);
    router.push(`/studio/editor?project=${preview.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex h-[min(92dvh,880px)] w-full max-w-[min(1100px,calc(100%-1.5rem))] flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-[min(1100px,calc(100%-2rem))]",
        )}
      >
        <DialogTitle className="sr-only">
          {preview?.title ?? t("title")}
        </DialogTitle>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="relative flex min-h-0 flex-1 flex-col bg-muted/20">
            <div className="relative flex min-h-0 flex-1 items-center justify-center gap-2 px-3 py-6 sm:gap-4 sm:px-8">
              <button
                type="button"
                aria-label={t("prevSlide")}
                disabled={count <= 1}
                onClick={() => go(index - 1)}
                className="hidden size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60 disabled:opacity-30 sm:inline-flex"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div
                className="relative max-h-full w-full max-w-[min(100%,420px)] overflow-hidden rounded-2xl bg-muted/40"
                style={{ aspectRatio: aspect }}
              >
                {loading ? (
                  <div className="flex size-full items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
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
                className="hidden size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60 disabled:opacity-30 sm:inline-flex"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {count > 1 ? (
              <div className="shrink-0 overflow-x-auto px-4 pb-5 sm:px-8">
                <div className="mx-auto flex w-max items-end gap-2">
                  {slides.map((thumb, i) => (
                    <button
                      key={`${preview?.id}-${i}`}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={cn(
                        "relative h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/40 transition-all sm:h-20 sm:w-14",
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

          <aside className="flex w-full shrink-0 flex-col justify-between gap-6 bg-background px-5 py-6 sm:px-6 lg:w-[320px] lg:bg-muted/10">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
                  {preview?.category ?? tb("community")}
                </p>
                <h2 className="mt-1.5 text-[22px] leading-tight font-semibold tracking-tight text-foreground">
                  {preview?.title ?? (loading ? t("loading") : t("template"))}
                </h2>
                {preview ? (
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {t("slidesMeta", {
                      count: preview.slideCount,
                      ratio: preview.aspectRatio,
                    })}
                  </p>
                ) : null}
              </div>

              {preview ? (
                <div className="space-y-3 rounded-2xl bg-muted/30 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={preview.authorImage ?? undefined}
                        alt=""
                      />
                      <AvatarFallback className="text-[11px]">
                        {(preview.authorName ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {preview.authorName ?? tb("creator")}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {t("author")}
                      </p>
                    </div>
                  </div>
                  {updatedAt ? (
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {preview.updatedByName
                        ? t("updatedBy", {
                            when: updatedAt,
                            name: preview.updatedByName,
                          })
                        : tb("updatedWhen", { when: updatedAt })}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <p className="text-[13px] text-destructive">{error}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              {preview?.isOwner ? (
                <>
                  <Button
                    type="button"
                    disabled={!preview || busy || loading}
                    onClick={editOwn}
                    className="h-11 w-full gap-2 rounded-md text-[14px] font-medium shadow-none"
                  >
                    <Pencil className="size-5" />
                    {t("editMyTemplate")}
                  </Button>
                  <p className="text-center text-[12px] leading-relaxed text-muted-foreground">
                    {t("ownerHint")}
                  </p>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={!preview || busy || loading}
                    onClick={() => void customize()}
                    className="h-11 w-full gap-2 rounded-md text-[14px] font-medium shadow-none"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-5" />
                    )}
                    {t("customize")}
                  </Button>
                  <p className="text-center text-[12px] leading-relaxed text-muted-foreground">
                    {t("opensCopyHint")}
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
