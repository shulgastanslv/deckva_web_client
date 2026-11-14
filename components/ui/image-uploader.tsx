"use client";

import { useRef, useState } from "react";
import {
  Image as ImagePlus,
  SpinnerGap as Loader2,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  /** External busy (parent still processing). */
  busy?: boolean;
  accept?: string;
  title?: string;
  hint?: string;
  replaceLabel?: string;
  removeLabel?: string;
  /** CSS aspect ratio for the filled preview, e.g. "4 / 5". */
  previewAspect?: string;
  className?: string;
  maxEdge?: number;
};

/** Single-image dropzone with preview, replace, and clear. */
export function ImageUploader({
  value,
  onChange,
  disabled,
  busy: busyProp,
  accept = "image/*",
  title,
  hint,
  replaceLabel,
  removeLabel,
  previewAspect = "4 / 5",
  className,
  maxEdge = 1600,
}: ImageUploaderProps) {
  const t = useTranslations("common");
  const te = useTranslations("editor.elements");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const busy = Boolean(busyProp || reading);
  const idle = !disabled && !busy;

  const resolvedTitle = title ?? te("uploadOrDrop");
  const resolvedHint = hint ?? te("pngJpg");
  const resolvedReplace = replaceLabel ?? t("replace");
  const resolvedRemove = removeLabel ?? t("remove");

  const take = async (files: FileList | File[] | null | undefined) => {
    if (!files || files.length === 0 || !idle) return;
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) {
      toast.error(te("pngJpg"));
      return;
    }
    setReading(true);
    try {
      const dataUrl = await fileToDataUrl(file, { maxEdge });
      onChange(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : te("uploadOrDrop"));
    } finally {
      setReading(false);
    }
  };

  if (value) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-muted/40",
          className,
        )}
        style={{ aspectRatio: previewAspect }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-2.5 pt-8">
          <button
            type="button"
            disabled={!idle}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-background/90 px-2.5 text-[12px] font-normal text-foreground shadow-none transition-colors hover:bg-background disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              resolvedReplace
            )}
          </button>
          <button
            type="button"
            disabled={!idle}
            aria-label={resolvedRemove}
            onClick={() => onChange(null)}
            className="inline-flex size-8 items-center justify-center rounded-md bg-background/90 text-foreground shadow-none transition-colors hover:bg-background disabled:opacity-50"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={!idle}
          onChange={(event) => {
            void take(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={!idle}
        onChange={(event) => {
          void take(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={!idle}
        title={resolvedTitle}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (idle) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void take(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl px-4 py-6 text-center transition-colors disabled:opacity-40",
          "min-h-28 bg-muted/50 dark:bg-muted/30",
          dragging
            ? "bg-muted/40 ring-1 ring-foreground/20"
            : "hover:bg-muted/80 dark:hover:bg-muted/40",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="size-5 shrink-0 text-muted-foreground" />
        )}
        <span className="text-[13px] font-medium text-foreground/80">
          {busy ? te("uploading") : resolvedTitle}
        </span>
        {resolvedHint ? (
          <span className="text-[13px] text-muted-foreground">{resolvedHint}</span>
        ) : null}
      </button>
    </>
  );
}
