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
    <header className="mb-6 shrink-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <h1 className="text-[26px] font-bold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onSearchChange ? (
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 min-w-0 flex-1 rounded-full border-border/60 bg-muted/40 px-3.5 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-1 sm:w-56 sm:flex-none"
            />
          ) : null}
          {actions}
        </div>
      </div>
      {tabs ? (
        <div className="mt-4 flex items-center gap-5 overflow-x-auto [scrollbar-width:none] sm:mt-5 sm:gap-6 [&::-webkit-scrollbar]:hidden">
          {tabs}
        </div>
      ) : null}
    </header>
  );
}
