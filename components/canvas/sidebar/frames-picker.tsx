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
  loadBrandKit,
} from "@/lib/studio/brand-kit";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";
import { FRAME_ITEMS } from "@/components/canvas/use-element-library";

type FrameItem = (typeof FRAME_ITEMS)[number];
type FrameFamily = FrameLayoutPreset["family"];

export type FrameOrientation = "portrait" | "landscape";
export type FrameFitMode = "max" | "fit";

export type FramePlaceOptions = {
  orientation: FrameOrientation;
  color: string;
  fit: FrameFitMode;
};

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
      return { maxWidth: "82%", maxHeight: "62%" };
    case "tablet":
      return { maxWidth: "72%", maxHeight: "72%" };
    case "watch":
      return { maxWidth: "40%", maxHeight: "58%" };
    default:
      return { maxWidth: "40%", maxHeight: "86%" };
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
        "relative block aspect-[4/3] w-full min-w-0 overflow-hidden rounded-[1.25rem] text-left transition-[box-shadow,ring]",
        active
          ? "ring-2 ring-ring"
          : "ring-1 ring-transparent hover:ring-muted-foreground/25",
      )}
      style={
        clear
          ? CHECKER_STYLE
          : { backgroundColor: background }
      }
    >
      {!clear && light ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,0,0,0.06)_0%,transparent_42%),radial-gradient(circle_at_88%_78%,rgba(0,0,0,0.05)_0%,transparent_40%)]" />
      ) : null}
      {!clear && !light ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08)_0%,transparent_42%),radial-gradient(circle_at_88%_78%,rgba(255,255,255,0.05)_0%,transparent_40%)]" />
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
  const [brandKit, setBrandKit] = useState(() => loadBrandKit());
  const [selectedKind, setSelectedKind] = useState<FrameKind>("iphone18pro");
  const [layoutId, setLayoutId] = useState(FRAME_LAYOUT_PRESETS[0]!.id);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [orientation, setOrientation] = useState<FrameOrientation>("portrait");
  const fit: FrameFitMode = "max";

  useEffect(() => {
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
      { id: "kit-text", color: kit.text, label: "Brand text" },
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

  const selectedFrame =
    FRAME_ITEMS.find((item) => item.kind === selectedKind) ?? FRAME_ITEMS[0]!;
  const family = frameFamilyForKind(selectedKind);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FRAME_ITEMS.filter((item) => {
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        frameFamilyForKind(item.kind).includes(q)
      );
    });
  }, [search]);

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
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/50 px-2.5 py-2 dark:bg-muted/25">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {brandSwatches.map((swatch) => {
            const active = bgColor.toLowerCase() === swatch.color.toLowerCase();
            return (
              <button
                key={swatch.id}
                type="button"
                title={swatch.label}
                disabled={disabled}
                onClick={() => applyColor(swatch.color)}
                className={cn(
                  "size-5 shrink-0 rounded-full ring-offset-1 ring-offset-background disabled:opacity-40",
                  active && "ring-2 ring-primary",
                )}
                style={{ backgroundColor: swatch.color }}
              />
            );
          })}

          <button
            type="button"
            title="Transparent"
            disabled={disabled}
            onClick={() => applyColor("transparent")}
            className={cn(
              "size-5 shrink-0 rounded-full ring-offset-1 ring-offset-background disabled:opacity-40",
              bgColor === "transparent" && "ring-2 ring-primary",
            )}
            style={CHECKER_STYLE}
          />

          <ColorPicker
            compact
            disabled={disabled}
            value={bgColor === "transparent" ? "#ffffff" : bgColor}
            onChange={applyColor}
            title="Custom color"
            className="[&_button]:size-5"
          />
        </div>

        <div className="flex h-7 items-center rounded-full bg-background/80 p-0.5">
          <button
            type="button"
            title="Portrait"
            onClick={() => setOrientation("portrait")}
            className={cn(
              "flex size-6 items-center justify-center rounded-full transition-colors",
              orientation === "portrait"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <RectangleVertical className="size-3.5" />
          </button>
          <button
            type="button"
            title="Landscape"
            onClick={() => setOrientation("landscape")}
            className={cn(
              "flex size-6 items-center justify-center rounded-full transition-colors",
              orientation === "landscape"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <RectangleHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 px-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Devices
        </p>
        <div className="grid w-full grid-cols-2 gap-1.5">
          {filtered.map((item) => {
            const size = getDeviceScreenSize(item.kind as FrameKind);
            const active = item.kind === selectedKind;
            return (
              <button
                key={item.kind}
                type="button"
                onClick={() => setSelectedKind(item.kind as FrameKind)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 overflow-hidden rounded-2xl bg-muted/40 px-1 py-2 text-center transition-colors dark:bg-muted/20",
                  active
                    ? "bg-primary/10 ring-2 ring-inset ring-primary"
                    : "hover:bg-muted/70",
                )}
              >
                <div className="flex h-16 w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="line-clamp-2 w-full px-0.5 text-[10px] font-medium leading-tight text-foreground">
                  {item.label}
                </span>
                <span className="text-[9px] text-muted-foreground tabular-nums">
                  {size.width}×{size.height}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="col-span-2 py-8 text-center text-[13px] text-muted-foreground">
              No devices found
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 px-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Layouts
        </p>
        <div className="space-y-2 overflow-hidden rounded-[1.35rem] bg-muted/30 p-2 dark:bg-muted/15">
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
    </div>
  );
}
