"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function FilterMenu({
  icon: Icon,
  value,
  groups,
  onChange,
}: {
  icon?: LucideIcon;
  value: string;
  groups: FilterGroup[];
  onChange: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 min-w-0 items-center gap-1.5 rounded-full bg-muted/60 dark:bg-muted/25 px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/80 dark:hover:bg-muted/40"
        >
          {Icon ? <Icon className="size-3.5 shrink-0 text-muted-foreground" /> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-52! min-w-52! rounded-xl border-0 bg-muted/50 p-1.5 text-[13px]! shadow-xl ring-0 backdrop-blur-md"
      >
        {groups.map((group, index) => (
          <div key={group.label ?? index}>
            {index > 0 ? <DropdownMenuSeparator className="my-1 bg-white/10" /> : null}
            {group.options.map((option) => {
              const active = option.id === value;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => onChange(option.id)}
                  className={cn(
                    "cursor-pointer gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground focus:bg-muted/60 dark:bg-muted/25 focus:text-foreground",
                  )}
                >
                  <Check className={cn("size-3.5 shrink-0", active ? "opacity-100" : "opacity-0")} />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
