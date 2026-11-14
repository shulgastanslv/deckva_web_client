"use client";

import {
  SquaresFour as LayoutGrid,
  List,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { controlH } from "@/components/ui/control";
import { cn } from "@/lib/utils";

export function StudioViewToggle({
  view,
  onChange,
}: {
  view: "list" | "grid";
  onChange: (view: "list" | "grid") => void;
}) {
  const t = useTranslations("studio.browse");
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-md bg-muted/40 p-1",
        controlH,
      )}
    >
      <button
        type="button"
        aria-label={t("gridView")}
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-full aspect-square items-center justify-center rounded-md transition-colors",
          view === "grid"
            ? "bg-background text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-5 stroke-[1.5]" />
      </button>
      <button
        type="button"
        aria-label={t("listView")}
        onClick={() => onChange("list")}
        className={cn(
          "flex h-full aspect-square items-center justify-center rounded-md transition-colors",
          view === "list"
            ? "bg-background text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <List className="size-5 stroke-[1.5]" />
      </button>
    </div>
  );
}
