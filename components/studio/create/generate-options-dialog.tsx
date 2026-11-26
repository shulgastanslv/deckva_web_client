"use client";

import type { ReactNode } from "react";
import { SpinnerGap as Loader2 } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  sidebarSelectTrigger,
  sidebarTextarea,
} from "@/components/canvas/sidebar/sidebar-ui";
import { SlideCountPicker } from "@/components/studio/create/slide-count-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CANVAS_RATIOS, STUDIO_RATIO_KEYS, type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROMPT_LANGUAGES = ["ru", "en", "be"] as const;
const RATIO_OPTIONS = STUDIO_RATIO_KEYS;
const HANDLE_SEEDS = [
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
  return HANDLE_SEEDS[Math.floor(Math.random() * HANDLE_SEEDS.length)]!;
}

function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().replace(/^@+/, "");
  if (!trimmed) return "";
  return `@${trimmed}`;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[12px] font-normal text-muted-foreground">
      {children}
    </span>
  );
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
  showHandle: boolean;
  onShowHandleChange: (value: boolean) => void;
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
  showHandle,
  onShowHandleChange,
  onConfirm,
}: Props) {
  const t = useTranslations("studio.prompt");
  const tc = useTranslations("common");
  const locked = busy;
  const canConfirm = topic.trim().length > 0 && !locked;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl border-border/50 p-0 shadow-none sm:max-w-[400px]">
        <DialogHeader className="px-5 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t("generateDialogTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-5 pt-4 pb-5">
          <textarea
            value={topic}
            disabled={locked}
            rows={2}
            placeholder={t("topicPlaceholder")}
            aria-label={t("topic")}
            className={cn(sidebarTextarea, "min-h-16")}
            onChange={(e) => onTopicChange(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0 space-y-1.5">
              <FieldLabel>{t("language")}</FieldLabel>
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

            <div className="min-w-0 space-y-1.5">
              <FieldLabel>{t("ratio")}</FieldLabel>
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
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>{t("handle")}</FieldLabel>
              <Switch
                checked={showHandle}
                disabled={locked}
                onCheckedChange={onShowHandleChange}
                aria-label={t("showHandle")}
              />
            </div>
            <Input
              value={handle}
              disabled={locked || !showHandle}
              placeholder={t("handlePlaceholder")}
              className={cn(!showHandle && "opacity-50")}
              onChange={(e) => onHandleChange(e.target.value)}
              onBlur={() => {
                const next = normalizeHandle(handle);
                if (next !== handle) onHandleChange(next);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>{t("slidesCount")}</FieldLabel>
            <SlideCountPicker
              value={slidesCount}
              disabled={locked}
              ariaLabel={t("slidesCount")}
              onChange={onSlidesCountChange}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              disabled={locked}
              className="flex-1 font-normal"
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!canConfirm}
              className="flex-1 font-normal"
              onClick={onConfirm}
            >
              {locked ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
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
