"use client";

import { SpinnerGap as Loader2 } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sidebarSelectTrigger,
  sidebarTextarea,
} from "@/components/canvas/sidebar/sidebar-ui";
import { CANVAS_RATIOS, STUDIO_RATIO_KEYS, type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROMPT_LANGUAGES = ["ru", "en", "be"] as const;
const RATIO_OPTIONS = STUDIO_RATIO_KEYS;
const SLIDE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const HANDLE_OPTIONS = [
  "@coach",
  "@founder",
  "@creator",
  "@studio",
  "@brand",
  "@design",
  "@product",
  "@growth",
  "@agency",
  "@maker",
  "@writer",
  "@mentor",
] as const;

export function pickRandomHandle(): string {
  return HANDLE_OPTIONS[Math.floor(Math.random() * HANDLE_OPTIONS.length)]!;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  topic: string;
  onTopicChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  aspectRatio: RatioKey;
  onAspectRatioChange: (value: RatioKey) => void;
  slidesCount: number;
  onSlidesCountChange: (value: number) => void;
  handle: string;
  onHandleChange: (value: string) => void;
  coverUrl: string | null;
  onCoverUrlChange: (value: string | null) => void;
  attaching?: boolean;
  onConfirm: () => void;
};

export function GenerateOptionsDialog({
  open,
  onOpenChange,
  busy = false,
  topic,
  onTopicChange,
  language,
  onLanguageChange,
  aspectRatio,
  onAspectRatioChange,
  slidesCount,
  onSlidesCountChange,
  handle,
  onHandleChange,
  coverUrl,
  onCoverUrlChange,
  attaching = false,
  onConfirm,
}: Props) {
  const t = useTranslations("studio.prompt");
  const tc = useTranslations("common");
  const locked = busy || attaching;
  const dims = CANVAS_RATIOS[aspectRatio];
  const canConfirm = topic.trim().length > 0 && !locked;
  const previewAspect = `${dims.width} / ${dims.height}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[440px]">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t("generateDialogTitle")}
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            {t("generateDialogSubtitle")}
          </p>
        </DialogHeader>

        <div className="max-h-[min(72vh,640px)] space-y-3.5 overflow-y-auto px-5 py-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("topic")}
            </span>
            <textarea
              value={topic}
              disabled={locked}
              rows={3}
              placeholder={t("topicPlaceholder")}
              className={cn(sidebarTextarea, "min-h-[88px]")}
              onChange={(e) => onTopicChange(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("language")}
              </span>
              <Select
                value={language}
                disabled={locked}
                onValueChange={onLanguageChange}
              >
                <SelectTrigger className={sidebarSelectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-1.5">
                  {PROMPT_LANGUAGES.map((code) => (
                    <SelectItem
                      key={code}
                      value={code}
                      className="rounded-md py-2.5 pl-3.5 pr-10 text-[13px] font-normal focus:bg-muted/50"
                    >
                      {code.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("handle")}
              </span>
              <Select
                value={handle}
                disabled={locked}
                onValueChange={onHandleChange}
              >
                <SelectTrigger className={sidebarSelectTrigger}>
                  <SelectValue placeholder={t("handlePlaceholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-1.5">
                  {HANDLE_OPTIONS.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      className="rounded-md py-2.5 pl-3.5 pr-10 text-[13px] font-normal focus:bg-muted/50"
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("ratio")}
            </span>
            <Select
              value={aspectRatio}
              disabled={locked}
              onValueChange={(v) => onAspectRatioChange(v as RatioKey)}
            >
              <SelectTrigger className={sidebarSelectTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-1.5">
                {RATIO_OPTIONS.map((ratio) => {
                  const size = CANVAS_RATIOS[ratio];
                  return (
                    <SelectItem
                      key={ratio}
                      value={ratio}
                      className="rounded-md py-2.5 pl-3.5 pr-10 text-[13px] font-normal focus:bg-muted/50"
                    >
                      {ratio}
                      <span className="ml-2 text-muted-foreground">
                        {size.width}×{size.height}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {dims.width}×{dims.height}px
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("slidesCount")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SLIDE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={locked}
                  onClick={() => onSlidesCountChange(n)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md text-[13px] font-medium tabular-nums transition-colors",
                    slidesCount === n
                      ? "bg-foreground text-background"
                      : "bg-muted/40 text-foreground hover:bg-muted/60",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("cover")}
            </span>
            <ImageUploader
              value={coverUrl}
              onChange={onCoverUrlChange}
              disabled={locked}
              busy={attaching}
              title={t("addCover")}
              hint={t("coverHint")}
              previewAspect={previewAspect}
              className="max-h-56"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              disabled={locked}
              className="flex-1 rounded-md border-none bg-muted/40 text-[13px] shadow-none hover:bg-muted/60"
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!canConfirm}
              className="flex-1 rounded-md text-[13px] shadow-none"
              onClick={onConfirm}
            >
              {locked ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                t("generateConfirm")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
