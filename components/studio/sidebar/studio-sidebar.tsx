"use client";

import { Suspense } from "react";

import { StudioOrgSwitcher } from "@/components/studio/org/studio-org-switcher";
import { StudioFoldersSection } from "@/components/studio/sidebar/studio-folders-section";
import { StudioSidebarNav } from "@/components/studio/sidebar/studio-sidebar-nav";
import { StudioSidebarSearch } from "@/components/studio/sidebar/studio-sidebar-search";
import { cn } from "@/lib/utils";

export function StudioSidebar({
  search,
  onSearchChange,
  onBlank,
  onTemplates,
  className,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onBlank: () => void;
  onTemplates: () => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-[252px] shrink-0 flex-col bg-muted/20 dark:bg-background",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-3">
        <StudioOrgSwitcher />
        <StudioSidebarSearch
          search={search}
          onSearchChange={onSearchChange}
          onBlank={onBlank}
          onTemplates={onTemplates}
        />
        <Suspense fallback={<div className="px-2.5" aria-hidden />}>
          <StudioSidebarNav />
        </Suspense>
        <Suspense fallback={null}>
          <StudioFoldersSection />
        </Suspense>
      </div>
    </aside>
  );
}
