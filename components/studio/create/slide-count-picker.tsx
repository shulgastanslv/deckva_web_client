"use client";

import { controlH } from "@/components/ui/control";
import { cn } from "@/lib/utils";

export const SLIDE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

/** One segmented row — same height as other dialog controls. */
export function SlideCountPicker({ value, onChange, disabled, ariaLabel }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        controlH,
        "flex w-full items-center gap-0.5 rounded-md bg-muted/40 p-1",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {SLIDE_COUNT_OPTIONS.map((n) => {
        const active = n === value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "flex h-full min-w-0 flex-1 items-center justify-center rounded-md text-[14px] font-normal tabular-nums transition-colors",
              active
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
