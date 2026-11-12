"use client";

import { MagicWand as WandSparkles } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TEXT_REFACTOR_KINDS,
  type TextRefactorKind,
} from "@/lib/canvas/text-refactor";
import { cn } from "@/lib/utils";

/** Compact refactor menu for selected text (inspector / selection toolbar). */
export function TextRefactorMenu({
  onRefactor,
  disabled,
  compact,
  className,
}: {
  onRefactor: (kind: TextRefactorKind) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const t = useTranslations("editor.inspector");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={compact ? "ghost" : "secondary"}
          size={compact ? "icon" : "sm"}
          disabled={disabled}
          title={t("refactor")}
          aria-label={t("refactor")}
          className={cn(
            compact
              ? "size-9 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/70 hover:text-foreground"
              : "h-9 gap-1.5 rounded-md border-none bg-muted/40 px-3 text-[13px] font-medium text-foreground shadow-none hover:bg-muted/60",
            className,
          )}
        >
          {compact ? null : <span>{t("refactor")}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-52 rounded-2xl p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
          {t("refactor")}
        </DropdownMenuLabel>
        {TEXT_REFACTOR_KINDS.map((row) => (
          <DropdownMenuItem
            key={row.id}
            className="cursor-pointer rounded-xl px-2 py-1.5 text-[13px]"
            onSelect={() => onRefactor(row.id)}
          >
            {t(row.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
