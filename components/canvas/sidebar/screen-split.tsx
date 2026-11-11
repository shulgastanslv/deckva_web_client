"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useCanvasManager } from "@/context/canvas-manager";
import { sidebarActionBtn, sidebarSurfaceIdle } from "@/components/canvas/sidebar/sidebar-ui";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";
import { CANVAS_SPLITS, type CanvasSplit } from "@/lib/canvas/splits";
import { useCanvasStore } from "@/store/useCanvasStore";

function imageZoneStyle(split: CanvasSplit): CSSProperties {
  const span = (100 / split.count) * split.imageTracks;
  if (split.axis === "rows") {
    return split.imageFrom === "start"
      ? { top: 0, left: 0, right: 0, height: `${span}%` }
      : { bottom: 0, left: 0, right: 0, height: `${span}%` };
  }
  return split.imageFrom === "start"
    ? { left: 0, top: 0, bottom: 0, width: `${span}%` }
    : { right: 0, top: 0, bottom: 0, width: `${span}%` };
}

function contentZoneStyle(split: CanvasSplit): CSSProperties {
  const span = (100 / split.count) * (split.count - split.imageTracks);
  if (split.axis === "rows") {
    return split.imageFrom === "start"
      ? { bottom: 0, left: 0, right: 0, height: `${span}%` }
      : { top: 0, left: 0, right: 0, height: `${span}%` };
  }
  return split.imageFrom === "start"
    ? { right: 0, top: 0, bottom: 0, width: `${span}%` }
    : { left: 0, top: 0, bottom: 0, width: `${span}%` };
}

function SplitPreview({ split }: { split: CanvasSplit }) {
  return (
    <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[0.9rem] bg-background">
      <span
        className="absolute flex flex-col justify-center gap-[7%] px-[14%]"
        style={contentZoneStyle(split)}
      >
        <span className="h-[7%] w-[72%] rounded-md bg-foreground/25 dark:bg-foreground/30" />
        <span className="h-[7%] w-full rounded-md bg-foreground/12 dark:bg-foreground/18" />
        <span className="h-[7%] w-[58%] rounded-md bg-foreground/12 dark:bg-foreground/18" />
      </span>

      <span
        className="absolute flex items-center justify-center bg-foreground text-background"
        style={imageZoneStyle(split)}
      >
        <ImagePlus
          className={cn(
            "opacity-90",
            split.imageTracks === 1 && split.count === 3 ? "size-2.5" : "size-3.5",
          )}
          strokeWidth={2}
        />
      </span>
    </span>
  );
}

export function ScreenSplit() {
  const manager = useCanvasManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [splitId, setSplitId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const active = CANVAS_SPLITS.find((split) => split.id === splitId) ?? null;

  const placeLayout = (split: CanvasSplit) => {
    if (!manager) return;
    const store = useCanvasStore.getState();
    const columns = split.axis === "columns" ? split.count : Math.max(1, store.gridColumns || 1);
    const rows = split.axis === "rows" ? split.count : Math.max(1, store.gridRows || 1);
    store.setGridColumns(columns);
    store.setGridRows(rows);
    store.setGridVisible(true);
    manager.grid.applySettings({
      columns,
      rows,
      margin: store.gridMargin,
      snapToGrid: store.snapToGrid,
    });
    manager.grid.setVisible(true);
    manager.objects.placeSplitImage(manager.grid.splitBounds(split));
    manager.grid.redraw();
    manager.commit();
    setSplitId(split.id);
  };

  const fillFromFile = async (file: File | null | undefined) => {
    if (!file || !manager || !file.type.startsWith("image/")) return;
    if (!splitId) return;
    setBusy(true);
    try {
      const current = CANVAS_SPLITS.find((item) => item.id === splitId);
      if (current) placeLayout(current);
      const dataUrl = await fileToDataUrl(file, { maxEdge: 2000, quality: 0.9 });
      await manager.objects.fillSplitImage(dataUrl);
      manager.commit();
    } catch (err) {
      reportError(err, messages.errors.addImage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void fillFromFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 gap-2">
        {CANVAS_SPLITS.map((split) => {
          const selected = splitId === split.id;
          return (
            <button
              key={split.id}
              type="button"
              disabled={!manager || busy}
              title={split.name}
              aria-label={split.name}
              aria-pressed={selected}
              onClick={() => placeLayout(split)}
              className={cn(
                "group flex flex-col gap-1.5 rounded-2xl p-1.5 text-left transition-colors disabled:pointer-events-none disabled:opacity-40",
                selected
                  ? "bg-background text-foreground outline outline-2 outline-offset-1 outline-foreground"
                  : cn(
                      sidebarSurfaceIdle,
                      "text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:hover:bg-muted/40",
                    ),
              )}
            >
              <SplitPreview split={split} />
              <span
                className={cn(
                  "px-0.5 pb-0.5 text-center text-[11px] font-medium leading-none",
                  selected
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {split.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!manager || !active || busy}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (active) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void fillFromFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          sidebarActionBtn,
          "h-11 w-full gap-2",
          dragging && "bg-muted/80 dark:bg-muted/40",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {busy ? "Adding…" : active ? `Add image · ${active.label}` : "Choose a layout first"}
      </button>

      <p className="px-0.5 text-[12px] leading-snug text-muted-foreground">
        Layout locks an image slot on the slide. Drop a photo here or tap the slot on the canvas.
      </p>
    </div>
  );
}
