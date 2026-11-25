import type { ReactNode } from "react";

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
          // pb clears StudioMobileNav (~3.5rem + safe-area) on phone
          "min-h-full px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 md:px-10 md:pb-12",
          centered && "mx-auto w-full max-w-[1080px]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
