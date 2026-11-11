"use client";

import { Button } from "@/components/ui/button";
import { ToolsBannerCollage } from "@/components/canvas/sidebar/tool-avatars";
import { cn } from "@/lib/utils";

export function ToolsBanner({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-background dark:bg-background",
        className,
      )}
    >
      <ToolsBannerCollage />
      <div className="space-y-3 bg-background px-4 py-4">
        <div className="space-y-1">
          <p className="text-[13px] font-semibold tracking-tight text-foreground">
            More carousel tools to explore
          </p>
          <p className="text-[12px] leading-snug text-muted-foreground">
            Try Deckva tools for mockups, chrome, and text — or build your own.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-8 rounded-lg border-none bg-muted/50 px-3 text-[12px] font-medium text-foreground shadow-none hover:bg-muted/70"
            onClick={() => onExplore?.()}
          >
            Learn more
          </Button>
          <Button
            type="button"
            className="h-8 rounded-lg bg-foreground px-3 text-[12px] font-medium text-background shadow-none hover:bg-foreground/90"
            onClick={() => onExplore?.()}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
