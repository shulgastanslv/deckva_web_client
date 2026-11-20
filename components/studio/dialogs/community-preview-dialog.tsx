"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Check,
  SpinnerGap as Loader2,
  ArrowRight as ArrowRightIcon,
  ShareNetwork as Share,
  Sparkle as Sparkles,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  cloneCommunityProject,
  getCommunityPreview,
  listRelatedCommunityProjects,
  type CommunityPreview,
  type CommunityProjectListItem,
} from "@/actions/community";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import {
  communityCategoryChipClass,
  communityCategoryTone,
} from "@/lib/community/category-style";
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

function shareUrlFor(projectId: string) {
  if (typeof window === "undefined") return `/view/${projectId}`;
  return `${window.location.origin}/view/${projectId}`;
}

export function CommunityPreviewDialog({
  projectId,
  open,
  onOpenChange,
  onAuthRequired,
  onSelectProject,
}: {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
  /** Switch preview to another community template (related). */
  onSelectProject?: (id: string) => void;
}) {
  const t = useTranslations("studio.communityPreview");
  const tb = useTranslations("studio.browse");
  const router = useRouter();
  const { status } = useSession();
  const [preview, setPreview] = useState<CommunityPreview | null>(null);
  const [related, setRelated] = useState<CommunityProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !projectId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreview(null);
    setRelated([]);
    setIndex(0);
    setCopied(false);

    void getCommunityPreview(projectId)
      .then((res) => {
        if (cancelled) return;
        if (res.success === false) {
          setError(res.error);
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

    let cancelled = false;
    setRelatedLoading(true);

    void listRelatedCommunityProjects({
      projectId: preview.id,
      category: preview.category,
      take: 8,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.success) setRelated(res.projects);
        else setRelated([]);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, preview]);

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
      if (res.success === false) {
        setError(res.error);
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

  const share = async () => {
    if (!preview) return;
    const url = shareUrlFor(preview.id);
    try {
      await navigator.clipboard.writeText(url);
      trackEvent("share_link_copied", {
        projectId: preview.id,
        source: "community_preview",
      });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      reportError(
        new Error(messages.errors.copyLink),
        messages.errors.copyLink,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex h-[min(92dvh,920px)] w-full max-w-[min(1100px,calc(100%-1.5rem))] flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-[min(1100px,calc(100%-2rem))]",
        )}
      >
        <DialogTitle className="sr-only">
          {preview?.title ?? t("title")}
        </DialogTitle>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
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
                  className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60 disabled:opacity-30 sm:inline-flex"
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

            <aside className="flex w-full shrink-0 flex-col justify-between gap-6 overflow-y-auto bg-background px-5 py-6 sm:px-6 lg:w-[320px] lg:bg-muted/10">
              <div className="min-w-0 space-y-4">
                <div className="min-w-0">
                  <p
                    className={cn(
                      communityCategoryChipClass,
                      communityCategoryTone(
                        preview?.category ?? tb("community"),
                      ),
                    )}
                  >
                    {preview?.category ?? tb("community")}
                  </p>
                  <h2 className="mt-1.5 break-words text-[22px] leading-tight font-semibold tracking-tight wrap-anywhere text-foreground">
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

                {preview?.description ? (
                  <p className="max-w-full break-words text-[14px] leading-relaxed wrap-anywhere text-foreground/90">
                    {preview.description}
                  </p>
                ) : null}

                {preview && preview.keyMoments.length > 0 ? (
                  <div className="min-w-0 space-y-2">
                    <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
                      {t("keyMoments")}
                    </p>
                    <ul className="space-y-1.5">
                      {preview.keyMoments.map((moment) => (
                        <li
                          key={moment}
                          className="flex min-w-0 gap-2 text-[13px] leading-snug text-foreground"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/50" />
                          <span className="min-w-0 break-words wrap-anywhere">
                            {moment}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {preview ? (
                  <div className="space-y-3 rounded-2xl bg-muted/30 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={preview.authorImage ?? undefined}
                          alt=""
                          referrerPolicy="no-referrer"
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
                  <Button
                    type="button"
                    disabled={!preview || busy || loading}
                    onClick={editOwn}
                    className="w-full gap-2 rounded-md text-[14px] font-medium shadow-none"
                  >
                    {t("editMyTemplate")}
                    <ArrowRightIcon className="size-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!preview || busy || loading}
                    onClick={() => void customize()}
                    className="w-full gap-2 rounded-md text-[14px] font-medium shadow-none"
                  >
                    {t("customize")}
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRightIcon className="size-5" />
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  disabled={!preview || loading}
                  onClick={() => void share()}
                  className="w-full gap-2 rounded-md border-none bg-muted/40 text-[14px] font-normal shadow-none hover:bg-muted/60"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      {t("shareCopied")}
                    </>
                  ) : (
                    <>
                      <Share className="size-4" />
                      {t("share")}
                    </>
                  )}
                </Button>

                <p className="text-center text-[12px] leading-relaxed text-muted-foreground">
                  {preview?.isOwner ? t("ownerHint") : t("opensCopyHint")}
                </p>
              </div>
            </aside>
          </div>

          {preview ? (
            <div className="shrink-0 border-t border-border/40 bg-background px-4 py-4 sm:px-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
                  {t("related")}
                  {preview.category ? (
                    <span className="ml-1.5 font-normal normal-case">
                      · {preview.category}
                    </span>
                  ) : null}
                </p>
                {relatedLoading ? (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                ) : null}
              </div>

              {related.length === 0 && !relatedLoading ? (
                <p className="text-[13px] text-muted-foreground">
                  {t("relatedEmpty")}
                </p>
              ) : (
                <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
                  {related.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectProject?.(item.id)}
                      className="group flex w-[112px] shrink-0 flex-col gap-1.5 text-left"
                    >
                      <span className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border/30 transition-opacity group-hover:opacity-90">
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="size-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
                            {item.title.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-2 text-[12px] leading-snug font-medium text-foreground">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
