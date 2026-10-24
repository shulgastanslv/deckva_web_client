"use client";

import { Plus, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="h-9 rounded-full border-0 bg-background pl-8 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-1 dark:bg-muted/40"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Create"
            className="size-9 shrink-0 rounded-full border-0 bg-background text-foreground shadow-none hover:bg-background/80 dark:bg-muted dark:hover:bg-muted/80"
          >
            <Plus className="size-4 stroke-[2]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-[180px] rounded-2xl border-0 bg-muted p-1.5 shadow-none"
        >
          <DropdownMenuItem
            className="cursor-pointer rounded-xl text-[13px]"
            onClick={onBlank}
          >
            Blank carousel
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl text-[13px]"
            onClick={onGenerate}
          >
            Generate with AI
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl text-[13px]"
            onClick={onTemplates}
          >
            From template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
