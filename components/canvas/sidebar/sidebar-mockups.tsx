"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import {
  SpinnerGap as Loader2,
  DeviceMobile as Smartphone,
  Images,
} from "@phosphor-icons/react";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
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
import {
  sidebarActionBtn,
  sidebarHint,
  sidebarSegmented,
  sidebarSegmentedItem,
  sidebarSegmentedItemActive,
  sidebarSegmentedItemIdle,
  sidebarSelectTrigger,
  sidebarSurfaceIdle,
  sidebarTextarea,
} from "@/components/canvas/sidebar/sidebar-ui";

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
  const t = useTranslations("editor.mockups");
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
      <div className="space-y-3">
        <p className={sidebarHint}>
          Top lists and screenshot carousels. Drop titles, place devices, then fill every screen at once.
        </p>

        <Select
          value={device}
          onValueChange={(value) => {
            if (DEVICE_OPTIONS.some((option) => option.id === value)) {
              setDevice(value as FrameKind);
            }
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label={t("device")}>
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

        <textarea
          value={titles}
          onChange={(event) => setTitles(event.target.value)}
          placeholder={"One title per line\nNext.js\nRemix\n…"}
          rows={4}
          className={sidebarTextarea}
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
          className={cn(sidebarActionBtn, "w-full")}
        >
          {busy === "ranked" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Smartphone className="size-3.5" />
          )}
          {busy === "ranked" ? t("building") : `List · ${lineCount} slides`}
        </button>

        <div className="flex gap-1.5">
          {ROW_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setRowCount(count)}
              className={cn(
                "h-10 flex-1 rounded-md text-[13px] font-medium transition-colors",
                rowCount === count
                  ? sidebarSegmentedItemActive
                  : cn(sidebarSurfaceIdle, sidebarSegmentedItemIdle, "hover:bg-muted/80 dark:hover:bg-muted/40"),
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
          className={cn(sidebarActionBtn, "w-full")}
        >
          {busy === "row" ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {busy === "row" ? t("placing") : `Row of ${rowCount} on this slide`}
        </button>

        <div className="space-y-1.5">
          <p className={cn(sidebarHint, "font-medium")}>{t("fillScreens")}</p>
          <div className={sidebarSegmented}>
            {(
              [
                ["per-slide", t("onePerSlide")],
                ["this-slide", t("thisSlide")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFillMode(id)}
                className={cn(
                  sidebarSegmentedItem,
                  fillMode === id ? sidebarSegmentedItemActive : sidebarSegmentedItemIdle,
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
            className={cn(sidebarActionBtn, "w-full")}
          >
            {busy === "fill" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Images className="size-3.5" />
            )}
            {busy === "fill" ? t("filling") : t("pickScreenshots")}
          </button>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Multi-select photos in order. {t("onePerSlide")} walks the carousel; {t("thisSlide")} fills left → right.
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
          className={cn(sidebarActionBtn, "w-full")}
        >
          {busy === "ranked-fill" ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {busy === "ranked-fill" ? t("building") : t("listScreenshots")}
        </button>
      </div>
  );
}
