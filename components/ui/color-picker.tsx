"use client";

import React, { useEffect, useId, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { normalizeHex, toPickerHex } from "@/lib/color/hex";
import { cn } from "@/lib/utils";

const PRESETS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#78716c",
  "#1c1917",
] as const;

type ColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  /** Optional field label above the control. */
  label?: string;
  /** Extra control on the right of the hex input (e.g. Reset). */
  trailing?: React.ReactNode;
  /** Compact swatch-only trigger (palette rows, pattern color). */
  compact?: boolean;
  /** Shown next to compact swatch. */
  caption?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
  /** Called when the popover closes after a change (e.g. commit history). */
  onCommit?: () => void;
};

function ColorPickerPopover({
  value,
  onChange,
  onCommit,
  disabled,
  children,
}: {
  value: string;
  onChange: (hex: string) => void;
  onCommit?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const picker = toPickerHex(value || "#000000");
  const [draft, setDraft] = useState(picker);
  const dirty = React.useRef(false);

  useEffect(() => {
    if (!open) setDraft(toPickerHex(value || "#000000"));
  }, [value, open]);

  const apply = (hex: string) => {
    const next = normalizeHex(hex);
    if (!next) return;
    dirty.current = true;
    setDraft(next);
    onChange(next);
  };

  const commitDraft = () => {
    const next = normalizeHex(draft);
    if (next) {
      apply(next);
    } else {
      setDraft(picker);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (!next && dirty.current) {
          dirty.current = false;
          onCommit?.();
        }
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] space-y-3 bg-background p-3 dark:bg-background"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <HexColorPicker
          color={draft}
          onChange={apply}
          className="!h-[140px] !w-full"
        />
        <div className="flex items-center gap-2 rounded-full bg-muted/40 px-2.5">
          <span
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: draft }}
            aria-hidden
          />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft();
              }
            }}
            spellCheck={false}
            className="h-8 flex-1 border-0 bg-transparent px-1 font-mono text-[13px] uppercase shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              onClick={() => apply(hex)}
              className={cn(
                "aspect-square rounded-full transition-transform hover:scale-110 active:scale-95",
                draft.toLowerCase() === hex ? "ring-2 ring-foreground/40 ring-offset-1 ring-offset-background" : "",
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Shared color control: swatch opens a saturation picker + hex + presets.
 * Use `compact` for dense rows (palette, pattern); default is a labeled field.
 */
export function ColorPicker({
  value,
  onChange,
  label,
  trailing,
  compact = false,
  caption,
  className,
  disabled,
  title,
  onCommit,
}: ColorPickerProps) {
  const id = useId();
  const display = value === "transparent" ? "" : value;
  const [hexDraft, setHexDraft] = useState(display);
  const swatch = toPickerHex(value || "#000000");

  useEffect(() => {
    setHexDraft(display);
  }, [display]);

  const commitHex = () => {
    if (!hexDraft.trim()) return;
    const next = normalizeHex(hexDraft);
    if (next) {
      onChange(next);
      setHexDraft(next);
      onCommit?.();
    } else {
      setHexDraft(display);
    }
  };

  const swatchButton = (
    <button
      type="button"
      id={id}
      disabled={disabled}
      title={title ?? label ?? "Pick color"}
      aria-label={title ?? label ?? "Pick color"}
      className={cn(
        "shrink-0 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
        compact ? "size-7" : "size-6",
        "ring-1 ring-border/60",
      )}
      style={{ backgroundColor: swatch }}
    />
  );

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <ColorPickerPopover
          value={value}
          onChange={onChange}
          onCommit={onCommit}
          disabled={disabled}
        >
          {swatchButton}
        </ColorPickerPopover>
        {caption}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-[13px] text-muted-foreground">
          {label}
        </label>
      ) : null}
      <div className="flex h-9 items-center gap-2 rounded-full bg-muted/40 px-2">
        <ColorPickerPopover
          value={value}
          onChange={(hex) => {
            onChange(hex);
            setHexDraft(hex);
          }}
          onCommit={onCommit}
          disabled={disabled}
        >
          {swatchButton}
        </ColorPickerPopover>
        <Input
          value={hexDraft}
          disabled={disabled}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder="#000000"
          spellCheck={false}
          className="h-7 flex-1 border-0 bg-transparent px-1 font-mono text-[13px] uppercase shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {trailing}
      </div>
    </div>
  );
}
