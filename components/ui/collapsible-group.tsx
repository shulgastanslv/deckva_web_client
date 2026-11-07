"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CollapsibleGroupProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
  className?: string;
}

export function CollapsibleGroup({
  id,
  title,
  children,
  defaultOpen = true,
  headerRight,
  className,
}: CollapsibleGroupProps) {
  // Keep SSR and first client paint aligned; restore localStorage after mount.
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    const stored = localStorage.getItem(`group-${id}`);
    if (stored === null) return;
    setIsOpen(stored === "true");
  }, [id]);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(`group-${id}`, String(next));
  };

  return (
    <div className={cn("border-b border-border/60 last:border-b-0", className)}>
      <div className="flex h-full items-center gap-1">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-none px-2.5 py-2.5 text-left transition-colors hover:bg-muted/50"
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
              isOpen && "rotate-90",
            )}
          />
          <span className="truncate text-[13px] font-semibold text-foreground/90">
            {title}
          </span>
        </button>
        {headerRight ? (
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {headerRight}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-150 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-3 pb-4 pt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
