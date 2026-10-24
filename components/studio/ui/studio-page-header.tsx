import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";

export function StudioPageHeader({
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  actions,
  tabs,
}: {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
}) {
  return (
    <header className="shrink-0 px-8 pt-2 pb-1 sm:px-10">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          {onSearchChange ? (
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-44 rounded-full border-neutral-200 bg-neutral-50 px-3.5 text-[13px] shadow-none placeholder:text-neutral-400 focus-visible:ring-1 sm:w-56 dark:border-border dark:bg-muted/40"
            />
          ) : null}
          {actions}
        </div>
      </div>
      {tabs ? <div className="mt-5 flex items-center gap-6">{tabs}</div> : null}
    </header>
  );
}
