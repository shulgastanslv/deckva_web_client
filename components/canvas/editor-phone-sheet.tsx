"use client";

import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  mobileGlassSheet,
  mobileSheetBottom,
} from "@/components/studio/ui/mobile-glass";
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
        // Phone: floating glass sheet above the dock
        "max-md:fixed max-md:inset-x-0 max-md:z-40 max-md:flex max-md:flex-col max-md:overflow-hidden",
        open
          ? cn(
              "max-md:h-[min(68dvh,calc(100dvh-8.5rem))]",
              mobileSheetBottom,
              mobileGlassSheet,
            )
          : "max-md:hidden",
        // Desktop: normal sidebar slot
        "md:relative md:inset-auto md:z-20 md:flex md:h-full md:min-h-0 md:shrink-0 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-none",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col md:hidden">
        <div className="flex justify-center pt-3 pb-1.5">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="flex items-center justify-between px-3.5 pb-2">
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
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden px-0.5 pb-2 md:contents md:p-0">
        {children}
      </div>
    </div>
  );
}
