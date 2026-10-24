"use client";

import { ArrowUp, Loader2 } from "lucide-react";

import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { cn } from "@/lib/utils";

const SEEDS = [
  "Common mistakes that kill carousel results — and the fix",
  "A simple framework people can reuse today",
  "A short founder story with one sharp lesson",
] as const;

export function StudioGeneratePrompt({
  value,
  onValueChange,
  onSubmit,
  submitting,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  className?: string;
}) {
  const canSubmit = Boolean(value.trim()) && !submitting;

  return (
    <div className={cn("mx-auto w-full max-w-[640px]", className)}>
      <PromptInput
        value={value}
        onValueChange={onValueChange}
        onSubmit={() => {
          if (canSubmit) onSubmit();
        }}
        isLoading={submitting}
        className="rounded-2xl border-neutral-200 bg-neutral-50 p-3 shadow-none dark:border-border dark:bg-muted/40"
      >
        <PromptInputTextarea
          placeholder="Describe the carousel you want to generate…"
          className="min-h-[72px] px-1 py-1 text-[15px] leading-relaxed placeholder:text-neutral-400"
        />
        <PromptInputActions className="mt-2 justify-between px-0.5">
          <p className="text-[12px] text-neutral-400">
            Enter to generate · Shift+Enter for a new line
          </p>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full transition-colors",
              canSubmit
                ? "bg-neutral-950 text-white hover:opacity-90 dark:bg-foreground dark:text-background"
                : "bg-neutral-200 text-neutral-400 dark:bg-muted dark:text-muted-foreground",
            )}
            aria-label="Generate carousel"
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArrowUp className="size-3.5 stroke-[2.5]" />
            )}
          </button>
        </PromptInputActions>
      </PromptInput>

      <div className="mt-4 flex flex-col gap-1">
        {SEEDS.map((seed) => (
          <button
            key={seed}
            type="button"
            onClick={() => onValueChange(seed)}
            className="truncate rounded-xl px-3 py-2 text-left text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
          >
            {seed}
          </button>
        ))}
      </div>
    </div>
  );
}
