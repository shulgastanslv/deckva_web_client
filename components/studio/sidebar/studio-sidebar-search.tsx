"use client";

import { Plus, SearchIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function StudioSidebarSearch({
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
    <div className="flex items-center gap-1.5 px-3 pb-3">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="h-9 rounded-xl border-transparent bg-white pl-8 text-[13px] shadow-none placeholder:text-neutral-400 focus-visible:border-border focus-visible:ring-1 dark:bg-muted/40"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Create"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-950 dark:bg-muted dark:text-foreground"
          >
            <Plus className="size-4 stroke-[2]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-[180px] rounded-xl p-1.5"
        >
          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-[13px]"
            onClick={onBlank}
          >
            Blank carousel
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-[13px]"
            onClick={onGenerate}
          >
            Generate with AI
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-[13px]"
            onClick={onTemplates}
          >
            From template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
