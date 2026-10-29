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
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          {onSearchChange ? (
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-44 rounded-full border-border/60 bg-muted/40 px-3.5 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-1 sm:w-56"
            />
          ) : null}
          {actions}
        </div>
      </div>
      {tabs ? <div className="mt-5 flex items-center gap-6">{tabs}</div> : null}
    </header>
  );
}
