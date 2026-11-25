"use client";

import {
  MagnifyingGlassPlus as ZoomIn,
  MagnifyingGlassMinus as ZoomOut,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { clampZoom } from "@/components/canvas/zoom-controls";
import { useCanvasStore } from "@/store/useCanvasStore";

/** Compact horizontal zoom strip for the phone editor (above the dock). */
export function EditorPhoneZoom() {
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const t = useTranslations("editor.zoom");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center md:hidden">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-md bg-background/95 p-0.5 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onClick={() => setZoom(clampZoom(zoom - 10))}
          title={t("out")}
          aria-label={t("out")}
        >
          <ZoomOut className="size-5 stroke-[1.5]" />
        </Button>
        <button
          type="button"
          className="flex h-9 min-w-10 items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-normal tabular-nums text-foreground hover:bg-muted/60"
          onClick={() => setZoom(100)}
          title={t("reset")}
          aria-label={t("reset")}
        >
          {Math.round(zoom)}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onClick={() => setZoom(clampZoom(zoom + 10))}
          title={t("in")}
          aria-label={t("in")}
        >
          <ZoomIn className="size-5 stroke-[1.5]" />
        </Button>
      </div>
    </div>
  );
}
