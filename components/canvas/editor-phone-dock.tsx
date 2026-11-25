"use client";

import {
  ArrowCounterClockwise as Undo2,
  ArrowClockwise as Redo2,
  House as HomeIcon,
  Shapes,
  Sliders as SlidersHorizontal,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useCanvasManager } from "@/context/canvas-manager";
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
  const tn = useTranslations("studio.nav");
  const tc = useTranslations("common");
  const manager = useCanvasManager();

  const itemClass = (active: boolean) =>
    cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-normal tracking-tight",
      active ? "text-foreground" : "text-muted-foreground",
    );

  return (
    <nav
      aria-label={t("editor")}
      className="flex shrink-0 items-stretch justify-around border-t border-border/40 bg-muted/20 px-1 pt-0.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <Link
        href="/studio"
        className={itemClass(false)}
        aria-label={tn("studioHome")}
      >
        <HomeIcon className="size-5 stroke-[1.5] opacity-80" />
        <span className="max-w-full truncate px-0.5">{tn("home")}</span>
      </Link>

      <button
        type="button"
        onClick={onLibrary}
        aria-pressed={libraryOpen}
        className={itemClass(libraryOpen)}
      >
        <Shapes
          className="size-5 stroke-[1.5]"
          weight={libraryOpen ? "fill" : "regular"}
        />
        <span className="max-w-full truncate px-0.5">{t("library")}</span>
      </button>

      <button
        type="button"
        onClick={() => void manager?.undo()}
        aria-label={tc("undo")}
        className={itemClass(false)}
      >
        <Undo2 className="size-5 stroke-[1.5] opacity-80" />
        <span className="max-w-full truncate px-0.5">{tc("undo")}</span>
      </button>

      <button
        type="button"
        onClick={() => void manager?.redo()}
        aria-label={tc("redo")}
        className={itemClass(false)}
      >
        <Redo2 className="size-5 stroke-[1.5] opacity-80" />
        <span className="max-w-full truncate px-0.5">{tc("redo")}</span>
      </button>

      <button
        type="button"
        onClick={onStyle}
        aria-pressed={styleOpen}
        className={itemClass(styleOpen)}
      >
        <SlidersHorizontal
          className="size-5 stroke-[1.5]"
          weight={styleOpen ? "fill" : "regular"}
        />
        <span className="max-w-full truncate px-0.5">{t("style")}</span>
      </button>
    </nav>
  );
}
