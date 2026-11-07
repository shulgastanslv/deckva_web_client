"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import type { ArtifactListItem } from "@/actions/artifacts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function StudioBrandDialog({
  open,
  onOpenChange,
  palettes,
  onApply,
  busy,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palettes: ArtifactListItem[];
  onApply: (artifact: ArtifactListItem) => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedId(palettes[0]?.id ?? null);
  }, [open, palettes]);

  const selected = palettes.find((p) => p.id === selectedId) ?? null;
  const canSubmit = !busy && Boolean(selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(28rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Brand Kit
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Apply a recent palette to your brand kit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          {palettes.length === 0 ? (
            <p className="rounded-2xl bg-muted/30 px-3.5 py-4 text-[13px] leading-relaxed text-muted-foreground">
              No palettes yet. Generate one from the prompt below, then come
              back.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {palettes.map((palette) => {
                const colors = palette.previewColors ?? [];
                const active = palette.id === selectedId;
                return (
                  <li key={palette.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setSelectedId(palette.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors",
                        active ? "bg-muted/50" : "hover:bg-muted/30",
                      )}
                    >
                      <span className="flex h-9 w-14 shrink-0 overflow-hidden rounded-xl">
                        {(colors.length > 0
                          ? colors.slice(0, 4)
                          : ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373"]
                        ).map((color, index) => (
                          <span
                            key={`${color}-${index}`}
                            className="h-full flex-1"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {palette.title || palette.previewText || "Untitled"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="h-10 w-full rounded-full text-[13px] font-medium"
            disabled={!canSubmit}
            onClick={() => {
              if (selected) void onApply(selected);
            }}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Apply palette
                <ArrowRight className="size-3.5 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
