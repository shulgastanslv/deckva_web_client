"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CAROUSEL_ASPECT_OPTIONS,
  type CarouselStartForm,
} from "@/lib/studio/start-blocks";
import { cn } from "@/lib/utils";

const fieldClass = cn(
  "h-10 w-full rounded-2xl bg-muted/30 px-3.5 text-[14px] text-foreground outline-none",
  "placeholder:text-muted-foreground/70 focus:bg-muted/40",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

export function StudioCarouselDialog({
  open,
  onOpenChange,
  onSubmit,
  busy,
  error,
  defaultHandle = "@deckva",
  defaultLanguage = "en",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: CarouselStartForm) => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
  defaultHandle?: string;
  defaultLanguage?: string;
}) {
  const [topic, setTopic] = useState("");
  const [aspectRatio, setAspectRatio] =
    useState<CarouselStartForm["aspectRatio"]>("4:5");
  const [slidesCount, setSlidesCount] = useState(7);
  const [language, setLanguage] = useState(defaultLanguage);
  const [handle, setHandle] = useState(defaultHandle);
  const [cover, setCover] = useState("");

  useEffect(() => {
    if (!open) return;
    setTopic("");
    setAspectRatio("4:5");
    setSlidesCount(7);
    setLanguage(defaultLanguage);
    setHandle(defaultHandle);
    setCover("");
  }, [open, defaultHandle, defaultLanguage]);

  const canSubmit =
    !busy &&
    topic.trim().length >= 2 &&
    language.trim().length >= 2 &&
    handle.trim().length >= 2 &&
    slidesCount >= 4 &&
    slidesCount <= 10;

  const submit = () => {
    if (!canSubmit) return;
    void onSubmit({
      topic: topic.trim(),
      aspectRatio,
      slidesCount,
      language: language.trim(),
      handle: handle.trim(),
      cover: cover.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(32rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Carousel
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Fill in the generation settings for a new slide deck.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-5">
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">
              Topic
            </span>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              disabled={busy}
              placeholder="Topic for the carousel…"
              className={cn(
                "field-sizing-content min-h-[72px] w-full resize-none rounded-2xl bg-muted/30 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground outline-none",
                "placeholder:text-muted-foreground/70 focus:bg-muted/40",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">
                Aspect ratio
              </span>
              <select
                value={aspectRatio}
                disabled={busy}
                onChange={(e) =>
                  setAspectRatio(e.target.value as CarouselStartForm["aspectRatio"])
                }
                className={fieldClass}
              >
                {CAROUSEL_ASPECT_OPTIONS.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">
                Slides (4–10)
              </span>
              <input
                type="number"
                min={4}
                max={10}
                value={slidesCount}
                disabled={busy}
                onChange={(e) => setSlidesCount(Number(e.target.value) || 4)}
                className={fieldClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">
                Language
              </span>
              <input
                value={language}
                disabled={busy}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="en"
                maxLength={8}
                className={fieldClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">
                Handle
              </span>
              <input
                value={handle}
                disabled={busy}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@brand"
                maxLength={64}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">
              Cover URL
            </span>
            <input
              value={cover}
              disabled={busy}
              onChange={(e) => setCover(e.target.value)}
              placeholder="Empty = placeholder"
              className={fieldClass}
            />
          </label>

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="h-10 w-full rounded-full text-[13px] font-medium"
            disabled={!canSubmit}
            onClick={submit}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Generate carousel
                <ArrowRight className="size-3.5 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
