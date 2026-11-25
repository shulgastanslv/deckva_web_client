"use client";

import {
  Folder as FolderIcon,
  House as HomeIcon,
  Palette as PaletteIcon,
  Plus,
  Users as UsersIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { PhoneFrame } from "@/components/canvas/phone-frame";
import { cn } from "@/lib/utils";

const DOCK = [
  { id: "home", Icon: HomeIcon, active: true },
  { id: "projects", Icon: FolderIcon, active: false },
  { id: "community", Icon: UsersIcon, active: false },
  { id: "brand", Icon: PaletteIcon, active: false },
] as const;

/**
 * Stylized phone preview of the mobile studio — glass dock + compact home.
 * Decorative only; not a live screenshot.
 */
export function MobileStudioVisual({
  className,
  alt,
}: {
  className?: string;
  alt: string;
}) {
  const t = useTranslations("landing.features.mobile");

  return (
    <div className={cn("relative mx-auto w-full", className)} role="img" aria-label={alt}>
      <PhoneFrame
        size="fluid"
        className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#F4F4F5] text-[#050038] dark:bg-background dark:text-foreground">
          {/* Status / header */}
          <div className="flex shrink-0 items-center justify-between px-4 pt-10 pb-2">
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-md bg-[#050038]/10 dark:bg-muted/50" />
              <span className="h-5 w-12 rounded-md bg-[#050038]/8 dark:bg-muted/40" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-7 rounded-md bg-[#050038]/8 dark:bg-muted/40" />
              <span className="size-7 rounded-full bg-[#050038]/12 dark:bg-muted/50" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
            <p className="font-[family-name:var(--font-landing-serif)] text-[1.65rem] leading-[1.05] font-medium tracking-tight">
              {t("previewGreeting")}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-[#050038]/55 dark:text-muted-foreground">
              {t("previewSub")}
            </p>

            {/* Prompt shell */}
            <div className="mt-4 rounded-[1.25rem] bg-white p-2.5 dark:bg-muted/40">
              <div className="rounded-[0.9rem] bg-[#F4F4F5] px-3 py-3 dark:bg-background/60">
                <p className="text-[11px] leading-snug text-[#050038]/45 dark:text-muted-foreground">
                  {t("previewPrompt")}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="h-5 w-16 rounded-md bg-[#050038]/8 dark:bg-muted/50" />
                <span className="flex size-8 items-center justify-center rounded-md bg-[#050038] text-white dark:bg-foreground dark:text-background">
                  <Plus className="size-4 stroke-[2]" weight="bold" />
                </span>
              </div>
            </div>

            {/* Recent stubs */}
            <p className="mt-5 text-[11px] font-medium text-[#050038]/55 dark:text-muted-foreground">
              {t("previewRecent")}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="aspect-[4/5] rounded-xl bg-white dark:bg-muted/35" />
              <div className="aspect-[4/5] rounded-xl bg-white dark:bg-muted/35" />
            </div>
          </div>

          {/* Floating glass dock */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-3">
            <div className="flex items-stretch justify-around gap-0.5 rounded-[1.35rem] border border-black/5 bg-white/80 px-1.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-border/50 dark:bg-background/80">
              {DOCK.map(({ id, Icon, active }) => (
                <div
                  key={id}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5",
                    active && "bg-[#050038]/6 dark:bg-muted/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      active
                        ? "text-[#050038] dark:text-foreground"
                        : "text-[#050038]/45 dark:text-muted-foreground",
                    )}
                    weight={active ? "fill" : "regular"}
                  />
                  <span
                    className={cn(
                      "text-[7px] font-normal tracking-tight",
                      active
                        ? "text-[#050038] dark:text-foreground"
                        : "text-[#050038]/45 dark:text-muted-foreground",
                    )}
                  >
                    {t(`dock.${id}`)}
                  </span>
                </div>
              ))}
              <div className="flex min-w-0 flex-1 items-center justify-center py-1">
                <span className="flex size-7 items-center justify-center rounded-md bg-[#050038] text-white dark:bg-foreground dark:text-background">
                  <Plus className="size-3.5 stroke-[2]" weight="bold" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
