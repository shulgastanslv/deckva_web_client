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

/** Two rows of five full-height cells — wider hit targets than a single strip. */
export function SlideCountPicker({ value, onChange, disabled, ariaLabel }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid w-full grid-cols-5 gap-1 rounded-md p-1",
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
              controlH,
              "flex min-w-0 items-center justify-center rounded-xl text-[13px] font-normal tabular-nums transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-primary/50 hover:text-foreground",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
