"use client";

import { useRef } from "react";
import {
  ChevronDown,
  Compass,
  FilePlus,
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

const itemClass =
  "cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium focus:bg-muted/50";

export function StudioCreateMenu({
  onBlank,
  onTemplates,
  onBrandKit,
  onImportJson,
  className,
  label = "Create",
  align = "end",
  triggerClassName,
}: {
  onBlank: () => void;
  onTemplates: () => void;
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
            className={cn(
              "h-9 rounded-full border-none bg-muted/40 px-3.5 text-[13px] font-medium shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60",
              triggerClassName,
              className,
            )}
          >
            {label}
            <ChevronDown className="size-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          sideOffset={8}
          className="w-56 rounded-2xl p-1.5"
        >
          <DropdownMenuItem className={itemClass} onClick={onBlank}>
            <FilePlus className="size-4 text-muted-foreground" />
            Blank project
          </DropdownMenuItem>

          {onBrandKit ? (
            <DropdownMenuItem className={itemClass} onClick={onBrandKit}>
              <Palette className="size-4 text-muted-foreground" />
              Brand kit
            </DropdownMenuItem>
          ) : null}

          {onImportJson ? (
            <>
              <DropdownMenuSeparator className="my-1.5 bg-border/50" />
              <DropdownMenuItem
                className={itemClass}
                onClick={() => importRef.current?.click()}
              >
                <Upload className="size-4 text-muted-foreground" />
                Import JSON
              </DropdownMenuItem>
            </>
          ) : null}

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          <DropdownMenuItem className={itemClass} onClick={onTemplates}>
            <Compass className="size-4 text-muted-foreground" />
            Explore community
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}