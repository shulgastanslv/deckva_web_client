"use client";

import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How a fitness coach should post on Instagram",
  "5 Next.js features every founder should know",
  "Как заработать первые $1000 на фрилансе",
] as const;

export function StudioPrompt({
  onSubmit,
  disabled,
  busy,
  error,
}: {
  onSubmit: (topic: string) => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
}) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const canSend = trimmed.length >= 2 && !disabled && !busy;

  const submit = () => {
    if (!canSend) return;
    void onSubmit(trimmed);
  };

  return (
    <section className="mb-10 sm:mb-12">
      <div
        className={cn(
          "rounded-3xl bg-muted/40 p-2 transition-colors",
          "focus-within:bg-muted/55",
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          disabled={disabled || busy}
          placeholder="Describe a carousel — topic, tone, audience…"
          className={cn(
            "field-sizing-content min-h-[72px] w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/80",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <p className="truncate text-[12px] text-muted-foreground">
            {busy ? "Generating slides…" : "Enter to generate · Shift+Enter for a new line"}
          </p>
          <button
            type="button"
            disabled={!canSend}
            onClick={submit}
            title="Generate carousel"
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
              canSend
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-[13px] text-destructive">{error}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <PromptSuggestion
            key={suggestion}
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || busy}
            className="h-8 rounded-full px-3 text-[12px] font-medium"
            onClick={() => {
              setValue(suggestion);
              void onSubmit(suggestion);
            }}
          >
            {suggestion}
          </PromptSuggestion>
        ))}
      </div>
    </section>
  );
}
