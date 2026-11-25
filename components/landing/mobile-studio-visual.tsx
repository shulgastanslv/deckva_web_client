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
        <div className="relative flex h-full w-full flex-col bg-[#ECECEE] dark:bg-[#1a1a1c]">
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 pt-12 pb-16">
            <div className="flex aspect-[4/5] w-full max-w-[11rem] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(0,0,0,0.08)] dark:bg-[#2a2a2e] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
              <div className="h-[18%] w-[42%] bg-[#050038]/10 dark:bg-white/20" />
              <div className="mt-[6%] h-[4%] w-[68%] bg-[#050038]/8 dark:bg-white/14" />
              <div className="mt-[3%] h-[4%] w-[54%] bg-[#050038]/6 dark:bg-white/10" />
              <div className="mt-auto h-[38%] w-full bg-[#050038]/9 dark:bg-white/16" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5">
            <div className="flex items-center justify-around rounded-[1.35rem] border border-black/5 bg-white/90 px-2 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#2a2a2e]/92 dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <HomeIcon
                className="size-4 text-[#050038] dark:text-white"
                weight="fill"
              />
              <FolderIcon className="size-4 text-[#050038]/40 dark:text-white/45" />
              <span className="flex size-7 items-center justify-center rounded-md bg-[#050038] text-white dark:bg-white dark:text-[#1a1a1c]">
                <Plus className="size-3.5" weight="bold" />
              </span>
              <Shapes className="size-4 text-[#050038]/40 dark:text-white/45" />
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
