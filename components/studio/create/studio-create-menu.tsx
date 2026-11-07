"use client";

import { useRef } from "react";
import {
  ChevronDown,
  Compass,
  FilePlus,
  LayoutTemplate,
  Palette,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  onCarousel,
  onBrandKit,
  onImportJson,
  className,
  label = "Create",
  align = "end",
  triggerClassName,
}: {
  onBlank: () => void;
  onTemplates: () => void;
  onCarousel?: () => void;
  onBrandKit?: () => void;
  onImportJson?: (file: File) => void | Promise<void>;
  className?: string;
  label?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
}) {
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = "";
          if (file && onImportJson) void onImportJson(file);
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={cn("rounded-full", triggerClassName, className)}
          >
            <ChevronDown className="size-3.5 stroke-[2.5] opacity-60" />
            {label}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          sideOffset={8}
          className="w-56 rounded-2xl border-0 bg-background p-1.5"
        >
          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium"
            onClick={onBlank}
          >
            <FilePlus className="size-4 text-muted-foreground" />
            Blank carousel
          </DropdownMenuItem>

          {onCarousel ? (
            <DropdownMenuItem
              className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium"
              onClick={onCarousel}
            >
              <LayoutTemplate className="size-4 text-muted-foreground" />
              Generate carousel
            </DropdownMenuItem>
          ) : null}

          {onBrandKit ? (
            <DropdownMenuItem
              className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium"
              onClick={onBrandKit}
            >
              <Palette className="size-4 text-muted-foreground" />
              Brand kit
            </DropdownMenuItem>
          ) : null}

          {onImportJson ? (
            <>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium"
                onClick={() => importRef.current?.click()}
              >
                <Upload className="size-4 text-muted-foreground" />
                Import JSON
              </DropdownMenuItem>
            </>
          ) : null}

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium"
            onClick={onTemplates}
          >
            <Compass className="size-4 text-muted-foreground" />
            Explore templates
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
