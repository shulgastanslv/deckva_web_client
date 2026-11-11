"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProject } from "@/hooks/use-project";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

function formatLastSaved(iso: string | null, now: number) {
  if (!iso) return "Not saved yet";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "Not saved yet";
  const delta = Math.max(0, now - then);
  const sec = Math.floor(delta / 1000);
  if (sec < 20) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleString();
}

export function SaveStatusMenu() {
  const { persist, isDirty, isSaving } = useProject();
  const lastSavedAt = useCanvasStore((s) => s.lastSavedAt);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setTick(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [open]);

  const title = isSaving
    ? "Saving…"
    : isDirty
      ? "Unsaved changes"
      : "Changes saved";

  const subtitle = isSaving
    ? "Writing your latest edits"
    : `Last saved: ${formatLastSaved(lastSavedAt, tick)}`;

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
            "size-10 shrink-0 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground",
            "data-[state=open]:bg-muted/60 data-[state=open]:text-foreground",
            isSaving && "animate-pulse text-primary",
            isDirty && !isSaving && "text-muted-foreground",
            !isDirty && !isSaving && "text-foreground",
          )}
        >
          <Icon className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 overflow-hidden rounded-2xl p-0"
      >
        <div className="px-4 py-3.5">
          <p className="text-[15px] font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
        </div>

        <div className="border-t border-border/50 px-4 py-3.5">
          <p className="text-[13px] font-medium text-foreground">Auto-save</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Deckva keeps your carousel in sync while you edit. Press ⌘S anytime
            to save now.
          </p>
        </div>

        <div className="border-t border-border/50 p-3">
          <Button
            type="button"
            disabled={isSaving || !isDirty}
            onClick={() => {
              void persist().then(() => setTick(Date.now()));
            }}
            className="h-10 w-full gap-2 rounded-md border-none bg-foreground text-[13px] font-medium text-background shadow-none hover:bg-foreground/90 disabled:opacity-40"
          >
            <Save className="size-4" />
            {isSaving ? "Saving…" : isDirty ? "Save now" : "All changes saved"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
