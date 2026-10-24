"use client";

import {
  ArrowUp,
  Flame,
  LayoutTemplate,
  Lightbulb,
  Loader2,
  Plus,
  Rocket,
  Sparkles,
  Type,
} from "lucide-react";

import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HELP_CHIPS = [
  {
    id: "hooks",
    label: "Hooks",
    icon: Flame,
    theme: "A sharp hook carousel that stops the scroll in frame 1",
  },
  {
    id: "tips",
    label: "Tips",
    icon: Lightbulb,
    theme: "7 practical tips for better carousels, short and scannable",
  },
  {
    id: "launch",
    label: "Launch",
    icon: Rocket,
    theme: "Explain a product launch in 6 frames. Calm, for founders, no jargon",
  },
  {
    id: "brand",
    label: "Brand story",
    icon: Type,
    theme: "A short brand story carousel with one clear takeaway",
  },
  {
    id: "ai",
    label: "Creative",
    icon: Sparkles,
    theme: "A creative 6-slide carousel with bold covers and minimal copy",
  },
] as const;

export function StudioGeneratePrompt({
  value,
  onValueChange,
  onSubmit,
  onBlank,
  onTemplates,
  submitting,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onBlank?: () => void;
  onTemplates?: () => void;
  submitting?: boolean;
  className?: string;
}) {
  const canSubmit = Boolean(value.trim()) && !submitting;

  return (
    <div className={cn("mx-auto w-full max-w-[720px]", className)}>
      <h1 className="text-center text-[22px] font-normal tracking-tight text-foreground sm:text-[26px]">
        Create a carousel
      </h1>

      <PromptInput
        value={value}
        onValueChange={onValueChange}
        onSubmit={() => {
          if (canSubmit) onSubmit();
        }}
        isLoading={submitting}
        className="mt-5 rounded-[1.5rem] border border-black/[0.08] bg-muted/40 p-3.5 shadow-none dark:border-white/10 dark:bg-muted"
      >
        <PromptInputTextarea
          placeholder="Ask swibp to make a high-converting carousel…"
          className="min-h-[56px] px-1 py-1 text-[15px] leading-relaxed placeholder:text-muted-foreground/65"
        />
        <PromptInputActions className="mt-2 items-center justify-between px-0.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="New blank carousel"
              className="size-8 rounded-full text-foreground"
              onClick={onBlank}
            >
              <Plus className="size-4 stroke-[2]" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Browse templates"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onTemplates}
            >
              <LayoutTemplate className="size-4 stroke-[1.75]" />
            </Button>
          </div>
          <Button
            type="button"
            size="icon-sm"
            disabled={!canSubmit}
            onClick={onSubmit}
            aria-label="Generate carousel"
            className={cn(
              "size-9 rounded-full",
              canSubmit
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArrowUp className="size-3.5 stroke-[2.5]" />
            )}
          </Button>
        </PromptInputActions>
      </PromptInput>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
        <span className="w-full text-center text-[12px] text-muted-foreground sm:mr-1 sm:w-auto sm:text-left">
          swibp can help you:
        </span>
        {HELP_CHIPS.map(({ id, label, icon: Icon, theme }) => (
          <button
            key={id}
            type="button"
            onClick={() => onValueChange(theme)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-muted/70 px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-muted dark:bg-muted/50"
          >
            <Icon className="size-3.5 stroke-[1.75] text-muted-foreground" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
