import type { ReactNode } from "react";

import { mobileDockClearance } from "@/components/studio/ui/mobile-glass";
import { cn } from "@/lib/utils";

export function StudioContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-muted/20 text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StudioContentBody({
  children,
  className,
  /** Center the home/content column (default true). */
  centered = true,
}: {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div
        className={cn(
          // pb clears the floating glass dock on phone
          "min-h-full px-4 pt-4 sm:px-6 sm:pt-6 md:px-10 md:pb-12",
          mobileDockClearance,
          centered && "mx-auto w-full max-w-[1080px]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
