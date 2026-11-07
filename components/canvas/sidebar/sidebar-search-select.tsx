"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sidebarSurface } from "@/components/canvas/sidebar/sidebar-ui";

export type SidebarSearchOption = {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
  group?: string;
  leading?: ReactNode;
};

export type SidebarSearchFilter<T extends string = string> = {
  id: T;
  label: string;
};

export function SidebarSearchSelect<TFilter extends string = string>({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  disabled,
  className,
  triggerClassName,
  contentClassName,
  filters,
  filterValue,
  onFilterChange,
  filterAriaLabel = "Filters",
}: {
  label: string;
  value: string;
  options: readonly SidebarSearchOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  filters?: readonly SidebarSearchFilter<TFilter>[];
  filterValue?: TFilter;
  onFilterChange?: (id: TFilter) => void;
  filterAriaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((option) => {
      if (
        filters &&
        filterValue &&
        filterValue !== ("all" as TFilter) &&
        option.group &&
        option.group !== filterValue
      ) {
        return false;
      }
      if (!q) return true;
      const hay =
        `${option.label} ${option.description ?? ""} ${option.keywords ?? ""} ${option.value} ${option.group ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query, filters, filterValue]);

  return (
    <div className={cn("w-full min-w-0", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full min-w-0 items-center gap-2 rounded-full px-3.5 text-left transition-colors disabled:pointer-events-none disabled:opacity-40",
              sidebarSurface,
              triggerClassName,
            )}
          >
            <span className="shrink-0 text-[13px] font-medium text-foreground/85">
              {label}
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
              {selected?.leading}
              <span className="truncate text-[13px] text-foreground">
                {selected?.label ?? placeholder}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            "w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border-0 bg-popover p-0",
            contentClassName,
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2 border-b border-border/40 px-3.5 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-9 w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {filters && filterValue != null && onFilterChange ? (
            <div
              role="group"
              aria-label={filterAriaLabel}
              className="flex flex-wrap gap-1.5 px-3 py-2.5"
            >
              {filters.map((item) => {
                const active = filterValue === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onFilterChange(item.id)}
                    className={cn(
                      "h-8 shrink-0 rounded-full px-3 text-[12px] font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/35",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <ScrollArea
            type="scroll"
            className="h-[min(22rem,50vh)]"
            scrollbar="vertical"
          >
            <div role="listbox" aria-label={label} className="space-y-0.5 p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                  {emptyText}
                </p>
              ) : (
                filtered.map((option) => {
                  const active = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      {option.leading ? (
                        <span className="shrink-0">{option.leading}</span>
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-foreground">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="block truncate text-[12px] text-muted-foreground">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                      {active ? (
                        <Check className="size-3.5 shrink-0 text-foreground" />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
