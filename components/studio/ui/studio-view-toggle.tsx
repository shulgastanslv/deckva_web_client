"use client";

import {
  SquaresFour as LayoutGrid,
  List,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
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
    <div className="flex h-9 items-center gap-0.5 rounded-md bg-muted/40 p-0.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("gridView")}
        onClick={() => onChange("grid")}
        className={cn(
          "size-8 rounded-md border-none shadow-none",
          view === "grid"
            ? "bg-background text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("listView")}
        onClick={() => onChange("list")}
        className={cn(
          "size-8 rounded-md border-none shadow-none",
          view === "list"
            ? "bg-background text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <List className="size-5" />
      </Button>
    </div>
  );
}
