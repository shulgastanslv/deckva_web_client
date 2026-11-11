"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { COMMUNITY_CATEGORIES } from "@/lib/community/categories";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CommunityCategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...COMMUNITY_CATEGORIES];
    return COMMUNITY_CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(q),
    );
  }, [query]);

  const label = value === "all" ? "All categories" : value;

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 max-w-[200px] rounded-md border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-[260px] rounded-2xl p-2"
      >
        <div className="relative mb-1.5">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter categories"
            className="h-9 w-full rounded-md bg-muted/40 pr-3 pl-9 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/50"
          />
        </div>

        <div className="max-h-[260px] overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => pick("all")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors",
              value === "all"
                ? "bg-muted/50 text-foreground"
                : "text-foreground hover:bg-muted/40",
            )}
          >
            <span className="flex w-4 shrink-0 items-center justify-center">
              {value === "all" ? <Check className="size-4" /> : null}
            </span>
            All categories
          </button>

          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-[12px] text-muted-foreground">
              No categories found
            </p>
          ) : (
            filtered.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => pick(cat)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors",
                  value === cat
                    ? "bg-muted/50 text-foreground"
                    : "text-foreground hover:bg-muted/40",
                )}
              >
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {value === cat ? <Check className="size-4" /> : null}
                </span>
                {cat}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
