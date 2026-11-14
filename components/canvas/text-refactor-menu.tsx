"use client";

import { TextT as TextT } from "@phosphor-icons/react";
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
          size="icon"
          disabled={disabled}
          title={t("refactor")}
          aria-label={t("refactor")}
 className={cn(
            "size-9 rounded-md border-none shadow-none",
            compact
              ? "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              : "bg-muted/40 text-foreground hover:bg-muted/60",
            className,
          )}
        >
          <TextT className="size-5 stroke-[1.5]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 rounded-2xl p-1.5"
      >
        <DropdownMenuLabel className="px-2.5 py-2 text-[11px] font-medium tracking-wide text-muted-foreground">
          {t("refactor")}
        </DropdownMenuLabel>
        {TEXT_REFACTOR_KINDS.map((row) => (
          <DropdownMenuItem
            key={row.id}
            className="cursor-pointer rounded-md px-2.5 py-2.5 text-[13px] font-normal"
            onSelect={() => onRefactor(row.id)}
          >
            {t(row.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
