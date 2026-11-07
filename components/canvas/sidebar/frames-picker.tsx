"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Ellipsis,
  RectangleHorizontal,
  RectangleVertical,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FrameKind } from "@/lib/canvas/frames";
import {
  FRAME_LAYOUT_PRESETS,
  frameFamilyForKind,
  type FrameLayoutPreset,
} from "@/lib/canvas/frame-layouts";
import { getDeviceScreenSize } from "@/lib/canvas/device-mockup";
import { cn } from "@/lib/utils";
import { FRAME_ITEMS } from "@/components/canvas/use-element-library";

type FrameItem = (typeof FRAME_ITEMS)[number];
type FrameFamily = FrameLayoutPreset["family"];

const FRAME_COLORS = [
  { id: "navy", color: "#1e3a5f", label: "Navy" },
  { id: "orange", color: "#e8943a", label: "Orange" },
  { id: "white", color: "#ffffff", label: "White" },
  { id: "clear", color: "transparent", checkered: true, label: "Clear" },
] as const;

export type FrameColorId = (typeof FRAME_COLORS)[number]["id"];
export type FrameOrientation = "portrait" | "landscape";
export type FrameFitMode = "max" | "fit";

export type FramePlaceOptions = {
  orientation: FrameOrientation;
  color: FrameColorId;
  fit: FrameFitMode;
};

const COLOR_TO_BG: Record<FrameColorId, string> = {
  navy: "#1e3a5f",
  orange: "#e8943a",
  white: "#ffffff",
  clear: "transparent",
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

function LayoutCard({
  layout,
  frame,
  family,
  active,
  onSelect,
}: {
  layout: FrameLayoutPreset;
  frame: FrameItem;
  family: FrameFamily;
  active: boolean;
  onSelect: () => void;
}) {
  const size = previewSize(family);

  return (
    <button
      type="button"
      onClick={onSelect}
      title={layout.label}
      className={cn(
        "relative block aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-white text-left transition-[outline-color]",
        active
          ? "outline outline-2 outline-offset-2 outline-ring"
          : "outline outline-1 outline-transparent",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,#e8e8ea_0%,transparent_42%),radial-gradient(circle_at_85%_80%,#d4d4d8_0%,transparent_40%),linear-gradient(180deg,#f7f7f8_0%,#ececee_100%)]" />
      <div className="pointer-events-none absolute -left-6 top-2 size-20 rounded-full bg-neutral-300/50 blur-xl" />
      <div className="pointer-events-none absolute -right-4 bottom-0 size-16 rounded-full bg-neutral-400/40 blur-lg" />

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
  onPlace,
  onBackground,
}: {
  disabled?: boolean;
  onPlace: (
    kind: FrameKind,
    layout: FrameLayoutPreset,
    options: FramePlaceOptions,
  ) => void;
  onBackground?: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<FrameKind>("iphone18pro");
  const [layoutId, setLayoutId] = useState(FRAME_LAYOUT_PRESETS[0]!.id);
  const [colorId, setColorId] = useState<FrameColorId>("white");
  const [orientation, setOrientation] = useState<FrameOrientation>("portrait");
  const [fit, setFit] = useState<FrameFitMode>("max");

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

  const place = (layout: FrameLayoutPreset, close = false) => {
    setLayoutId(layout.id);
    onPlace(
      selectedKind,
      {
        ...layout,
        angle: orientation === "landscape" ? layout.angle + 90 : layout.angle,
      },
      {
        orientation,
        color: colorId,
        fit,
      },
    );
    if (close) setOpen(false);
  };

  const placeDefault = () => {
    const current =
      layoutPresets.find((p) => p.id === layoutId) ?? layoutPresets[0];
    if (current) place(current, true);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-between gap-2 rounded-full border-0 px-2.5 text-[13px] font-medium shadow-none",
              open
                ? "bg-primary/15 text-foreground dark:bg-primary/25"
                : "bg-muted/60 dark:bg-muted/25",
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFrame.src}
                  alt=""
                  className="max-h-6 max-w-5 object-contain"
                />
              </span>
              <span className="truncate">{selectedFrame.label}</span>
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[min(21.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.35rem] border-0 bg-popover p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Search */}
          <div className="px-3 pt-3">
            <label className="flex h-9 items-center gap-2 rounded-full bg-muted/70 px-3 dark:bg-muted/40">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-full w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          {/* Device grid — stays open so color/orientation are usable */}
          <ScrollArea className="h-[min(20rem,50vh)]">
            <div className="grid grid-cols-3 gap-1 px-2 py-2.5">
              {filtered.map((item) => {
                const size = getDeviceScreenSize(item.kind as FrameKind);
                const active = item.kind === selectedKind;
                return (
                  <button
                    key={item.kind}
                    type="button"
                    onClick={() => setSelectedKind(item.kind as FrameKind)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-center transition-colors",
                      active
                        ? "bg-primary/10 outline outline-2 outline-offset-[-1px] outline-primary"
                        : "hover:bg-muted/70",
                    )}
                  >
                    <div className="flex h-[4.5rem] w-full items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="line-clamp-2 min-h-[2rem] text-[11px] font-medium leading-tight text-foreground">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {size.width}×{size.height}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 ? (
                <p className="col-span-3 py-10 text-center text-[13px] text-muted-foreground">
                  No devices found
                </p>
              ) : null}
            </div>
          </ScrollArea>

          {/* Docked toolbar — like the reference */}
          <div className="flex items-center justify-between gap-2 bg-muted/30 px-3 py-2.5 dark:bg-muted/20">
            <div className="flex items-center gap-2">
              {FRAME_COLORS.map((swatch) => {
                const active = colorId === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    title={swatch.label}
                    disabled={disabled}
                    onClick={() => {
                      setColorId(swatch.id);
                      onBackground?.(COLOR_TO_BG[swatch.id]);
                    }}
                    className={cn(
                      "size-[18px] shrink-0 rounded-full disabled:opacity-40",
                      active &&
                        "outline outline-2 outline-offset-2 outline-primary",
                    )}
                    style={
                      "checkered" in swatch && swatch.checkered
                        ? CHECKER_STYLE
                        : { backgroundColor: swatch.color }
                    }
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex h-8 items-center rounded-full bg-muted/80 p-0.5 dark:bg-muted/50">
                <button
                  type="button"
                  title="Portrait"
                  onClick={() => setOrientation("portrait")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-colors",
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
                  onClick={() => setOrientation("landscape")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-colors",
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
                title={fit === "max" ? "Place (Max)" : "Place (Fit)"}
                disabled={disabled || layoutPresets.length === 0}
                onClick={() => {
                  // Long-press alternative: cycle fit on alt/shift click
                  placeDefault();
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFit((prev) => (prev === "max" ? "fit" : "max"));
                }}
                className="flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 dark:bg-muted/50"
              >
                <Ellipsis className="size-3.5" />
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="max-h-[26rem] space-y-2 overflow-y-auto rounded-[1.35rem] bg-neutral-950 p-2 dark:bg-black">
        {layoutPresets.map((layout) => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            frame={selectedFrame}
            family={family}
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
