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
        "overflow-hidden rounded-2xl bg-background ring-1 ring-border/40 dark:ring-border/50",
        className,
      )}
    >
      <ToolsBannerCollage />
      {/* Pull the content up so it covers the bottom row of tiles (reference bleed). */}
      <div className="relative z-[1] -mt-10 space-y-3 bg-background px-4 pt-4 pb-4">
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
            className="h-8 rounded-md border border-border/60 bg-background px-3 text-[12px] font-medium text-foreground shadow-none hover:bg-muted/50"
            onClick={() => onExplore?.()}
          >
            Learn more
          </Button>
          <Button
            type="button"
            className="h-8 rounded-md px-3 text-[12px] font-medium"
            onClick={() => onExplore?.()}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
