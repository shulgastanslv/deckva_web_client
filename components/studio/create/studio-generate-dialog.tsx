"use client";

import { ArrowUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const SEEDS = [
  "Common mistakes that kill carousel results — and the fix",
  "A simple framework people can reuse today",
  "A short founder story with one sharp lesson",
] as const;

export function StudioGenerateDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: string;
  onThemeChange: (value: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-2xl border-border/50 p-0 shadow-lg sm:max-w-[420px]"
      >
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-[15px] font-medium tracking-tight">
            Generate a carousel
          </DialogTitle>
        </DialogHeader>
        <div className="px-5 pt-3 pb-5">
          <Textarea
            autoFocus
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="What is the carousel about?"
            className="min-h-[100px] resize-none rounded-xl border-0 bg-muted/40 px-3 py-2.5 text-[14px] leading-relaxed shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <div className="mt-2 flex flex-col gap-0.5">
            {SEEDS.map((seed) => (
              <button
                key={seed}
                type="button"
                onClick={() => onThemeChange(seed)}
                className="truncate rounded-lg px-2 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {seed}
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 rounded-full px-3.5 text-[12px]"
              disabled={!theme.trim() || submitting}
              onClick={onSubmit}
            >
              {submitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <ArrowUp className="size-3" />
              )}
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
