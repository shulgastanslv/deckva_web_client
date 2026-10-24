import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StudioBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-muted dark:text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
