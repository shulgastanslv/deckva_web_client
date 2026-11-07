"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function StudioListDialog({
  open,
  onOpenChange,
  onSubmit,
  busy,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (items: string[]) => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
}) {
  const [items, setItems] = useState<string[]>([""]);

  useEffect(() => {
    if (open) setItems([""]);
  }, [open]);

  const filled = items.map((item) => item.trim()).filter(Boolean);
  const canSubmit = !busy && filled.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(28rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            List of Contents
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Fill a todo-style list — each row becomes a point on the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/45 text-[11px] text-muted-foreground">
                  {index + 1}
                </span>
                <input
                  value={item}
                  disabled={busy}
                  onChange={(e) => {
                    const value = e.target.value;
                    setItems((prev) =>
                      prev.map((row, i) => (i === index ? value : row)),
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    if (!item.trim()) return;
                    if (index === items.length - 1) {
                      setItems((prev) => [...prev, ""]);
                    }
                  }}
                  placeholder="List item…"
                  className={cn(
                    "h-10 flex-1 rounded-2xl bg-muted/30 px-3.5 text-[14px] text-foreground outline-none",
                    "placeholder:text-muted-foreground/70 focus:bg-muted/40",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                />
                {items.length > 1 ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    aria-label="Remove item"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : (
                  <span className="size-8" />
                )}
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => setItems((prev) => [...prev, ""])}
            className="h-9 rounded-full px-3 text-[13px]"
          >
            <Plus className="size-3.5" />
            Add item
          </Button>

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="h-10 w-full rounded-full text-[13px] font-medium"
            disabled={!canSubmit}
            onClick={() => void onSubmit(filled)}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Place on canvas
                <ArrowRight className="size-3.5 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
