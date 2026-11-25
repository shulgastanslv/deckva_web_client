"use client";

import {
  House as HomeIcon,
  Folder as FolderIcon,
  Plus,
  Shapes,
} from "@phosphor-icons/react";

import { PhoneFrame } from "@/components/canvas/phone-frame";
import { cn } from "@/lib/utils";

/**
 * Minimal phone preview for the landing mobile feature card.
 */
export function MobileStudioVisual({
  className,
  alt,
}: {
  className?: string;
  alt: string;
}) {
  return (
    <div
      className={cn("relative mx-auto w-full", className)}
      role="img"
      aria-label={alt}
    >
      <PhoneFrame
        size="fluid"
        className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
      >
        <div className="relative flex h-full w-full flex-col bg-[#F4F4F5] dark:bg-background">
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 pt-12 pb-16">
            <div className="flex aspect-[4/5] w-full max-w-[11rem] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(0,0,0,0.08)] dark:bg-muted/40">
              <div className="h-[18%] w-[42%] bg-[#050038]/8 dark:bg-muted/60" />
              <div className="mt-[6%] h-[4%] w-[68%] bg-[#050038]/6 dark:bg-muted/45" />
              <div className="mt-[3%] h-[4%] w-[54%] bg-[#050038]/5 dark:bg-muted/35" />
              <div className="mt-auto h-[38%] w-full bg-[#050038]/7 dark:bg-muted/50" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5">
            <div className="flex items-center justify-around rounded-[1.35rem] border border-black/5 bg-white/85 px-2 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-border/50 dark:bg-background/85">
              <HomeIcon
                className="size-4 text-[#050038] dark:text-foreground"
                weight="fill"
              />
              <FolderIcon className="size-4 text-[#050038]/40 dark:text-muted-foreground" />
              <span className="flex size-7 items-center justify-center rounded-md bg-[#050038] text-white dark:bg-foreground dark:text-background">
                <Plus className="size-3.5 stroke-[2]" weight="bold" />
              </span>
              <Shapes className="size-4 text-[#050038]/40 dark:text-muted-foreground" />
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
