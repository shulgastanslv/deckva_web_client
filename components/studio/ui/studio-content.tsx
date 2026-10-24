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
        "flex h-full min-h-0 flex-col bg-background text-foreground",
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
  /** Center content like Miro home (default true). */
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
          "min-h-full px-6 pt-6 pb-16 sm:px-10",
          centered && "mx-auto w-full max-w-[1080px]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
