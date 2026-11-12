"use client";

import type { StudioTool } from "@/lib/studio/tools-catalog";
import { cn } from "@/lib/utils";

/** Small list avatar — uses `tool.image`. */
export function ToolAvatar({
  tool,
  size = "md",
  className,
}: {
  tool: StudioTool;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const box =
    size === "sm"
      ? "size-7"
      : size === "lg"
        ? "size-14"
        : size === "xl"
          ? "size-16"
          : "size-10";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-md bg-muted",
        box,
        className,
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tool.image}
        alt=""
        draggable={false}
        className="block size-full object-cover"
      />
    </span>
  );
}

/** Square tile — uses `tool.image`. */
export function ToolAvatarTile({
  tool,
  className,
}: {
  tool: StudioTool;
  className?: string;
}) {
  return (
    <div className={cn("aspect-square overflow-hidden rounded-md bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tool.image}
        alt=""
        draggable={false}
        className="block size-full object-cover"
      />
    </div>
  );
}

/** Large dialog / hover art — uses `tool.image`. */
export function ToolUsageSchema({
  tool,
  className,
}: {
  tool: StudioTool;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-44 items-center justify-center overflow-hidden rounded-md bg-muted",
        className,
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tool.image}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}
