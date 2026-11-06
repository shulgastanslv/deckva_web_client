"use client";

import {
  ChevronDown,
  LayoutTemplate,
  FilePlus,
  FolderGit2,
  Upload,
  Compass,
  Globe2,
  ChevronRight,
  Lock
} from "lucide-react";

import { StudioButton } from "@/components/studio/ui/studio-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function StudioCreateMenu({
  onBlank,
  onTemplates,
  className,
  label = "Create",
  align = "end",
  triggerClassName,
}: {
  onBlank: () => void;
  onTemplates: () => void;
  className?: string;
  label?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <StudioButton
          variant="create"
          className={cn(
            "rounded-full",
            triggerClassName,
            className
          )}
        >
          <ChevronDown className="size-3.5 stroke-[2.5] opacity-60" />
          {label}
        </StudioButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="w-full rounded-2xl border-neutral-200/80 bg-white p-2 border-none dark:bg-neutral-900"
        >
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-neutral-800 focus:bg-neutral-100 dark:text-neutral-200 dark:focus:bg-neutral-800"
          onClick={onBlank}
        >
          <FilePlus className="size-4 text-neutral-500 dark:text-neutral-400" />
          <span>Blank carousel</span>
        </DropdownMenuItem>

        {/* Пример опции с подменю (Format / Submenu example) */}
        <DropdownMenuItem
          className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-neutral-800 focus:bg-neutral-100 dark:text-neutral-200 dark:focus:bg-neutral-800"
          onClick={() => { }}
        >
          <div className="flex items-center gap-3">
            <LayoutTemplate className="size-4 text-neutral-500 dark:text-neutral-400" />
            <span>Format</span>
          </div>
          <ChevronRight className="size-3.5 text-neutral-400" />
        </DropdownMenuItem>

        {/* Пример неактивной/заблокированной опции (Space) */}
        <DropdownMenuItem
          className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-neutral-800 focus:bg-neutral-100 dark:text-neutral-200 dark:focus:bg-neutral-800"
          onClick={() => { }}
        >
          <div className="flex items-center gap-3">
            <FolderGit2 className="size-4 text-neutral-500 dark:text-neutral-400" />
            <span>Space</span>
          </div>
          <Lock className="size-3.5 text-neutral-400 opacity-60" />
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-neutral-100 dark:bg-neutral-800" />

        <DropdownMenuItem
          className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-neutral-800 focus:bg-neutral-100 dark:text-neutral-200 dark:focus:bg-neutral-800"
          onClick={() => { }}
        >
          <div className="flex items-center gap-3">
            <Upload className="size-4 text-neutral-500 dark:text-neutral-400" />
            <span>Import</span>
          </div>
          <ChevronRight className="size-3.5 text-neutral-400" />
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-neutral-100 dark:bg-neutral-800" />

        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-neutral-800 focus:bg-neutral-100 dark:text-neutral-200 dark:focus:bg-neutral-800"
          onClick={onTemplates}
        >
          <Compass className="size-4 text-neutral-500 dark:text-neutral-400" />
          <span>Explore templates</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}