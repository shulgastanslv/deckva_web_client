"use client";

import {
  type Icon as LucideIcon,
} from "@phosphor-icons/react";
import {
  Check,
  FunnelSimpleIcon as Funnel,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label?: string;
}

export interface FilterGroup {
  label?: string;
  options: FilterOption[];
}

/** Compact Figma-style filter trigger — taxonomy lives in the menu, not a chip strip. */
export function FilterMenu({
  icon: Icon = Funnel,
  value,
  defaultValue = "all",
  groups,
  onChange,
  ariaLabel = "Filter",
  className,
}: {
  icon?: LucideIcon;
  value: string;
  /** When value differs, trigger reads as “active”. */
  defaultValue?: string;
  groups: FilterGroup[];
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const active = value !== defaultValue;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          title={ariaLabel}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center transition-colors rounded-full",
            active
              ? "text-background hover:bg-foreground/90"
              : "text-foreground hover:bg-muted/80 dark:hover:bg-muted/40",
            className,
          )}
        >
          <Icon className="size-5 shrink-0 stroke-[1.5]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-52 rounded-2xl p-1.5 text-[13px]"
      >
        {groups.map((group, index) => (
          <div key={group.label ?? index}>
            {index > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
            {group.label ? (
              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
            ) : null}
            {group.options.map((option) => {
              const selected = option.id === value;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => onChange(option.id)}
                  className="cursor-pointer gap-2 rounded-xl px-2 py-1.5 text-[13px] text-foreground focus:bg-muted/50 focus:text-foreground"
                >
                  <Check className={cn("size-3.5 shrink-0", selected ? "opacity-100" : "opacity-0")} />
                  <span>{option.label ?? option.id}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
