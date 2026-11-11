"use client";

import { useEffect, useRef, useState } from "react";
import {
  Image as ImagePlus,
  SpinnerGap as Loader2,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { submitFeedback } from "@/actions/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const IMAGE_MAX = 4;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Couldn't read that file"));
    };
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });
}

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("dialogs.feedback");
  const te = useTranslations("errors");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setImages([]);
    setBusy(false);
    setError(null);
    setSent(false);
  }, [open]);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const next = [...images];
    for (const file of Array.from(files)) {
      if (next.length >= IMAGE_MAX) break;
      if (!file.type.startsWith("image/")) {
        setError(te("feedbackImages"));
        continue;
      }
      try {
        next.push(await readFileAsDataUrl(file));
      } catch {
        setError(te("readImage"));
      }
    }
    setImages(next.slice(0, IMAGE_MAX));
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await submitFeedback({ message, images });
    setBusy(false);
    if (!res.success) {
      setError((res as { error: string }).error);
      return;
    }
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[400px]"
      >
        <button
          type="button"
          aria-label={t("closeAria")}
          onClick={() => onOpenChange(false)}
          className="absolute top-2.5 right-2.5 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>

        <div className="px-5 pt-5 pb-1 pr-12">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
              {t("title")}
            </DialogTitle>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </DialogHeader>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[14px] font-semibold text-foreground">
              {t("thanksTitle")}
            </p>
            <p className="max-w-xs text-[13px] text-muted-foreground">
              {t("thanksBody")}
            </p>
            <Button
              type="button"
              className="mt-1 h-10 rounded-md px-5 text-[13px] font-medium shadow-none"
              onClick={() => onOpenChange(false)}
            >
              {t("close")}
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3 px-5 pt-3 pb-5"
            onSubmit={(event) => void onSubmit(event)}
          >
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("placeholder")}
              rows={5}
              required
              className="min-h-[120px] resize-y rounded-2xl border-none bg-muted/40 px-3.5 py-3 text-[13px] shadow-none placeholder:text-muted-foreground/70 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20"
            />

            {images.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {images.map((src, index) => (
                  <div
                    key={`${index}-${src.slice(0, 24)}`}
                    className="relative size-16 overflow-hidden rounded-2xl bg-muted/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label={t("removeImage")}
                      onClick={() =>
                        setImages((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-1 right-1 grid size-5 place-items-center rounded-md bg-background/90 text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-2">
              <div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  onChange={(event) => void addFiles(event.target.files)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className={cn(
                    "h-9 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-medium shadow-none hover:bg-muted/60",
                  )}
                  disabled={busy || images.length >= IMAGE_MAX}
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus className="size-3.5" />
                  {t("addImages")}
                </Button>
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="h-9 rounded-md px-4 text-[13px] font-medium shadow-none"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : t("send")}
              </Button>
            </div>

            {error ? (
              <p className="text-[13px] text-destructive">{error}</p>
            ) : null}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
