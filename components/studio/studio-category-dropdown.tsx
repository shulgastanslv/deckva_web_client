"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/categories";

export function CategoryDropdown({
  selectedCategory,
  onSelectCategory,
  className,
  allowClear = true,
}: {
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
  className?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedLabel =
    TEMPLATE_CATEGORIES.find((category) => category === selectedCategory) ||
    "Select category";

  const filteredCategories = TEMPLATE_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-full justify-between rounded-full border-0 px-4 text-[13px] font-medium shadow-none",
            className,
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] flex-col rounded-2xl border-0 bg-popover p-0"
        align="start"
      >
        <div className="flex shrink-0 items-center px-3">
          <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto p-1">
          {allowClear && selectedCategory ? (
            <DropdownMenuItem
              onClick={() => {
                onSelectCategory("");
                setSearch("");
                setOpen(false);
              }}
              className="mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-destructive focus:bg-destructive/10"
            >
              <div className="flex size-4 shrink-0 items-center justify-center">
                <X className="size-3.5" />
              </div>
              <span className="font-medium">Clear</span>
            </DropdownMenuItem>
          ) : null}

          {filteredCategories.length === 0 ? (
            <div className="py-4 text-center text-[13px] text-muted-foreground">
              No categories found
            </div>
          ) : (
            filteredCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => {
                  onSelectCategory(category);
                  setSearch("");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] focus:bg-muted"
              >
                <div className="flex size-4 shrink-0 items-center justify-center">
                  {selectedCategory === category ? (
                    <Check className="size-3.5 text-foreground" strokeWidth={3} />
                  ) : null}
                </div>
                <span
                  className={cn(
                    "text-muted-foreground transition-colors",
                    selectedCategory === category &&
                      "font-medium text-foreground",
                  )}
                >
                  {category}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}