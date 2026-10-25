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
  /** Formatted value on the right (e.g. "0.72", "6px"). Defaults to rounded number. */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  className?: string;
  info?: React.ReactNode;
};

function PillSlider({
  label,
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  disabled,
  className,
  info,
}: PillSliderProps) {
  const display =
    formatValue?.(value) ??
    (Number.isInteger(step) && step >= 1
      ? String(Math.round(value))
      : value.toFixed(step < 0.1 ? 2 : 1));

  return (
    <div
      className={cn(
        "relative flex h-10 w-full items-center overflow-hidden rounded-full bg-muted/70 dark:bg-muted/50",
        disabled && "opacity-50",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-1 pl-3.5">
        <span className="text-[13px] font-medium text-foreground/85">{label}</span>
        {info}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3.5">
        <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
          {display}
        </span>
      </div>
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
          {/* No filled range — matches the reference pill look */}
          <SliderPrimitive.Range className="absolute h-full bg-transparent" />
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
