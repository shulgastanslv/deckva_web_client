import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StudioButtonVariant = "primary" | "secondary" | "ghost" | "create";

const variants: Record<StudioButtonVariant, string> = {
  primary:
    "bg-[#2f5bff] text-white hover:bg-[#254ae6] shadow-sm",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted",
  ghost:
    "text-neutral-700 hover:bg-black/5 dark:text-foreground dark:hover:bg-muted",
  create:
    "bg-neutral-950 text-white hover:opacity-90 dark:bg-foreground dark:text-background",
};

export function StudioButton({
  variant = "secondary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StudioButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
