import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StudioButtonVariant = "primary" | "secondary" | "ghost" | "create";

const variants: Record<StudioButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground",
  create:
    "bg-foreground text-background hover:opacity-90",
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
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
