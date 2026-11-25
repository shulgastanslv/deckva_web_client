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

import { mobileGlassDock } from "@/components/studio/ui/mobile-glass";
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
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-normal tracking-tight transition-colors",
      active
        ? "bg-muted/50 text-foreground"
        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
    );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 md:hidden">
      <nav
        aria-label={t("editor")}
        className={cn(
          "pointer-events-auto flex items-stretch justify-around gap-0.5 px-1.5 py-1.5",
          mobileGlassDock,
        )}
      >
        <Link
          href="/studio"
          className={itemClass(false)}
          aria-label={tn("studioHome")}
        >
          <HomeIcon className="size-5 stroke-[1.5]" />
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
          <Undo2 className="size-5 stroke-[1.5]" />
          <span className="max-w-full truncate px-0.5">{tc("undo")}</span>
        </button>

        <button
          type="button"
          onClick={() => void manager?.redo()}
          aria-label={tc("redo")}
          className={itemClass(false)}
        >
          <Redo2 className="size-5 stroke-[1.5]" />
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
    </div>
  );
}
