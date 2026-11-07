"use client";

import { useEffect, useMemo, useState } from "react";
import { RectangleHorizontal, RectangleVertical } from "lucide-react";

import { ColorPicker } from "@/components/ui/color-picker";
import type { FrameKind } from "@/lib/canvas/frames";
import {
  FRAME_LAYOUT_PRESETS,
  frameFamilyForKind,
  type FrameLayoutPreset,
} from "@/lib/canvas/frame-layouts";
import { getDeviceScreenSize } from "@/lib/canvas/device-mockup";
import {
  BRAND_KIT_CHANGED,
  defaultBrandKit,
  loadBrandKit,
} from "@/lib/studio/brand-kit";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";
import { FRAME_ITEMS } from "@/components/canvas/use-element-library";
import { SidebarSearchSelect } from "@/components/canvas/sidebar/sidebar-search-select";

type FrameItem = (typeof FRAME_ITEMS)[number];
type FrameFamily = FrameLayoutPreset["family"];

export type FrameOrientation = "portrait" | "landscape";
export type FrameFitMode = "max" | "fit";

export type FramePlaceOptions = {
  orientation: FrameOrientation;
  color: string;
  fit: FrameFitMode;
};

const FAMILIES: { id: FrameFamily | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "phone", label: "Phone" },
  { id: "tablet", label: "Tablet" },
  { id: "desktop", label: "Desktop" },
  { id: "watch", label: "Watch" },
];

const CHECKER_STYLE = {
  backgroundColor: "#ffffff",
  backgroundImage: [
    "linear-gradient(45deg, #c4c4c4 25%, transparent 25%)",
    "linear-gradient(-45deg, #c4c4c4 25%, transparent 25%)",
    "linear-gradient(45deg, transparent 75%, #c4c4c4 75%)",
    "linear-gradient(-45deg, transparent 75%, #c4c4c4 75%)",
  ].join(","),
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
} as const;

function previewSize(family: FrameFamily) {
  switch (family) {
    case "desktop":
      return { maxWidth: "88%", maxHeight: "58%" };
    case "tablet":
      return { maxWidth: "70%", maxHeight: "70%" };
    case "watch":
      return { maxWidth: "42%", maxHeight: "56%" };
    default:
      return { maxWidth: "38%", maxHeight: "84%" };
  }
}

function isLightHex(hex: string) {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return true;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function LayoutCard({
  layout,
  frame,
  family,
  background,
  active,
  onSelect,
}: {
  layout: FrameLayoutPreset;
  frame: FrameItem;
  family: FrameFamily;
  background: string;
  active: boolean;
  onSelect: () => void;
}) {
  const size = previewSize(family);
  const clear = background === "transparent";
  const light = !clear && isLightHex(background);

  return (
    <button
      type="button"
      onClick={onSelect}
      title={layout.label}
      className={cn(
        "group relative block aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl text-left transition-colors",
        active
          ? "bg-muted ring-2 ring-ring"
          : "bg-muted/45 hover:bg-muted dark:bg-muted/20 dark:hover:bg-muted/35",
      )}
      style={clear ? CHECKER_STYLE : { backgroundColor: background }}
    >
      {!clear && light ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,0,0,0.05)_0%,transparent_42%)]" />
      ) : null}
      {!clear && !light ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07)_0%,transparent_42%)]" />
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frame.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute object-contain"
        style={{
          left: `${layout.x * 100}%`,
          top: `${layout.y * 100}%`,
          maxWidth: size.maxWidth,
          maxHeight: size.maxHeight,
          width: "auto",
          height: "auto",
          transform: `translate(-50%, -50%) rotate(${layout.angle}deg) scale(${layout.scale})`,
          transformOrigin: "center center",
        }}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-2 pb-1.5 pt-5 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {layout.label}
      </span>
      <span className="sr-only">{layout.label}</span>
    </button>
  );
}

