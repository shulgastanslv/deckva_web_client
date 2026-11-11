"use client";

import {
  Shapes,
  Sliders as SlidersHorizontal,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function EditorPhoneDock({
  libraryOpen,
  styleOpen,
  onLibrary,
  onStyle,
}: {
  libraryOpen: boolean;
  styleOpen: boolean;
  onLibrary: () => void;
  onStyle: () => void;
}) {
  const t = useTranslations("editor.panels");

  return (
    <nav
      aria-label={t("editor")}
      className="flex shrink-0 items-stretch justify-around bg-muted/20 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <button
        type="button"
        onClick={onLibrary}
        aria-pressed={libraryOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
          libraryOpen ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <Shapes className="size-5 stroke-[1.75]" />
        {t("library")}
      </button>
      <button
        type="button"
        onClick={onStyle}
        aria-pressed={styleOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
          styleOpen ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <SlidersHorizontal className="size-5 stroke-[1.75]" />
        {t("style")}
      </button>
    </nav>
  );
}
