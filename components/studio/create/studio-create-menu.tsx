"use client";

import { ChevronDown } from "lucide-react";

import { StudioButton } from "@/components/studio/ui/studio-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
          className={cn(triggerClassName, className)}
        >
          <ChevronDown className="size-3.5 stroke-[2.5]" />
          {label}
        </StudioButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="min-w-[200px] rounded-2xl border-0 bg-muted p-1.5 shadow-none dark:bg-muted"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-2.5 py-2 text-[13px]"
          onClick={onBlank}
        >
          Blank carousel
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-2.5 py-2 text-[13px]"
          onClick={onTemplates}
        >
          From template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
