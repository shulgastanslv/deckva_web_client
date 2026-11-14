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
  const tone = saving ? "#2F5BFF" : dirty ? "#F59E0B" : "#22C55E";
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#F4F1EA] dark:bg-muted/30">
      <svg viewBox="0 0 320 120" className="h-[104px] w-full" aria-hidden>
        <rect width="320" height="120" fill="transparent" />
        <rect x="28" y="22" width="120" height="76" rx="10" fill="#FFFFFF" className="dark:fill-background" />
        <rect x="40" y="36" width="72" height="6" rx="3" fill="#D6D3D1" />
        <rect x="40" y="50" width="96" height="6" rx="3" fill="#E7E5E4" />
        <rect x="40" y="64" width="58" height="6" rx="3" fill="#E7E5E4" />
        <rect x="40" y="78" width="80" height="6" rx="3" fill="#E7E5E4" />

        <rect x="168" y="30" width="124" height="60" rx="10" fill="#FFFFFF" className="dark:fill-background" />
        <rect x="182" y="44" width="64" height="6" rx="3" fill="#D6D3D1" />
        <rect x="182" y="58" width="88" height="6" rx="3" fill="#E7E5E4" />
        <rect x="182" y="72" width="48" height="6" rx="3" fill="#E7E5E4" />

        <path
          d="M132 58h40"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={saving ? "4 6" : undefined}
        />
        <circle cx="172" cy="58" r="10" fill={tone} />
        <path
          d="M168 58l3 3 5-6"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
