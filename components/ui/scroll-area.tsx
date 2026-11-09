"use client";

import * as React from "react";
import { cn } from "cn";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import { useScrollEdgeFade } from "@/hooks/use-scroll-edge-fade";

function ScrollArea({
  className,
  children,
  scrollbar = "vertical",
  fade = true,
  fadeSize = 28,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  /** Which scrollbars to mount. Unused axes stay idle. */
  scrollbar?: "vertical" | "horizontal" | "both" | "none";
  /** Soft mask fade when content overflows visible edges. */
  fade?: boolean;
  fadeSize?: number;
}) {
  const showVertical = scrollbar === "vertical" || scrollbar === "both";
  const showHorizontal = scrollbar === "horizontal" || scrollbar === "both";
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const axis = scrollbar === "horizontal" ? "horizontal" : "vertical";
  const { maskImage } = useScrollEdgeFade(viewportRef, {
    axis,
    size: fadeSize,
    deps: [children, scrollbar, fade],
  });

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        style={
          fade && maskImage
            ? {
                maskImage,
                WebkitMaskImage: maskImage,
              }
            : undefined
        }
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {showVertical ? <ScrollBar orientation="vertical" /> : null}
      {showHorizontal ? <ScrollBar orientation="horizontal" /> : null}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
