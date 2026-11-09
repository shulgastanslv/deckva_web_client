"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
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
  const scrollRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(max > 2 && el.scrollLeft < max - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateEdges)
        : null;
    ro?.observe(el);
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro?.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, [items]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    // Edges update after scroll settles a bit
    const t = window.setTimeout(updateEdges, 320);
    return () => window.clearTimeout(t);
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

  const maskImage =
    canLeft || canRight
      ? `linear-gradient(to right, ${canLeft ? "transparent" : "black"} 0, black ${canLeft ? "28px" : "0"}, black calc(100% - ${canRight ? "28px" : "0px"}), ${canRight ? "transparent" : "black"} 100%)`
      : undefined;

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <ScrollContainer
        vertical={false}
        hideScrollbars
        innerRef={scrollRef}
        className="w-full min-w-0 cursor-grab overflow-x-auto select-none active:cursor-grabbing"
        style={
          maskImage
            ? { maskImage, WebkitMaskImage: maskImage }
            : undefined
        }
        onScroll={updateEdges}
      >
        <div
          role="tablist"
          aria-label={ariaLabel}
          id={listId}
          onKeyDown={onKeyDown}
          className="flex w-max min-w-full gap-1.5 px-1"
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
                  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-200",
                  size === "md"
                    ? "h-9 px-3.5 text-[13px]"
                    : "h-8 px-3 text-[12px]",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/30",
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

    </div>
  );
}
