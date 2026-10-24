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
        "flex h-full min-h-0 flex-col bg-white text-foreground dark:bg-background",
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className={cn("min-h-full px-8 pt-6 pb-16 sm:px-12", className)}>
        {children}
      </div>
    </div>
  );
}
