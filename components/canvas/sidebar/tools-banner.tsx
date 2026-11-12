"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolsBanner({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) {
  const t = useTranslations("editor.tools");

  return (
    <div
      className={cn(
        "rounded-md bg-background ring-1 ring-border/40 dark:ring-border/50",
        className,
      )}
    >
      <div className="space-y-2.5 p-2.5">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tools/tools-banner.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover object-[28%_35%]"
          />
        </div>

        <div className="space-y-3 px-1 pb-0.5 pt-0.5">
          <div className="space-y-1">
            <p className="text-[13px] font-semibold tracking-tight text-foreground">
              {t("bannerTitle")}
            </p>
            <p className="text-[12px] leading-snug text-muted-foreground">
              {t("bannerBody")}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-md border-none bg-muted/40 px-3 text-[12px] font-medium text-foreground shadow-none hover:bg-muted/60"
              onClick={() => onExplore?.()}
            >
              {t("learnMore")}
            </Button>
            <Button
              type="button"
              className="h-9 rounded-md px-3 text-[12px] font-medium"
              onClick={() => onExplore?.()}
            >
              {t("gotIt")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
