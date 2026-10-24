import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StudioTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative pb-2.5 text-[15px] transition-colors",
        active
          ? "font-semibold text-neutral-950 dark:text-foreground"
          : "font-medium text-neutral-400 hover:text-neutral-700 dark:text-muted-foreground dark:hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
