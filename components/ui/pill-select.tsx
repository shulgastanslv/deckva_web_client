"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PillSelectOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

type PillSelectProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly PillSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Wider dropdown content (themes, etc.) */
  contentClassName?: string;
};

/** Select trigger matching PillSlider: label left, value right, full pill. */
export function PillSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select",
  disabled,
  className,
  contentClassName,
}: PillSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-10 w-full gap-2 rounded-full border-0 bg-muted/60 px-3.5 text-[13px] shadow-none",
          "hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-muted/25 dark:hover:bg-muted/40",
          "data-[size=default]:h-10",
          "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex-1",
          className,
        )}
      >
        <span className="shrink-0 font-medium text-foreground/85">{label}</span>
        <SelectValue placeholder={placeholder}>
          {selected ? (
            <span className="flex min-w-0 items-center justify-end gap-2 text-muted-foreground">
              {selected.leading}
              <span className="truncate text-foreground">{selected.label}</span>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="end" className={cn("max-h-80 min-w-[12rem]", contentClassName)}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-[13px]">
            <span className="flex items-center gap-2">
              {option.leading}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
