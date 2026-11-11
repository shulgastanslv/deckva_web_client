"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, ImageIcon, Palette, Check } from "lucide-react";
import {
  SOLID_PRESETS,
  GRADIENT_PRESETS,
  SUGGESTED_SETS,
  type SuggestedSet,
} from "@/lib/presets/backgrounds";
import {
  PALETTE_SLOTS,
  paintSlide,
  type PaletteSlot,
  type ProjectPalette,
} from "@/lib/canvas/document";
import { paintSlotOnCanvas } from "@/lib/canvas/paint-live";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { useCanvasManager } from "@/context/canvas-manager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScreenSplit } from "@/components/canvas/sidebar/screen-split";
import { BackgroundPattern } from "@/components/canvas/sidebar/background-pattern";
import { UploadOrDrop } from "@/components/canvas/sidebar/upload-or-drop";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { ColorPicker } from "@/components/ui/color-picker";
import { BackgroundSlideSets } from "@/components/canvas/sidebar/background-slide-sets";
import {
  BRAND_KIT_CHANGED,
  applyBrandKitToStore,
  loadBrandKit,
  type BrandKit,
} from "@/lib/studio/brand-kit";
import { DDDEPTH_BACKGROUNDS, DDDEPTH_COUNT } from "@/lib/presets/dddepth";
import {
  sidebarActionBtn,
  sidebarFieldInput,
  sidebarSegmented,
  sidebarSegmentedItem,
  sidebarSegmentedItemActive,
  sidebarSegmentedItemIdle,
  sidebarSwatchGrid,
  sidebarTabsList,
  sidebarTabsTrigger,
} from "@/components/canvas/sidebar/sidebar-ui";

type Tab = "color" | "gradient" | "image" | "shapes";

const DDDEPTH_QUICK = 9;

const SET_SWATCHES: { key: keyof Pick<SuggestedSet, "background" | "text" | "accent" | "card">; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "text", label: "Text" },
  { key: "accent", label: "Accent" },
  { key: "card", label: "Card" },
];

