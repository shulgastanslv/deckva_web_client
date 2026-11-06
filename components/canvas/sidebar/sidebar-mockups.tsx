"use client";

import { useRef, useState } from "react";
import { Loader2, Smartphone, Laptop, Images } from "lucide-react";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { splitSlideLines } from "@/lib/canvas/document";
import type { FrameKind } from "@/lib/canvas/frames";
import {
  buildDeviceRow,
  buildRankedMockupSlides,
  fillMockupsFromImages,
} from "@/lib/canvas/mockup-batch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const actionButton =
  "h-10 rounded-full bg-muted/60 dark:bg-muted/25 px-3 text-[13px] font-medium text-foreground/85 transition-colors hover:bg-muted/80 dark:hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-40 flex items-center justify-center gap-1.5";

const DEVICE_OPTIONS: { id: FrameKind; label: string }[] = [
  { id: "iphone18pro", label: "iPhone 18 Pro" },
  { id: "iphone17pro", label: "iPhone 17 Pro" },
  { id: "iphone17promax", label: "iPhone 17 Pro Max" },
  { id: "iphone18promax", label: "iPhone 18 Pro Max" },
  { id: "iphoneDuoClose", label: "iPhone Duo Close" },
  { id: "iphoneDuoOpen", label: "iPhone Duo Open" },
  { id: "iphoneAir", label: "iPhone Air" },
];

const ROW_COUNTS = [3, 4, 5] as const;

async function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
  const urls: string[] = [];
  for (const file of list) {
    urls.push(await fileToDataUrl(file, { maxEdge: 1600, quality: 0.88 }));
  }
  return urls;
}

export function SidebarMockups() {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const fillInputRef = useRef<HTMLInputElement>(null);
  const [titles, setTitles] = useState("Next.js\nRemix\nNuxt\nSvelteKit\nAstro");
  const [device, setDevice] = useState<FrameKind>("iphone18pro");
  const [rowCount, setRowCount] = useState<(typeof ROW_COUNTS)[number]>(5);
  const [fillMode, setFillMode] = useState<"this-slide" | "per-slide">("per-slide");
  const [busy, setBusy] = useState<string | null>(null);

  const lineCount = splitSlideLines(titles).length;
  const ready = !!manager && !!slidesController && !busy;

  const run = async (label: string, task: () => Promise<void>) => {
    if (!manager || !slidesController || busy) return;
    setBusy(label);
    try {
      await task();
    } catch (err) {
      reportError(err, messages.errors.generic);
    } finally {
      setBusy(null);
    }
  };

  const onFillFiles = (files: FileList | null) => {
    if (!files?.length || !manager || !slidesController) return;
    void run("fill", async () => {
      const screens = await filesToDataUrls(files);
      if (screens.length === 0) return;
      await fillMockupsFromImages({
        manager,
        slides: slidesController,
        kind: device,
        screens,
        mode: fillMode,
      });
    });
  };

  return (
    <CollapsibleGroup id="tools-mockups" title="Mockups" defaultOpen>
      <div className="space-y-3">
        <p className="px-0.5 text-[12px] leading-snug text-muted-foreground">
          Top lists and screenshot carousels. Drop titles, place devices, then fill every screen at once.
        </p>

        <div className="flex gap-1">
          <Select
            value={device}
            onValueChange={(value) => {
              if (DEVICE_OPTIONS.some((option) => option.id === value)) {
                setDevice(value as FrameKind);
              }
            }}
          >
            <SelectTrigger className="h-10 min-w-0 flex-1 rounded-full border-0 bg-muted/60 dark:bg-muted/25 px-3.5 text-[13px] shadow-none hover:bg-muted/80 dark:hover:bg-muted/40 data-[size=default]:h-10" aria-label="Device">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {DEVICE_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id} className="text-[13px]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <textarea
          value={titles}
          onChange={(event) => setTitles(event.target.value)}
          placeholder={"One title per line\nNext.js\nRemix\n…"}
          rows={4}
          className="w-full resize-none rounded-[1.25rem] bg-muted/60 dark:bg-muted/25 px-3.5 py-3 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/80 dark:focus:bg-muted/40"
        />

        <button
          type="button"
          disabled={!ready || lineCount === 0}
          onClick={() =>
            void run("ranked", async () => {
              await buildRankedMockupSlides({
                manager: manager!,
                slides: slidesController!,
                kind: device,
                titles: splitSlideLines(titles),
              });
            })
          }
          className={cn(actionButton, "w-full")}
        >
          {busy === "ranked" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Smartphone className="size-3.5" />
          )}
          {busy === "ranked" ? "Building…" : `List · ${lineCount} slides`}
        </button>

        <div className="flex gap-1">
          {ROW_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setRowCount(count)}
              className={cn(
                "h-10 flex-1 rounded-full text-[13px] font-medium transition-colors",
                rowCount === count
                  ? "bg-background text-foreground"
                  : "bg-muted/60 dark:bg-muted/25 text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/40 hover:text-foreground",
              )}
            >
              {count}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            void run("row", async () => {
              await buildDeviceRow({
                manager: manager!,
                kind: device,
                count: rowCount,
              });
            })
          }
          className={cn(actionButton, "w-full")}
        >
          {busy === "row" ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {busy === "row" ? "Placing…" : `Row of ${rowCount} on this slide`}
        </button>

        <div className="space-y-1.5">
          <p className="px-0.5 text-[12px] font-medium text-muted-foreground">Fill screens</p>
          <div className="flex h-10 rounded-full bg-muted/60 dark:bg-muted/25 p-1">
            {(
              [
                ["per-slide", "One per slide"],
                ["this-slide", "This slide"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFillMode(id)}
                className={cn(
                  "h-full flex-1 rounded-full text-[13px] font-medium transition-colors",
                  fillMode === id
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            ref={fillInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              onFillFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={!ready}
            onClick={() => fillInputRef.current?.click()}
            className={cn(actionButton, "w-full")}
          >
            {busy === "fill" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Images className="size-3.5" />
            )}
            {busy === "fill" ? "Filling…" : "Pick screenshots"}
          </button>
          <p className="px-0.5 text-[11px] leading-snug text-muted-foreground">
            Multi-select photos in order. One per slide walks the carousel; This slide fills left → right.
          </p>
        </div>

        <button
          type="button"
          disabled={!ready || lineCount === 0}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.multiple = true;
            input.onchange = () => {
              const files = input.files;
              if (!files?.length || !manager || !slidesController) return;
              void run("ranked-fill", async () => {
                const screens = await filesToDataUrls(files);
                await buildRankedMockupSlides({
                  manager,
                  slides: slidesController,
                  kind: device,
                  titles: splitSlideLines(titles),
                  screens,
                });
              });
            };
            input.click();
          }}
          className={cn(actionButton, "w-full")}
        >
          {busy === "ranked-fill" ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {busy === "ranked-fill" ? "Building…" : "List + screenshots"}
        </button>
      </div>
    </CollapsibleGroup>
  );
}
