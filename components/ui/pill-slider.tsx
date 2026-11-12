"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

type PillSliderProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Optional unit rendered after the editable value (e.g. "%", "°", "px"). */
  suffix?: string;
  /** Formatted core value for the input (no unit). Defaults to rounded / stepped number. */
  formatValue?: (value: number) => string;
  parseValue?: (raw: string) => number;
  disabled?: boolean;
  className?: string;
  info?: React.ReactNode;
};

function defaultFormat(value: number, step: number) {
  if (Number.isInteger(step) && step >= 1) return String(Math.round(value));
  return value.toFixed(step < 0.1 ? 2 : 1);
}

function stripToNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d.,\-]+/g, "").replace(",", ".");
  return Number(cleaned);
}

function PillSlider({
  label,
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  formatValue,
  parseValue,
  disabled,
  className,
  info,
}: PillSliderProps) {
  const format = React.useCallback(
    (n: number) => formatValue?.(n) ?? defaultFormat(n, step),
    [formatValue, step],
  );
  const [draft, setDraft] = React.useState(format(value));

  React.useEffect(() => {
    setDraft(format(value));
  }, [value, format]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const commitDraft = () => {
    const parsed = parseValue?.(draft) ?? stripToNumber(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(format(value));
      return;
    }
    const next = clamp(parsed);
    onValueChange(next);
    onValueCommit?.(next);
    setDraft(format(next));
  };

  return (
    <div
      className={cn(
        "relative flex h-10 w-full items-center overflow-hidden rounded-full bg-muted/60 dark:bg-muted/25",
        disabled && "opacity-50",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-1 pl-3.5">
        <span className="text-[13px] font-medium text-foreground/85">{label}</span>
        {info}
      </div>

      <div
        className={cn(
          "absolute inset-y-0 right-0 z-20 flex items-center gap-0.5 pr-3.5",
          disabled && "pointer-events-none",
        )}
      >
        <input
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={draft}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-7 w-11 rounded-md border-0 bg-transparent px-0.5 text-right font-mono text-[13px] tabular-nums text-muted-foreground outline-none focus:bg-muted/50 focus:text-foreground focus-visible:ring-0"
        />
        {suffix ? (
          <span className="pointer-events-none text-[12px] tabular-nums text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>

      {/* Full-bleed track — no side padding, so Range fills from the left edge. */}
      <SliderPrimitive.Root
        data-slot="pill-slider"
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([next]) => onValueChange(next ?? value)}
        onValueCommit={
          onValueCommit
            ? ([next]) => onValueCommit(next ?? value)
            : undefined
        }
        className="relative flex h-full w-full touch-none items-center select-none"
      >
        <SliderPrimitive.Track
          data-slot="pill-slider-track"
          className="relative h-full w-full grow overflow-hidden rounded-full bg-transparent"
        >
          <SliderPrimitive.Range className="absolute h-full bg-muted" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="pill-slider-thumb"
          aria-label={label}
          className={cn(
            "block h-5 w-1.5 shrink-0 rounded-sm bg-foreground/55 dark:bg-foreground/70",
            "ring-ring/40 transition-[color,box-shadow] select-none",
            "hover:bg-foreground/70 focus-visible:outline-hidden focus-visible:ring-2",
            "disabled:pointer-events-none",
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}

export { PillSlider };
export type { PillSliderProps };
