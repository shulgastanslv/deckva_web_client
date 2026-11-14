"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CaretDown as ChevronDown,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

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
  includeAll = true,
  fullWidth = false,
  placeholder,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  includeAll?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const t = useTranslations("studio.browse");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...COMMUNITY_CATEGORIES];
    return COMMUNITY_CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(q),
    );
  }, [query]);

  const label =
    value === "all"
      ? t("allCategories")
      : value || placeholder || t("allCategories");

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
 className={cn(
            "rounded-md border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60",
            fullWidth ? "w-full justify-between" : "max-w-[200px]",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl p-0"
      >
        <div className="border-b border-border/40 px-3.5 py-2.5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {t("category")}
          </p>
        </div>
        <div className="relative border-b border-border/40 px-2 py-2">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("filterCategories")}
            className="w-full rounded-md bg-muted/40 pr-3 pl-9 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/50"
          />
        </div>

        <div className="max-h-[280px] overflow-y-auto p-1.5 [scrollbar-width:thin]">
          {includeAll ? (
            <button
              type="button"
              onClick={() => pick("all")}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2.5 font-normal text-left text-[13px] transition-colors",
                value === "all"
                  ? "bg-muted/50 text-foreground"
                  : "text-foreground hover:bg-muted/40",
              )}
            >
              <Check
                className={cn(
                  "size-3.5 shrink-0",
                  value === "all" ? "opacity-100" : "opacity-0",
                )}
              />
              {t("allCategories")}
            </button>
          ) : null}

          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-[12px] text-muted-foreground">
              {t("noCategories")}
            </p>
          ) : (
            filtered.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => pick(cat)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2.5 font-normal text-left text-[13px] transition-colors",
                  value === cat
                    ? "bg-muted/50 text-foreground"
                    : "text-foreground hover:bg-muted/40",
                )}
              >
                <Check
                  className={cn(
                    "size-3.5 shrink-0",
                    value === cat ? "opacity-100" : "opacity-0",
                  )}
                />
                {cat}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
