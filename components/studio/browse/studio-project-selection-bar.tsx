"use client";

import {
  ArrowSquareOut as OpenInNew,
  Star,
  Trash as Trash2,
  ArrowCounterClockwise as Restore,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudioProjectSelectionBar({
  count,
  inTrash,
  className,
  onClear,
  onOpenInNewTab,
  onStar,
  onUnstar,
  onTrash,
  onRestore,
  onDeleteForever,
}: {
  count: number;
  inTrash: boolean;
  className?: string;
  onClear: () => void;
  onOpenInNewTab: () => void;
  onStar: () => void;
  onUnstar: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
}) {
  const t = useTranslations("studio.browse");
  if (count < 1) return null;

  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-1.5 rounded-md bg-foreground px-2 py-1.5 text-background shadow-sm",
        className,
      )}
    >
      <p className="px-2 text-[13px] font-medium whitespace-nowrap">
        {t("selectedCount", { n: count })}
      </p>

      {inTrash ? (
        <>
          <Button
            type="button"
            variant="ghost"
 className="rounded-md px-3 text-[13px] text-background hover:bg-background/15 hover:text-background"
            onClick={onRestore}
          >
            <Restore className="size-5" />
            {t("restore")}
          </Button>
          <Button
            type="button"
            variant="ghost"
 className="rounded-md px-3 text-[13px] text-background hover:bg-background/15 hover:text-background"
            onClick={onDeleteForever}
          >
            <Trash2 className="size-5" />
            {t("deleteForever")}
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="ghost"
 className="rounded-md px-3 text-[13px] text-background hover:bg-background/15 hover:text-background"
            onClick={onOpenInNewTab}
          >
            <OpenInNew className="size-5" />
            {t("openInNewTab")}
          </Button>
          <Button
            type="button"
            variant="ghost"
 className="rounded-md px-3 text-[13px] text-background hover:bg-background/15 hover:text-background"
            onClick={onStar}
          >
            <Star className="size-5" />
            {t("starSelected")}
          </Button>
          <Button
            type="button"
            variant="ghost"
 className="rounded-md px-3 text-[13px] text-background hover:bg-background/15 hover:text-background"
            onClick={onUnstar}
          >
            <Star className="size-5" />
            {t("unstarSelected")}
          </Button>
          <Button
            type="button"
            variant="ghost"
 className="rounded-md px-3 text-[13px] text-background hover:bg-background/15 hover:text-background"
            onClick={onTrash}
          >
            <Trash2 className="size-5" />
            {t("moveToTrash")}
          </Button>
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
 className="size-8 rounded-md text-background hover:bg-background/15 hover:text-background"
        onClick={onClear}
        aria-label={t("clearSelection")}
      >
        <X className="size-5" />
      </Button>
    </div>
  );
}
