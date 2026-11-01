import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Section wrapper. Content stays visible — scroll-reveal used to leave blocks at opacity 0. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

/** Parent for a grid of blocks. Pass grid/flex classes here. */
export function RevealStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return <div className={className}>{children}</div>;
}

/** One block inside RevealStagger. Pass grid col-span here. */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}
