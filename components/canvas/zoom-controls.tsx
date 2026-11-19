"use client";

import {
  Eraser,
  Hand,
  Cursor as MousePointer2,
  MagnifyingGlassPlus as ZoomIn,
  MagnifyingGlassMinus as ZoomOut,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/useCanvasStore";

export const MIN_ZOOM = 25;
export const MAX_ZOOM = 400;

export function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

const cell =
  "size-9 shrink-0 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export function ZoomControls({
  showTools = true,
}: {
  /** Select / hand / eraser cluster. Off in focus mode (tools live in ElementsToolbar). */
  showTools?: boolean;
}) {
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const handActive = useCanvasStore((s) => s.handActive);
  const setHandActive = useCanvasStore((s) => s.setHandActive);
  const eraserActive = useCanvasStore((s) => s.eraserActive);
  const setEraserActive = useCanvasStore((s) => s.setEraserActive);
  const t = useTranslations("editor.zoom");

  // V / H / E are handled globally in bindKeyboardShortcuts.

  const selectActive = !handActive && !eraserActive;

  return (
    <div className="flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-md bg-muted/50 p-1 dark:bg-muted/35">
      {showTools ? (
        <>
          <Button
            variant="ghost"
            size="icon"
 className={cn(cell, selectActive && "bg-background text-foreground")}
            onClick={() => {
              setHandActive(false);
              setEraserActive(false);
            }}
            title={t("toolSelect")}
            aria-pressed={selectActive}
          >
            <MousePointer2 className="size-5 stroke-[1.5]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
 className={cn(cell, handActive && "bg-background text-foreground")}
            onClick={() => setHandActive(true)}
            title={t("toolHand")}
            aria-pressed={handActive}
          >
            <Hand className="size-5 stroke-[1.5]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
 className={cn(cell, eraserActive && "bg-background text-foreground")}
            onClick={() => setEraserActive(!eraserActive)}
            title={t("toolEraser")}
            aria-pressed={eraserActive}
          >
            <Eraser className="size-5 stroke-[1.5]" />
          </Button>
          <div className="my-0.5 h-px w-5 bg-border/60" />
        </>
      ) : null}
      <Button
        variant="ghost"
        size="icon"
 className={cell}
        onClick={() => setZoom(clampZoom(zoom + 10))}
        title={t("in")}
      >
        <ZoomIn className="size-5 stroke-[1.5]" />
      </Button>
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-medium tabular-nums text-foreground hover:bg-muted/60"
        onClick={() => setZoom(100)}
        title={t("reset")}
      >
        {Math.round(zoom)}
      </button>
      <Button
        variant="ghost"
        size="icon"
 className={cell}
        onClick={() => setZoom(clampZoom(zoom - 10))}
        title={t("out")}
      >
        <ZoomOut className="size-5 stroke-[1.5]" />
      </Button>
    </div>
  );
}
