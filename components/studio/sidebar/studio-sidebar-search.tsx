"use client";

import {
  Plus,
  MagnifyingGlass as SearchIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { controlSize } from "@/components/ui/control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StudioSidebarSearch({
  search,
  onSearchChange,
  onBlank,
  onTemplates,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onBlank: () => void;
  onTemplates: () => void;
}) {
  const t = useTranslations("studio");
  const tc = useTranslations("common");
  const tCreate = useTranslations("studio.create");

  return (
    <div className="flex items-center gap-1.5 px-3 pb-3">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tc("search")}
          className="rounded-md border-none bg-muted/40 pl-9 text-[13px] shadow-none placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/20"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={tCreate("create")}
            className={cn(
              controlSize,
              "shrink-0 rounded-md border-none bg-muted/40 text-foreground shadow-none hover:bg-muted/60",
            )}
          >
            <Plus className="size-5 stroke-[1.5]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-[180px] rounded-2xl p-1.5"
        >
          <DropdownMenuItem
            className="cursor-pointer rounded-xl text-[13px]"
            onClick={onBlank}
          >
            {t("blankCarousel")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl text-[13px]"
            onClick={onTemplates}
          >
            {tCreate("fromTemplate")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
