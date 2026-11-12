"use client";

import { useEffect, useState } from "react";
import { SpinnerGap as Loader2 } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const RATIOS = Object.keys(CANVAS_RATIOS) as RatioKey[];
const SLIDE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type BlankProjectInput = {
  title: string;
  aspectRatio: RatioKey;
  slidesCount: number;
};

const fieldClass =
  "h-9 w-full rounded-md border-none bg-muted/40 px-3 text-[13px] text-foreground shadow-none outline-none placeholder:text-muted-foreground focus:bg-muted/50";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  onSubmit: (input: BlankProjectInput) => void | Promise<void>;
};

export function BlankProjectDialog({
  open,
  onOpenChange,
  busy = false,
  onSubmit,
}: Props) {
  const t = useTranslations("studio.create");
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<RatioKey>("4:5");
  const [slidesCount, setSlidesCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setAspectRatio("4:5");
    setSlidesCount(5);
    setSubmitting(false);
  }, [open]);

  const handleSubmit = async () => {
    if (submitting || busy) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim() || t("untitledCarousel"),
        aspectRatio,
        slidesCount,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const locked = submitting || busy;
  const dims = CANVAS_RATIOS[aspectRatio];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[400px]">
        <DialogHeader className="space-y-1 px-5 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {t("blankDialogTitle")}
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground">
            {t("blankDialogSubtitle")}
          </p>
        </DialogHeader>

        <div className="space-y-3.5 px-5 py-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("projectName")}
            </span>
            <input
              className={fieldClass}
              value={title}
              disabled={locked}
              placeholder={t("untitledCarousel")}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmit();
              }}
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("ratio")}
            </span>
            <Select
              value={aspectRatio}
              disabled={locked}
              onValueChange={(v) => setAspectRatio(v as RatioKey)}
            >
              <SelectTrigger
                className={cn(
                  "h-9 w-full rounded-md border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-1.5">
                {RATIOS.map((ratio) => {
                  const size = CANVAS_RATIOS[ratio];
                  return (
                    <SelectItem
                      key={ratio}
                      value={ratio}
                      className="rounded-xl text-[13px]"
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
                  onClick={() => setSlidesCount(n)}
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

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              disabled={locked}
              className="h-9 flex-1 rounded-md border-none bg-muted/40 text-[13px] shadow-none hover:bg-muted/60"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={locked}
              className="h-9 flex-1 rounded-md border-none bg-primary text-[13px] text-primary-foreground shadow-none hover:bg-primary/90"
              onClick={() => void handleSubmit()}
            >
              {locked ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("createProject")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
