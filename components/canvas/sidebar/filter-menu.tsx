"use client";

import type { ReactNode } from "react";
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
import { navIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label?: string;
  icon?: ReactNode;
}

export interface FilterGroup {
  label?: string;
  options: FilterOption[];
}

/** Compact filter trigger — taxonomy lives in the menu, not a chip strip. */
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
            "inline-flex size-9 shrink-0 items-center justify-center rounded-md border-none shadow-none transition-colors",
            active
              ? "bg-muted/60 text-foreground"
              : "bg-muted/25 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            className,
          )}
        >
          <Icon className={navIconClass} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 overflow-hidden rounded-2xl p-0 text-[13px] shadow-sm"
      >
        <div className="border-b border-border/40 px-3.5 py-2.5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {ariaLabel}
          </p>
        </div>
        <div className="p-1.5">
          {groups.map((group, index) => (
            <div key={group.label ?? index}>
              {index > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
              {group.label ? (
                <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
              ) : null}
              {group.options.map((option) => {
                const selected = option.id === value;
                return (
                  <DropdownMenuItem
                    key={option.id}
                    onSelect={() => onChange(option.id)}
                    className="cursor-pointer gap-2 rounded-md px-2.5 py-2.5 text-[13px] font-normal text-foreground focus:bg-muted/50 focus:text-foreground"
                  >
                    <Check
                      className={cn(
                        "size-3.5 shrink-0",
                        selected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.icon ? (
                      <span className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
                        {option.icon}
                      </span>
                    ) : null}
                    <span>{option.label ?? option.id}</span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
