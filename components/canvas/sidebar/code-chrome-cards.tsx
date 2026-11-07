"use client";

import {
  CODE_CHROME_STYLES,
  type CodeChromeStyle,
} from "@/lib/canvas/code-block";
import { cn } from "@/lib/utils";

function ChromePreview({ style }: { style: CodeChromeStyle }) {
  const shell =
    "relative h-full w-full overflow-hidden rounded-[10px] bg-muted/40 dark:bg-muted/30";
  const pane =
    "absolute inset-x-[14%] bottom-[14%] top-[28%] rounded-[6px] bg-background/80 dark:bg-background/55";
  const bar =
    "absolute inset-x-0 top-0 flex h-[28%] items-center bg-muted/70 dark:bg-muted/45";

  if (style === "none") {
    return (
      <div className={cn(shell, "flex items-center justify-center")}>
        <span className="relative size-7 rounded-full border border-muted-foreground/45">
          <span className="absolute inset-x-[-2px] top-1/2 h-px -rotate-45 bg-muted-foreground/55" />
        </span>
      </div>
    );
  }

  if (style === "arc") {
    return (
      <div className={cn(shell, "bg-transparent")}>
        <div className="absolute inset-[12%] rounded-[10px] border border-muted-foreground/35 bg-background/70 dark:bg-background/40" />
      </div>
    );
  }

  if (style === "card") {
    return (
      <div className={cn(shell, "bg-transparent")}>
        <div className="absolute inset-[18%] translate-x-1 translate-y-1 rounded-[8px] bg-muted-foreground/20" />
        <div className="absolute inset-[14%] rounded-[8px] border border-muted-foreground/30 bg-background/80 dark:bg-background/50" />
      </div>
    );
  }

  if (style === "stack" || style === "stack-2") {
    const layers = style === "stack" ? 1 : 2;
    return (
      <div className={cn(shell, "bg-transparent")}>
        {Array.from({ length: layers }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-[8px] bg-muted-foreground/20"
            style={{
              inset: `${16 - i * 3}%`,
              transform: `translate(${(i + 1) * 3}px, ${(i + 1) * 3}px)`,
            }}
          />
        ))}
        <div className="absolute inset-[16%] overflow-hidden rounded-[8px] border border-muted-foreground/30 bg-background/85 dark:bg-background/50">
          <div className="flex h-[28%] items-center gap-1 px-1.5">
            <span className="size-1.5 rounded-full bg-[#ff5f56]" />
            <span className="size-1.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-1.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="mx-1.5 mb-1.5 h-[42%] rounded-[4px] bg-muted/60 dark:bg-muted/40" />
        </div>
      </div>
    );
  }

  if (style === "windows") {
    return (
      <div className={shell}>
        <div className={bar}>
          <div className="ml-auto mr-1.5 flex items-center gap-1.5 text-[8px] leading-none text-muted-foreground">
            <span className="block h-px w-2 bg-current" />
            <span className="size-1.5 border border-current" />
            <span>×</span>
          </div>
        </div>
        <div className={pane} />
      </div>
    );
  }

  if (style === "safari") {
    return (
      <div className={shell}>
        <div className={cn(bar, "gap-1 px-1.5")}>
          <span className="size-1.5 rounded-full bg-[#ff5f56]" />
          <span className="size-1.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-1.5 rounded-full bg-[#27c93f]" />
          <span className="mx-auto h-2.5 w-[42%] rounded-full bg-background/70 dark:bg-background/40" />
        </div>
        <div className={pane} />
      </div>
    );
  }

  // macos default
  return (
    <div className={shell}>
      <div className={cn(bar, "gap-1 px-1.5")}>
        <span className="size-1.5 rounded-full bg-[#ff5f56]" />
        <span className="size-1.5 rounded-full bg-[#ffbd2e]" />
        <span className="size-1.5 rounded-full bg-[#27c93f]" />
      </div>
      <div className={pane} />
    </div>
  );
}

export function CodeChromeCards({
  value,
  disabled,
  onChange,
}: {
  value: CodeChromeStyle;
  disabled?: boolean;
  onChange: (style: CodeChromeStyle) => void;
}) {
  return (
    <div className="grid w-full grid-cols-3 gap-1.5">
      {CODE_CHROME_STYLES.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            title={item.label}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex min-w-0 flex-col items-center gap-2 overflow-hidden rounded-2xl px-1.5 py-2.5 text-center transition-colors disabled:opacity-40",
              active
                ? "bg-muted text-foreground ring-2 ring-ring"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/25 dark:hover:bg-muted/40",
            )}
          >
            <span className="aspect-square w-full max-w-[4.5rem]">
              <ChromePreview style={item.id} />
            </span>
            <span className="w-full truncate text-[12px] font-medium text-foreground">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
