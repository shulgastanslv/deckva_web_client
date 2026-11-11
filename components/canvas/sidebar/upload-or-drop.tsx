"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Image as ImagePlus,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type UploadOrDropProps = {
  onFiles: (files: FileList | File[]) => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  multiple?: boolean;
  accept?: string;
  title?: string;
  hint?: string;
  busyLabel?: string;
  icon?: ReactNode;
  className?: string;
  minHeightClass?: string;
};

/** Shared image dropzone used across Elements / Assets / Background. */
export function UploadOrDrop({
  onFiles,
  disabled,
  busy,
  multiple = false,
  accept = "image/*",
  title,
  hint,
  busyLabel,
  icon,
  className,
  minHeightClass = "min-h-28",
}: UploadOrDropProps) {
  const t = useTranslations("editor.elements");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const idle = !disabled && !busy;
  const resolvedTitle = title ?? t("uploadOrDrop");
  const resolvedHint = hint ?? t("pngJpg");
  const resolvedBusy = busyLabel ?? t("uploading");

  const take = (files: FileList | File[] | null | undefined) => {
    if (!files || (files instanceof FileList ? files.length === 0 : files.length === 0)) return;
    void onFiles(files);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={!idle}
        onChange={(event) => {
          take(event.target.files);
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
          if (!idle) return;
          take(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl px-4 py-6 text-center transition-colors disabled:opacity-40",
          minHeightClass,
          "bg-muted/50 dark:bg-muted/30",
          dragging
            ? "bg-muted/40 ring-1 ring-foreground/20"
            : "hover:bg-muted/80 dark:hover:bg-muted/40",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          (icon ?? <ImagePlus className="size-5 shrink-0 text-muted-foreground" />)
        )}
        <span className="text-[13px] font-medium text-foreground/80">
          {busy ? resolvedBusy : resolvedTitle}
        </span>
        {resolvedHint ? <span className="text-[13px] text-muted-foreground">{resolvedHint}</span> : null}
      </button>
    </>
  );
}
