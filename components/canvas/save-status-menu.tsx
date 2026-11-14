"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudSlash as CloudOff,
  FloppyDisk as Save,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { menuIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import { useProject } from "@/hooks/use-project";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

function formatLastSaved(
  iso: string | null,
  now: number,
  t: ReturnType<typeof useTranslations<"editor.saveStatus">>,
  tc: ReturnType<typeof useTranslations<"common">>,
) {
  if (!iso) return tc("notSavedYet");
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return tc("notSavedYet");
  const delta = Math.max(0, now - then);
  const sec = Math.floor(delta / 1000);
  if (sec < 20) return tc("justNow");
  if (sec < 60) return t("secondsAgo", { n: sec });
  const min = Math.floor(sec / 60);
  if (min < 60) return t("minutesAgo", { n: min });
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return t("hoursAgo", { n: hrs });
  return new Date(iso).toLocaleString();
}

function SaveStatusArt({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  const arrow = saving ? "#6366F1" : dirty ? "#F59E0B" : "#64748B";
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#EEF2F7] dark:bg-muted/35">
      <svg
        viewBox="0 0 320 128"
        className="h-[112px] w-full"
        aria-hidden
        fill="none"
      >
        <defs>
          <linearGradient id="saveWin" x1="70" y1="18" x2="250" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DCEAF8" />
            <stop offset="1" stopColor="#C5D9F0" />
          </linearGradient>
          <linearGradient id="saveChrome" x1="70" y1="18" x2="250" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B7CFE8" />
            <stop offset="1" stopColor="#9CBADA" />
          </linearGradient>
          <filter id="saveSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#8BA3C0" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Window */}
        <g filter="url(#saveSoft)">
          <rect x="78" y="22" width="164" height="84" rx="14" fill="url(#saveWin)" />
          <rect x="78" y="22" width="164" height="22" rx="14" fill="url(#saveChrome)" />
          <rect x="78" y="34" width="164" height="10" fill="url(#saveChrome)" />
          <circle cx="94" cy="33" r="4" fill="#FFFFFF" opacity="0.85" />
        </g>

        {/* Dashed download target */}
        <circle
          cx="160"
          cy="72"
          r="22"
          stroke={arrow}
          strokeWidth="2.2"
          strokeDasharray="3.5 3.5"
          opacity="0.85"
        />
        <path
          d="M160 60v18"
          stroke={arrow}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M152 72l8 8 8-8"
          stroke={arrow}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Primary cursor (upright) */}
        <g transform="translate(186 76)">
          <path
            d="M1 1v16l4.2-4.2 3.4 8.2 2.8-1.2-3.4-8.1H14z"
            fill="var(--primary)"
            stroke="var(--primary)"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

export function SaveStatusMenu() {
  const { persist, isDirty, isSaving } = useProject();
  const lastSavedAt = useCanvasStore((s) => s.lastSavedAt);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(() => Date.now());
  const t = useTranslations("editor.saveStatus");
  const tc = useTranslations("common");

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setTick(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [open]);

  const title = isSaving
    ? tc("saving")
    : isDirty
      ? t("unsaved")
      : t("saved");

  const subtitle = isSaving
    ? t("writingEdits")
    : t("lastSaved", { time: formatLastSaved(lastSavedAt, tick, t, tc) });

  const Icon = isDirty || isSaving ? CloudOff : Cloud;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setTick(Date.now());
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={title}
          aria-label={title}
 className={cn(
            "size-9 shrink-0 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/40 hover:text-foreground",
            "data-[state=open]:bg-muted/40 data-[state=open]:text-foreground",
            isSaving && "animate-pulse text-primary",
            isDirty && !isSaving && "text-muted-foreground",
            !isDirty && !isSaving && "text-foreground",
          )}
        >
          <Icon className={menuIconClass} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 overflow-hidden rounded-2xl p-0"
      >
        <div className="p-3 pb-0">
          <SaveStatusArt dirty={isDirty} saving={isSaving} />
        </div>

        <div className="px-4 py-3.5">
          <p className="text-[15px] font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
        </div>

        <div className="border-t border-border/50 px-4 py-3.5">
          <p className="text-[13px] font-medium text-foreground">{t("autoSave")}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {t("autoSaveHint")}
          </p>
        </div>

        <div className="border-t border-border/50 p-3">
          <Button
            type="button"
            disabled={isSaving || !isDirty}
            onClick={() => {
              void persist().then(() => setTick(Date.now()));
            }}
            className="w-full gap-2 rounded-md border-none bg-foreground text-[13px] font-medium text-background shadow-none hover:bg-foreground/90 disabled:opacity-40"
          >
            <Save className={menuIconClass} />
            {isSaving ? tc("saving") : isDirty ? t("saveNow") : t("allSaved")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
