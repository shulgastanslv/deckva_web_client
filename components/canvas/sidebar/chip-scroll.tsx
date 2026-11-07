"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { cn } from "@/lib/utils";

export type ChipScrollItem<T extends string> = {
  id: T;
  label: string;
  icon?: ReactNode;
};

/** Horizontally draggable chip / tab strip via react-indiana-drag-scroll. */
export function ChipScroll<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  size = "md",
}: {
  items: readonly ChipScrollItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const listId = useId();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [value]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = items.findIndex((item) => item.id === value);
    if (index < 0) return;
    const next =
      event.key === "ArrowRight"
        ? items[(index + 1) % items.length]
        : items[(index - 1 + items.length) % items.length];
    if (next) onChange(next.id);
  };

  return (
    <ScrollContainer
      vertical={false}
      hideScrollbars
      className={cn(
        "w-full min-w-0 cursor-grab overflow-x-auto select-none active:cursor-grabbing",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        id={listId}
        onKeyDown={onKeyDown}
        className="flex w-max min-w-full gap-1.5"
      >
        {items.map(({ id, label, icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(id)}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium transition-colors",
                size === "md"
                  ? "h-9 px-3.5 text-[13px]"
                  : "h-8 px-3 text-[12px]",
                active
                  ? "bg-foreground text-background"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/35",
              )}
            >
              {icon ? (
                <span className="shrink-0 [&_svg]:size-3.5">{icon}</span>
              ) : null}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </ScrollContainer>
  );
}