function SuggestedSetRow({
  set,
  onFillSlide,
  onApply,
}: {
  set: SuggestedSet;
  onFillSlide: () => void;
  onApply: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md py-1 pr-1 pl-1 hover:bg-muted/40">
      <button
        type="button"
        title={`Fill this slide with ${set.background}`}
        onClick={onFillSlide}
        className="h-7 w-7 shrink-0 rounded-md border border-border/40 transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: set.background }}
      />
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {SET_SWATCHES.slice(1).map((swatch) => (
          <span
            key={swatch.key}
            title={`${swatch.label} ${set[swatch.key]}`}
            className="h-3.5 w-3.5 rounded-md border border-border/40"
            style={{ backgroundColor: set[swatch.key] }}
          />
        ))}
        <span className="truncate text-foreground">{set.label}</span>
      </div>
      <Button type="button" size="xs" variant="secondary" className="rounded-md" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}

const FILL_TABS: { id: Tab; label: string }[] = [
  { id: "color", label: "Color" },
  { id: "gradient", label: "Gradient" },
  { id: "shapes", label: "3D" },
  { id: "image", label: "Image" },
];

export function SidebarBackground() {
  const manager = useCanvasManager();
  const [tab, setTab] = useState<Tab>("color");
  const [imageUrl, setImageUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [activeBg, setActiveBg] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const projectPalette = useCanvasStore((s) => s.palette);
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const currentSlideId = useCanvasStore((s) => s.currentSlideId);
  const [paletteScope, setPaletteScope] = useState<"all" | "marked" | "slide">("all");
  const [slidePalette, setSlidePalette] = useState<ProjectPalette | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  useEffect(() => {
    setSlidePalette((current) => (current ? useCanvasStore.getState().palette : current));
  }, [currentSlideId]);

  useEffect(() => {
    const refresh = () => setBrandKit(loadBrandKit());
    refresh();
    window.addEventListener(BRAND_KIT_CHANGED, refresh);
    return () => window.removeEventListener(BRAND_KIT_CHANGED, refresh);
  }, []);

  const shownPalette = paletteScope === "slide" && slidePalette ? slidePalette : projectPalette;

  const applyProjectPalette = (next: ProjectPalette) => {
    const store = useCanvasStore.getState();
    const ids =
      paletteScope === "slide"
        ? new Set([store.currentSlideId])
        : paletteScope === "marked"
          ? new Set(store.markedSlideIds)
          : null;
    if (ids && ids.size === 0) return;

    const before = paletteScope === "slide" && slidePalette ? slidePalette : store.palette;
    const slots = Object.keys(next) as PaletteSlot[];
    if (slots.every((slot) => next[slot] === before[slot])) return;

    const changed = slots.filter((slot) => next[slot] !== before[slot]);
    const slides = store.slides.map((slide) => {
      if (ids && !ids.has(slide.id)) return slide;
      let canvasJSON = slide.canvasJSON;
      for (const slot of changed) canvasJSON = paintSlide(canvasJSON, slot, next[slot]);
      return { ...slide, canvasJSON };
    });

    if (paletteScope === "slide") setSlidePalette(next);
    else store.setPalette(next);
    store.setSlides(slides);
    store.setDirty(true);

    const paintsCurrent = !ids || ids.has(store.currentSlideId);
    if (paintsCurrent && manager) {
      for (const slot of changed) paintSlotOnCanvas(manager.canvas, slot, next[slot]);
      if (changed.includes("background")) {
        void manager.setBackground({ type: "solid", color: next.background });
      } else {
        manager.commit();
      }
    }
  };

  const setProjectSlot = (slot: PaletteSlot, color: string) => {
    applyProjectPalette({ ...shownPalette, [slot]: color });
  };

  const applySolid = (color: string) => {
    setActiveBg(null);
    void manager?.setBackground({ type: "solid", color });
  };

  const applyGradient = (colors: [string, string]) => {
    setActiveBg(null);
    void manager?.setBackground({ type: "gradient", colors });
  };

  const applyImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setActiveBg(null);
    void fileToDataUrl(file)
      .then((dataUrl) => manager?.setBackground({ type: "image", url: dataUrl }))
      .catch((err) => reportError(err, messages.errors.readImage));
  };

  const applyImageFromUrl = async () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
      if (!/^https?:$/i.test(parsed.protocol)) {
        setUrlError(messages.errors.httpUrl);
        return;
      }
    } catch {
      setUrlError(messages.errors.invalidUrl);
      return;
    }

    setUrlError(null);
    setUrlLoading(true);
    try {
      setActiveBg(null);
      await manager?.setBackground({ type: "image", url: parsed.toString() });
    } catch (err) {
      reportError(err, messages.errors.loadBackgroundCors);
      setUrlError(messages.errors.loadBackgroundCors);
    } finally {
      setUrlLoading(false);
    }
  };

  const applyDddepth = (src: string, closePicker = false) => {
    setActiveBg(src);
    void manager?.setBackground({ type: "image", url: src });
    if (closePicker) setPickerOpen(false);
  };

  return (
    <div className="flex min-w-0 flex-col text-[13px] text-foreground">
      <CollapsibleGroup id="background-fill" title="Fill" defaultOpen>
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="gap-3">
        <TabsList className={cn(sidebarTabsList, "grid-cols-4")}>
          {FILL_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(sidebarTabsTrigger, "px-1")}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="shapes" className="mt-0">
          <div className="flex flex-col gap-2">
            {activeBg ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="relative h-28 w-full overflow-hidden rounded-2xl bg-muted/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeBg} alt="" className="size-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-background/70 px-2.5 py-1.5 text-left text-[12px] font-medium backdrop-blur-sm">
                  Change background
                </span>
              </button>
            ) : null}
            <div className="grid grid-cols-3 gap-1.5">
              {DDDEPTH_BACKGROUNDS.slice(0, DDDEPTH_QUICK).map((src) => {
                const selected = activeBg === src;
                return (
                  <button
                    key={src}
                    type="button"
                    title="Set as background"
                    onClick={() => applyDddepth(src)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl bg-muted/40",
                      selected && "outline outline-2 outline-offset-1 outline-foreground",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                    {selected ? (
                      <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-foreground text-background">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              className={cn(sidebarActionBtn, "w-full")}
              onClick={() => setPickerOpen(true)}
            >
              Browse all · {DDDEPTH_COUNT}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="color">
          <div className={cn(sidebarSwatchGrid, "max-h-64 overflow-y-auto overscroll-contain pr-0.5")}>
            {SOLID_PRESETS.map((p) => (
              <button
                key={p.color}
                type="button"
                title={p.color}
                onClick={() => applySolid(p.color)}
                style={{ backgroundColor: p.color }}
                className="aspect-square rounded-full border border-border/40 transition-transform hover:scale-110 active:scale-95"
              />
            ))}
            <div
              title="Custom color"
              className="relative flex aspect-square items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/30 transition-transform hover:scale-110"
            >
              <ColorPicker
                compact
                value="#ffffff"
                onChange={(hex) => applySolid(hex)}
                title="Custom color"
                className="absolute inset-0 flex items-center justify-center [&_button]:size-full [&_button]:rounded-md [&_button]:ring-0 [&_button]:hover:scale-100"
              />
              <Plus className="pointer-events-none relative z-10 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient">
          <div className={cn(sidebarSwatchGrid, "max-h-64 overflow-y-auto overscroll-contain pr-0.5")}>
            {GRADIENT_PRESETS.map((g, i) => (
              <button
                key={`${g.colors[0]}-${g.colors[1]}-${i}`}
                type="button"
                onClick={() => applyGradient(g.colors)}
                className="aspect-square rounded-full border border-border/30 transition-transform hover:scale-[1.04] active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})`,
                }}
                aria-label={`Gradient ${i + 1}`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="image">
          <div className="flex min-w-0 flex-col gap-2.5">
            <UploadOrDrop
              disabled={!manager}
              onFiles={(files) => {
                const file = files instanceof FileList ? files[0] : files[0];
                if (file) applyImageFile(file);
              }}
            />

            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="flex items-center gap-1 font-medium text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                Or paste a link
              </p>
              <div className="flex gap-1.5">
                <Input
                  type="url"
                  placeholder="https://…"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setUrlError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void applyImageFromUrl();
                    }
                  }}
                  className={cn(sidebarFieldInput, "border-0 shadow-none")}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={urlLoading || !imageUrl.trim()}
                  onClick={() => void applyImageFromUrl()}
                  className="h-10 rounded-md px-3.5"
                >
                  {urlLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
              {urlError && <p className="text-[13px] text-destructive">{urlError}</p>}
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </CollapsibleGroup>

      <CollapsibleGroup id="background-split" title="Screen split" defaultOpen={false}>
        <ScreenSplit />
      </CollapsibleGroup>

      <CollapsibleGroup id="background-pattern" title="Pattern" defaultOpen={false}>
        <BackgroundPattern />
      </CollapsibleGroup>

      {brandKit ? (
        <CollapsibleGroup id="background-brand" title="Brand kit" defaultOpen>
          <div className="flex items-center gap-2 rounded-2xl bg-muted/30 p-2">
            <div className="flex flex-1 items-center gap-1.5">
              {PALETTE_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  title={`${slot.label} ${brandKit.palette[slot.id]}`}
                  onClick={() => {
                    if (slot.id === "background") applySolid(brandKit.palette.background);
                    else setProjectSlot(slot.id, brandKit.palette[slot.id]);
                  }}
                  className="h-7 w-7 rounded-full border border-border/40 transition-transform hover:scale-105"
                  style={{ backgroundColor: brandKit.palette[slot.id] }}
                />
              ))}
            </div>
            <Button
              type="button"
              size="xs"
              variant="secondary"
              className="rounded-md gap-1"
              onClick={() => {
                applyBrandKitToStore({
                  kit: brandKit,
                  paintBackground: true,
                  canvas: manager?.canvas ?? null,
                });
                if (manager) {
                  for (const slot of PALETTE_SLOTS) {
                    if (slot.id === "background") continue;
                    paintSlotOnCanvas(manager.canvas, slot.id, brandKit.palette[slot.id]);
                  }
                  manager.commit();
                }
              }}
            >
              <Palette className="size-3" />
              Apply
            </Button>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Apply loads palette and type styles from studio Brand kit onto this carousel.
          </p>
        </CollapsibleGroup>
      ) : null}

      <CollapsibleGroup id="background-palette" title="Palette" defaultOpen={false}>
        <div className={sidebarSegmented}>
          {(
            [
              ["all", "All"],
              ["marked", markedSlideIds.length > 0 ? `Marked ${markedSlideIds.length}` : "Marked"],
              ["slide", "This slide"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPaletteScope(id);
                setSlidePalette(id === "slide" ? useCanvasStore.getState().palette : null);
              }}
              className={cn(
                sidebarSegmentedItem,
                paletteScope === id ? sidebarSegmentedItemActive : sidebarSegmentedItemIdle,
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {paletteScope === "slide"
            ? "Colors land on this slide only. The carousel default stays as it is."
            : paletteScope === "marked"
              ? "Colors land on marked slides. Mark them with the corner check."
              : "Text, accent, and cards use these colors on the whole carousel."}
        </p>
        <div className="flex flex-col">
          {PALETTE_SLOTS.map((slot) => (
            <div
              key={slot.id}
              className="rounded-md px-2 py-1.5 hover:bg-muted/80 dark:hover:bg-muted/40"
            >
              <ColorPicker
                compact
                value={shownPalette[slot.id]}
                onChange={(hex) => setProjectSlot(slot.id, hex)}
                title={slot.label}
                caption={
                  <>
                    <span className="flex-1 text-[13px] text-foreground">
                      {slot.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                      {shownPalette[slot.id]}
                    </span>
                  </>
                }
              />
            </div>
          ))}
        </div>
      </CollapsibleGroup>

      <BackgroundSlideSets />

      <CollapsibleGroup id="background-sets" title="Suggest a set" defaultOpen={false}>
        <div className="flex flex-col gap-1">
          {SUGGESTED_SETS.map((set) => (
            <SuggestedSetRow
              key={set.id}
              set={set}
              onFillSlide={() => applySolid(set.background)}
              onApply={() => applyProjectPalette(set)}
            />
          ))}
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          The large swatch fills this slide. Apply follows All, Marked, or This slide.
        </p>
      </CollapsibleGroup>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="grid max-h-[min(40rem,85dvh)] w-[min(36rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden rounded-3xl p-4 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">
              3D backgrounds
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain pr-1">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {DDDEPTH_BACKGROUNDS.map((src) => {
                const selected = activeBg === src;
                return (
                  <button
                    key={src}
                    type="button"
                    title="Set as background"
                    onClick={() => applyDddepth(src, true)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-2xl bg-muted/40",
                      selected && "outline outline-2 outline-offset-1 outline-foreground",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-md bg-foreground text-background">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