export function FramesPicker({
  disabled,
  search = "",
  onPlace,
  onBackground,
}: {
  disabled?: boolean;
  search?: string;
  onPlace: (
    kind: FrameKind,
    layout: FrameLayoutPreset,
    options: FramePlaceOptions,
  ) => void;
  onBackground?: (color: string) => void;
}) {
  const projectPalette = useCanvasStore((s) => s.palette);
  // Default kit on first paint so SSR/client match; hydrate from localStorage after mount.
  const [brandKit, setBrandKit] = useState(defaultBrandKit);
  const [familyFilter, setFamilyFilter] = useState<FrameFamily | "all">("phone");
  const [selectedKind, setSelectedKind] = useState<FrameKind>("iphone18pro");
  const [layoutId, setLayoutId] = useState(FRAME_LAYOUT_PRESETS[0]!.id);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [orientation, setOrientation] = useState<FrameOrientation>("portrait");
  const fit: FrameFitMode = "max";

  useEffect(() => {
    setBrandKit(loadBrandKit());
    const refresh = () => setBrandKit(loadBrandKit());
    window.addEventListener(BRAND_KIT_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(BRAND_KIT_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const brandSwatches = useMemo(() => {
    const kit = brandKit.palette;
    const project = projectPalette;
    const list = [
      { id: "kit-bg", color: kit.background, label: "Brand background" },
      { id: "kit-accent", color: kit.accent, label: "Brand accent" },
      { id: "kit-card", color: kit.card, label: "Brand card" },
      { id: "project-bg", color: project.background, label: "Project background" },
      { id: "project-accent", color: project.accent, label: "Project accent" },
    ];
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = item.color.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [brandKit, projectPalette]);

  const searchableItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FRAME_ITEMS;
    return FRAME_ITEMS.filter((item) => {
      const family = frameFamilyForKind(item.kind);
      return (
        item.label.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        family.includes(q)
      );
    });
  }, [search]);

  const visibleItems = useMemo(() => {
    if (familyFilter === "all") return searchableItems;
    return searchableItems.filter(
      (item) => frameFamilyForKind(item.kind) === familyFilter,
    );
  }, [searchableItems, familyFilter]);

  useEffect(() => {
    if (visibleItems.some((item) => item.kind === selectedKind)) return;
    const next = visibleItems[0];
    if (next) setSelectedKind(next.kind as FrameKind);
  }, [visibleItems, selectedKind]);

  const selectedFrame =
    FRAME_ITEMS.find((item) => item.kind === selectedKind) ?? FRAME_ITEMS[0]!;
  const family = frameFamilyForKind(selectedKind);

  const deviceOptions = useMemo(
    () =>
      searchableItems.map((item) => {
        const itemFamily = frameFamilyForKind(item.kind);
        const size = getDeviceScreenSize(item.kind as FrameKind);
        return {
          value: item.kind,
          label: item.label,
          description: `${size.width}×${size.height}`,
          group: itemFamily,
          keywords: `${item.kind} ${itemFamily}`,
          leading: (
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background/70 dark:bg-background/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt=""
                className="max-h-7 max-w-7 object-contain"
              />
            </span>
          ),
        };
      }),
    [searchableItems],
  );

  const layoutPresets = useMemo(() => {
    const matched = FRAME_LAYOUT_PRESETS.filter((p) => p.family === family);
    return matched.length > 0
      ? matched
      : FRAME_LAYOUT_PRESETS.filter((p) => p.family === "phone");
  }, [family]);

  const applyColor = (color: string) => {
    setBgColor(color);
    onBackground?.(color);
  };

  const place = (layout: FrameLayoutPreset) => {
    setLayoutId(layout.id);
    onBackground?.(bgColor);
    onPlace(
      selectedKind,
      {
        ...layout,
        angle: orientation === "landscape" ? layout.angle + 90 : layout.angle,
      },
      { orientation, color: bgColor, fit },
    );
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden text-[14px]">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarSearchSelect
          label="Device"
          value={selectedKind}
          options={deviceOptions}
          disabled={disabled || searchableItems.length === 0}
          onValueChange={(next) => setSelectedKind(next as FrameKind)}
          placeholder="Choose device"
          searchPlaceholder="Search devices…"
          emptyText="No devices found"
          filters={FAMILIES}
          filterValue={familyFilter}
          onFilterChange={(id) => setFamilyFilter(id as FrameFamily | "all")}
          filterAriaLabel="Device families"
          className="min-w-0 flex-1"
          triggerClassName="rounded-2xl px-2.5"
        />

        <div
          role="group"
          aria-label="Orientation"
          className="flex h-11 shrink-0 items-center rounded-2xl bg-muted/55 p-1 dark:bg-muted/25"
        >
          <button
            type="button"
            title="Portrait"
            aria-pressed={orientation === "portrait"}
            onClick={() => setOrientation("portrait")}
            className={cn(
              "flex size-9 items-center justify-center rounded-xl transition-colors",
              orientation === "portrait"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <RectangleVertical className="size-3.5" />
          </button>
          <button
            type="button"
            title="Landscape"
            aria-pressed={orientation === "landscape"}
            onClick={() => setOrientation("landscape")}
            className={cn(
              "flex size-9 items-center justify-center rounded-xl transition-colors",
              orientation === "landscape"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <RectangleHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        role="group"
        aria-label="Background color"
        className="flex min-w-0 flex-wrap items-center gap-1.5"
      >
        {brandSwatches.map((swatch) => {
          const active = bgColor.toLowerCase() === swatch.color.toLowerCase();
          return (
            <button
              key={swatch.id}
              type="button"
              title={swatch.label}
              aria-label={swatch.label}
              aria-pressed={active}
              disabled={disabled}
              onClick={() => applyColor(swatch.color)}
              className={cn(
                "size-6 shrink-0 rounded-full ring-offset-1 ring-offset-background disabled:opacity-40",
                active && "ring-2 ring-foreground/70",
              )}
              style={{ backgroundColor: swatch.color }}
            />
          );
        })}
        <button
          type="button"
          title="Transparent"
          aria-label="Transparent background"
          aria-pressed={bgColor === "transparent"}
          disabled={disabled}
          onClick={() => applyColor("transparent")}
          className={cn(
            "size-6 shrink-0 rounded-full ring-offset-1 ring-offset-background disabled:opacity-40",
            bgColor === "transparent" && "ring-2 ring-foreground/70",
          )}
          style={CHECKER_STYLE}
        />
        <ColorPicker
          compact
          disabled={disabled}
          value={bgColor === "transparent" ? "#ffffff" : bgColor}
          onChange={applyColor}
          title="Custom color"
          className="[&_button]:size-6"
        />
      </div>

      <div className="grid w-full gap-2">
        {layoutPresets.map((layout) => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            frame={selectedFrame}
            family={family}
            background={bgColor}
            active={layout.id === layoutId}
            onSelect={() => {
              if (disabled) return;
              place(layout);
            }}
          />
        ))}
      </div>
    </div>
  );
}
