"use client";

import {
  Check,
  Crop,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const RATIOS = Object.keys(CANVAS_RATIOS) as RatioKey[];

type RatioSelectProps = {
  currentRatio: string;
  onRatioChange: (ratio: string) => void;
  /** Optional accessible name; trigger always shows crop icon + ratio. */
  label?: string;
};

function FramePreview({ width, height }: { width: number; height: number }) {
  const max = 18;
  const scale = max / Math.max(width, height);
  return (
    <span
      aria-hidden
      className="shrink-0 rounded-[3px] bg-muted-foreground/35"
      style={{
        width: Math.max(6, Math.round(width * scale)),
        height: Math.max(6, Math.round(height * scale)),
      }}
    />
  );
}

export function RatioSelect({
  currentRatio,
  onRatioChange,
  label = "Canvas size",
}: RatioSelectProps) {
  const active = currentRatio in CANVAS_RATIOS ? (currentRatio as RatioKey) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          title={label}
          aria-label={`${label}: ${currentRatio}`}
          className="h-9 gap-1.5 rounded-md border-none bg-muted/40 px-2.5 text-[13px] font-medium tabular-nums text-foreground shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60"
        >
          <Crop className="size-3.5 text-muted-foreground" />
          <span>{currentRatio}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-2xl p-1.5"
      >
        {RATIOS.map((ratio) => {
          const size = CANVAS_RATIOS[ratio];
          const selected = active === ratio;
          return (
            <DropdownMenuItem
              key={ratio}
              className={cn(
                "cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] focus:bg-muted/50",
                selected && "bg-muted/40",
              )}
              onSelect={() => onRatioChange(ratio)}
            >
              <FramePreview width={size.width} height={size.height} />
              <span className="min-w-0 flex-1 tabular-nums">{ratio}</span>
              <span className="tabular-nums text-[12px] text-muted-foreground">
                {size.width}×{size.height}
              </span>
              <Check
                className={cn(
                  "size-3.5 shrink-0 text-foreground",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
