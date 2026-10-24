"use client";

import { Suspense } from "react";

import { StudioOrgSwitcher } from "@/components/studio/org/studio-org-switcher";
import { StudioFoldersSection } from "@/components/studio/sidebar/studio-folders-section";
import { StudioSidebarNav } from "@/components/studio/sidebar/studio-sidebar-nav";
import { StudioSidebarSearch } from "@/components/studio/sidebar/studio-sidebar-search";

export function StudioSidebar({
  search,
  onSearchChange,
  onBlank,
  onGenerate,
  onTemplates,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onBlank: () => void;
  onGenerate: () => void;
  onTemplates: () => void;
}) {
  return (
    <aside className="flex w-[248px] shrink-0 flex-col bg-[#f5f5f5] dark:bg-background">
      <div className="flex min-h-0 flex-1 flex-col pt-3">
        <StudioOrgSwitcher />
        <StudioSidebarSearch
          search={search}
          onSearchChange={onSearchChange}
          onBlank={onBlank}
          onGenerate={onGenerate}
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
