"use client";

import {
  Check,
  SquaresFour,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { controlSize } from "@/components/ui/control";
import { navIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import { cn } from "@/lib/utils";

export type ElementsMenuItem = {
  id: string;
  label: string;
};

/** Category picker for Elements — text labels only, SquaresFour trigger. */
export function ElementsMenu({
  value,
  items,
  onChange,
  ariaLabel = "Elements",
  className,
}: {
  value: string;
  items: ElementsMenuItem[];
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          title={ariaLabel}
          className={cn(
            controlSize,
            "inline-flex shrink-0 items-center justify-center rounded-md border-none bg-muted/40 text-foreground shadow-none transition-colors hover:bg-muted/60",
            className,
          )}
        >
          <SquaresFour className={navIconClass} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-48 overflow-hidden rounded-2xl p-1.5 text-[13px] shadow-sm"
      >
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => onChange(item.id)}
              className="cursor-pointer gap-2 rounded-md px-2.5 py-2.5 text-[13px] font-normal text-foreground focus:bg-muted/50 focus:text-foreground"
            >
              <Check
                className={cn(
                  "size-3.5 shrink-0",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
