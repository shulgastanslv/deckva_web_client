"use client";

import { useRef } from "react";
import {
  CaretDown as ChevronDown,
  Compass,
  FilePlus,
  Palette,
  UploadSimple as Upload,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
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

function FigmaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className} aria-hidden>
      <path fill="#F24E1E" d="M0 6a6 6 0 0 1 6-6h6v12H6A6 6 0 0 1 0 6Z" />
      <path fill="#FF7262" d="M12 0h6a6 6 0 0 1 0 12h-6V0Z" />
      <path fill="#A259FF" d="M0 18a6 6 0 0 1 6-6h6v12H6a6 6 0 0 1-6-6Z" />
      <path fill="#1ABCFE" d="M18 12a6 6 0 1 0 0 12 6 6 0 1 0 0-12Z" />
      <path fill="#0ACF83" d="M6 36a6 6 0 0 0 6-6v-6H6a6 6 0 0 0 0 12Z" />
    </svg>
  );
}

export function StudioCreateMenu({
  onBlank,
  onTemplates,
  onBrandKit,
  onImportJson,
  onImportFigma,
  className,
  label,
  align = "end",
  triggerClassName,
}: {
  onBlank?: () => void;
  onTemplates: () => void;
  onBrandKit?: () => void;
  onImportJson?: (file: File) => void | Promise<void>;
  onImportFigma?: () => void;
  className?: string;
  label?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
}) {
  const t = useTranslations("studio.create");
  const create = useStudioCreate();
  const importRef = useRef<HTMLInputElement>(null);
  const triggerLabel = label ?? t("create");

  const handleBlank = onBlank ?? create.openBlank;
  const handleFigma = onImportFigma ?? create.openFigmaImport;

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
              "h-9 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-medium shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60",
              triggerClassName,
              className,
            )}
          >
            {triggerLabel}
            <ChevronDown className="size-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          sideOffset={8}
          className="w-56 rounded-2xl p-1.5"
        >
          <DropdownMenuItem className={itemClass} onClick={handleBlank}>
            <FilePlus className="size-4 text-muted-foreground" />
            {t("blankProject")}
          </DropdownMenuItem>

          {onBrandKit ? (
            <DropdownMenuItem className={itemClass} onClick={onBrandKit}>
              <Palette className="size-4 text-muted-foreground" />
              {t("brandKit")}
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          <DropdownMenuItem className={itemClass} onClick={handleFigma}>
            <FigmaMark className="h-4 w-[11px]" />
            {t("importFigma")}
          </DropdownMenuItem>

          {onImportJson ? (
            <DropdownMenuItem
              className={itemClass}
              onClick={() => importRef.current?.click()}
            >
              <Upload className="size-4 text-muted-foreground" />
              {t("importJson")}
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          <DropdownMenuItem className={itemClass} onClick={onTemplates}>
            <Compass className="size-4 text-muted-foreground" />
            {t("exploreCommunity")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
