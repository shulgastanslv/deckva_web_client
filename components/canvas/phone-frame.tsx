"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Front-facing iPhone 17 Pro silver — screen hole from the frame template. */
export const IPHONE_17_PRO = {
  src: "/mockups/iphone-17-pro-silver.png",
  width: 1406,
  height: 2822,
  screen: { x: 100, y: 100, width: 1206, height: 2622 },
} as const;

const SIZE = {
  sm: "w-[min(100%,14.5rem)]",
  md: "w-[min(100%,16.5rem)]",
  lg: "w-[min(100%,18.5rem)]",
  xl: "w-[min(100%,20.5rem)]",
  fluid: "w-full",
} as const;

export function PhoneFrame({
  children,
  className,
  widthClass,
  size = "fluid",
}: {
  children: ReactNode;
  className?: string;
  widthClass?: string;
  /** Preset widths for adaptive phone grids */
  size?: keyof typeof SIZE;
}) {
  const { width, height, screen } = IPHONE_17_PRO;
  const bleed = 12;

  return (
    <div
      className={cn(
        "relative mx-auto",
        SIZE[size],
        widthClass,
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          left: `${((screen.x - bleed) / width) * 100}%`,
          top: `${((screen.y - bleed) / height) * 100}%`,
          width: `${((screen.width + bleed * 2) / width) * 100}%`,
          height: `${((screen.height + bleed * 2) / height) * 100}%`,
          borderRadius: "17.5% / 8.1%",
        }}
      >
        <div className="h-full w-full">{children}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IPHONE_17_PRO.src}
        alt=""
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
        draggable={false}
      />
    </div>
  );
}
