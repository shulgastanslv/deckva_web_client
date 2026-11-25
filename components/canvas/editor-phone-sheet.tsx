"use client";

import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/** Bottom sheet on phone; transparent passthrough wrapper on md+. */
export function EditorPhoneSheet({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const tc = useTranslations("common");

  return (
    <div
      className={cn(
        // Phone: bottom sheet above the dock
        "max-md:fixed max-md:inset-x-0 max-md:z-40 max-md:flex max-md:flex-col max-md:overflow-hidden max-md:rounded-t-3xl max-md:bg-background",
        open
          ? "max-md:bottom-[calc(3.5rem+env(safe-area-inset-bottom))] max-md:h-[min(70dvh,calc(100dvh-7.5rem))]"
          : "max-md:hidden",
        // Desktop: normal sidebar slot
        "md:relative md:z-20 md:flex md:h-full md:min-h-0 md:shrink-0 md:overflow-visible md:rounded-none md:bg-transparent",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col md:hidden">
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1 w-9 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between px-3 pb-1.5">
          <h2 className="px-1 text-[13px] font-normal text-foreground">
            {title}
          </h2>
          <button
            type="button"
            aria-label={tc("close")}
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <X className="size-5 stroke-[1.5]" />
          </button>
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden md:contents">
        {children}
      </div>
    </div>
  );
}
