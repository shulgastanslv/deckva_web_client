"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  CaretUpDown as ChevronsUpDown,
  DotsThree as Ellipsis,
  Rectangle as RectangleHorizontal,
  Rectangle as RectangleVertical,
} from "@phosphor-icons/react";

import { ColorPicker } from "@/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { controlH } from "@/components/ui/control";
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
      return { maxWidth: "78%", maxHeight: "52%" };
    case "tablet":
      return { maxWidth: "62%", maxHeight: "62%" };
    case "watch":
      return { maxWidth: "36%", maxHeight: "48%" };
    default:
      return { maxWidth: "34%", maxHeight: "72%" };
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
        "group relative mx-1 block aspect-[5/4] w-[calc(100%-0.5rem)] min-w-0 overflow-hidden rounded-md text-left transition-colors",
        active
          ? "bg-muted/60 ring-1 ring-ring/40"
          : "hover:bg-muted/40",
      )}
      style={clear ? CHECKER_STYLE : { backgroundColor: background }}
    >
      {!clear && light ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,0,0,0.04)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,rgba(0,0,0,0.035)_0%,transparent_40%)]" />
      ) : null}
      {!clear && !light ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.08)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.05)_0%,transparent_40%)]" />
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frame.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute object-contain drop-shadow-sm"
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
  search: externalSearch = "",
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
  const t = useTranslations("editor.frames");
  const projectPalette = useCanvasStore((s) => s.palette);
  const [brandKit, setBrandKit] = useState(defaultBrandKit);
  const [selectedKind, setSelectedKind] = useState<FrameKind>("iphone18pro");
  const [layoutId, setLayoutId] = useState(FRAME_LAYOUT_PRESETS[0]!.id);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [orientation, setOrientation] = useState<FrameOrientation>("portrait");
  const [deviceOpen, setDeviceOpen] = useState(false);
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

  const footerSwatches = useMemo(() => {
    const list = [
      { id: "white", color: "#ffffff", label: "White" },
      {
        id: "accent",
        color: brandKit.palette.accent || projectPalette.accent || "#1e3a5f",
        label: "Accent",
      },
    ];
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = item.color.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [brandKit, projectPalette]);

  const devices = useMemo(() => {
    const q = externalSearch.trim().toLowerCase();
    return FRAME_ITEMS.filter((item) => {
      if (!q) return true;
      const family = frameFamilyForKind(item.kind);
      return (
        item.label.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        family.includes(q)
      );
    });
  }, [externalSearch]);

  useEffect(() => {
    if (devices.some((item) => item.kind === selectedKind)) return;
    const next = devices[0];
    if (next) setSelectedKind(next.kind as FrameKind);
  }, [devices, selectedKind]);

  const selectedFrame =
    FRAME_ITEMS.find((item) => item.kind === selectedKind) ?? FRAME_ITEMS[0]!;
  const family = frameFamilyForKind(selectedKind);
  const selectedSize = getDeviceScreenSize(selectedKind);

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
      <Popover open={deviceOpen} onOpenChange={setDeviceOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || devices.length === 0}
            className={cn(
              "flex w-full min-w-0 items-center gap-2.5 rounded-md border-none bg-muted/40 px-3.5 text-left shadow-none transition-colors hover:bg-muted/60 disabled:opacity-40 dark:bg-muted/30 dark:hover:bg-muted/45",
              controlH,
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background/80 dark:bg-background/35">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedFrame.src}
                alt=""
                className="max-h-6 max-w-6 object-contain"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-normal text-foreground">
                {selectedFrame.label}
              </span>
              <span className="block text-[11px] font-normal tabular-nums text-muted-foreground">
                {selectedSize.width} × {selectedSize.height}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border-0 p-0 shadow-sm dark:border dark:border-border/50"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[min(22rem,50vh)] overflow-y-auto overscroll-contain px-2.5 pt-2.5 pb-2 [scrollbar-width:thin]">
            <div className="grid grid-cols-3 gap-1.5">
              {devices.map((item) => {
                const active = item.kind === selectedKind;
                const size = getDeviceScreenSize(item.kind as FrameKind);
                return (
                  <button
                    key={item.kind}
                    type="button"
                    title={item.label}
                    onClick={() => {
                      setSelectedKind(item.kind as FrameKind);
                      setDeviceOpen(false);
                    }}
                    className={cn(
                      "flex min-w-0 flex-col items-center gap-1.5 rounded-md px-1.5 py-2.5 text-center transition-colors",
                      active
                        ? "bg-muted/60 text-foreground"
                        : "hover:bg-muted/40 dark:hover:bg-muted/35",
                    )}
                  >
                    <span className="flex h-16 w-full items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    </span>
                    <span className="w-full truncate text-[11px] font-normal leading-tight text-foreground">
                      {item.label}
                    </span>
                    <span className="w-full truncate text-[10px] tabular-nums text-muted-foreground">
                      {size.width} × {size.height}
                    </span>
                  </button>
                );
              })}
            </div>
            {devices.length === 0 ? (
              <p className="px-2 py-10 text-center text-[13px] text-muted-foreground">
                {t("noDevices")}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-t border-border/40 px-3 py-2.5">
            <div
              role="group"
              aria-label={t("backgroundColor")}
              className="flex min-w-0 flex-1 items-center gap-1.5"
            >
              {footerSwatches.map((swatch) => {
                const active =
                  bgColor.toLowerCase() === swatch.color.toLowerCase();
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
                      "size-6 shrink-0 rounded-md ring-offset-1 ring-offset-popover disabled:opacity-40",
                      active && "ring-2 ring-ring",
                    )}
                    style={{ backgroundColor: swatch.color }}
                  />
                );
              })}
              <button
                type="button"
                title={t("transparent")}
                aria-label={t("transparentBackground")}
                aria-pressed={bgColor === "transparent"}
                disabled={disabled}
                onClick={() => applyColor("transparent")}
                className={cn(
                  "size-6 shrink-0 rounded-md ring-offset-1 ring-offset-popover disabled:opacity-40",
                  bgColor === "transparent" && "ring-2 ring-ring",
                )}
                style={CHECKER_STYLE}
              />
              <ColorPicker
                compact
                disabled={disabled}
                value={bgColor === "transparent" ? "#ffffff" : bgColor}
                onChange={applyColor}
                title={t("customColor")}
                className="[&_button]:size-6"
              />
            </div>

            <div
              role="group"
              aria-label={t("orientation")}
              className={cn(
                "flex shrink-0 items-center rounded-md bg-muted/40 p-0.5 dark:bg-muted/30",
                controlH,
              )}
            >
              <button
                type="button"
                title={t("portrait")}
                aria-pressed={orientation === "portrait"}
                onClick={() => setOrientation("portrait")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md transition-colors",
                  orientation === "portrait"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <RectangleVertical className="size-3.5" />
              </button>
              <button
                type="button"
                title={t("landscape")}
                aria-pressed={orientation === "landscape"}
                onClick={() => setOrientation("landscape")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md transition-colors",
                  orientation === "landscape"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <RectangleHorizontal className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              title={t("more")}
              aria-label={t("moreOptions")}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Ellipsis className="size-3.5" />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex w-full flex-col gap-2.5">
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
