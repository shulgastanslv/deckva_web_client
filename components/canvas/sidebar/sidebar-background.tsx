"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, Loader2, Plus, ImageIcon } from "lucide-react";
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
import { useCanvasManager } from "@/context/canvas-manager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreenSplit } from "@/components/canvas/sidebar/screen-split";
import { BackgroundPattern } from "@/components/canvas/sidebar/background-pattern";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { ColorPicker } from "@/components/ui/color-picker";
import { BackgroundSlideSets } from "@/components/canvas/sidebar/background-slide-sets";

type Tab = "color" | "gradient" | "image";

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
    <div className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 hover:bg-muted/40">
      <button
        type="button"
        title={`Fill this slide with ${set.background}`}
        onClick={onFillSlide}
        className="h-7 w-7 shrink-0 rounded-full border border-border/40 transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: set.background }}
      />
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {SET_SWATCHES.slice(1).map((swatch) => (
          <span
            key={swatch.key}
            title={`${swatch.label} ${set[swatch.key]}`}
            className="h-3.5 w-3.5 rounded-full border border-border/40"
            style={{ backgroundColor: set[swatch.key] }}
          />
        ))}
        <span className="truncate text-foreground">{set.label}</span>
      </div>
      <Button type="button" size="xs" variant="secondary" className="rounded-full" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}

const FILL_TABS: { id: Tab; label: string }[] = [
  { id: "color", label: "Color" },
  { id: "gradient", label: "Gradient" },
  { id: "image", label: "Image" },
];

export function SidebarBackground() {
  const manager = useCanvasManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("color");
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const projectPalette = useCanvasStore((s) => s.palette);
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const currentSlideId = useCanvasStore((s) => s.currentSlideId);
  const [paletteScope, setPaletteScope] = useState<"all" | "marked" | "slide">("all");
  const [slidePalette, setSlidePalette] = useState<ProjectPalette | null>(null);

  useEffect(() => {
    setSlidePalette((current) => (current ? useCanvasStore.getState().palette : current));
  }, [currentSlideId]);

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
    void manager?.setBackground({ type: "solid", color });
  };

  const applyGradient = (colors: [string, string]) => {
    void manager?.setBackground({ type: "gradient", colors });
  };

  const applyImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    void fileToDataUrl(file)
      .then((dataUrl) => manager?.setBackground({ type: "image", url: dataUrl }))
      .catch(console.error);
  };

  const applyImageFromUrl = async () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
      if (!/^https?:$/i.test(parsed.protocol)) {
        setUrlError("Need http(s) URL");
        return;
      }
    } catch {
      setUrlError("Invalid URL");
      return;
    }

    setUrlError(null);
    setUrlLoading(true);
    try {
      await manager?.setBackground({ type: "image", url: parsed.toString() });
    } catch (err) {
      console.error(err);
      setUrlError("Couldn't load image (CORS?)");
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col overflow-hidden text-[13px] text-foreground">
      <CollapsibleGroup id="background-split" title="Screen split">
        <ScreenSplit />
      </CollapsibleGroup>

      <CollapsibleGroup id="background-fill" title="Fill">
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="gap-2">
        <TabsList className="grid h-8 w-full grid-cols-3 rounded-full">
          {FILL_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="rounded-full text-[13px] shadow-none data-active:border-transparent dark:data-active:border-transparent"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="color">
          <div className="grid grid-cols-6 gap-1.5">
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
              className="relative flex aspect-square items-center justify-center rounded-full border border-dashed border-border/80 bg-muted/30 transition-transform hover:scale-110"
            >
              <ColorPicker
                compact
                value="#888888"
                onChange={(hex) => applySolid(hex)}
                title="Custom color"
                className="absolute inset-0 flex items-center justify-center [&_button]:size-full [&_button]:rounded-full [&_button]:ring-0 [&_button]:hover:scale-100"
              />
              <Plus className="pointer-events-none relative z-10 h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient">
          <div className="grid grid-cols-6 gap-1.5">
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) applyImageFile(file);
                e.target.value = "";
              }}
              accept="image/*"
              className="hidden"
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) applyImageFile(file);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed p-4 text-center transition-colors",
                isDragging
                  ? "border-foreground/40 bg-muted/40"
                  : "border-border/80 bg-muted/20 hover:bg-muted/35",
              )}
            >
              <UploadCloud className="h-4 w-4 text-muted-foreground" />
              <span className="text-[13px] font-medium">Upload</span>
              <span className="text-[13px] text-muted-foreground">Drop or click</span>
            </div>

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
                  className="h-8 text-[13px]"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={urlLoading || !imageUrl.trim()}
                  onClick={() => void applyImageFromUrl()}
                  className="rounded-full"
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

      <CollapsibleGroup id="background-pattern" title="Pattern">
        <BackgroundPattern />
      </CollapsibleGroup>

      <CollapsibleGroup id="background-palette" title="Palette">
        <div className="flex rounded-full bg-muted/50 p-0.5">
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
                "h-7 flex-1 rounded-full text-[13px] transition-colors",
                paletteScope === id ? "bg-background text-foreground shadow-xs" : "text-muted-foreground",
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
              className="rounded-full px-2 py-1.5 hover:bg-muted/30"
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

      <CollapsibleGroup id="background-sets" title="Suggest a set">
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
    </div>
  );
}
