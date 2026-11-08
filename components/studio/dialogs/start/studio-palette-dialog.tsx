"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function StudioPaletteDialog({
  open,
  onOpenChange,
  onSubmit,
  busy,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (topic: string) => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
}) {
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (open) setTopic("");
  }, [open]);

  const canSubmit = !busy && topic.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(28rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Generate palette
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Optional prep — lock colors before the carousel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            disabled={busy}
            placeholder="Mood, brand, or color direction…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && canSubmit) {
                e.preventDefault();
                void onSubmit(topic.trim());
              }
            }}
            className={cn(
              "field-sizing-content min-h-[96px] w-full resize-none rounded-2xl bg-muted/30 px-3.5 py-3 text-[14px] leading-relaxed text-foreground outline-none",
              "placeholder:text-muted-foreground/70 focus:bg-muted/40",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="h-10 w-full rounded-full text-[13px] font-medium"
            disabled={!canSubmit}
            onClick={() => void onSubmit(topic.trim())}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Generate
                <ArrowRight className="size-3.5 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
