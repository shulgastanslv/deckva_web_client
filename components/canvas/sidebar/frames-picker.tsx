"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretUpDown as ChevronsUpDown,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";

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
import { cn } from "@/lib/utils";
import { controlH } from "@/components/ui/control";
import { FRAME_ITEMS } from "@/components/canvas/use-element-library";

type FrameItem = (typeof FRAME_ITEMS)[number];
type FrameFamily = FrameLayoutPreset["family"];

export type FrameFitMode = "max" | "fit";

export type FramePlaceOptions = {
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
        "group relative mx-1 block aspect-[5/4] w-[calc(100%-0.5rem)] min-w-0 overflow-hidden rounded-md text-left transition-colors",
        active
          ? "bg-muted/60 ring-1 ring-ring/40"
          : "hover:bg-muted/40",
      )}
      style={CHECKER_STYLE}
    >
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
}: {
  disabled?: boolean;
  search?: string;
  onPlace: (
    kind: FrameKind,
    layout: FrameLayoutPreset,
    options: FramePlaceOptions,
  ) => void;
}) {
  const t = useTranslations("editor.frames");
  const te = useTranslations("editor.elements");
  const [selectedKind, setSelectedKind] = useState<FrameKind>("iphone18pro");
  const [layoutId, setLayoutId] = useState(FRAME_LAYOUT_PRESETS[0]!.id);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [deviceQuery, setDeviceQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const fit: FrameFitMode = "max";

  const devices = useMemo(() => {
    const q = (deviceOpen ? deviceQuery : externalSearch).trim().toLowerCase();
    return FRAME_ITEMS.filter((item) => {
      if (!q) return true;
      const family = frameFamilyForKind(item.kind);
      return (
        item.label.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        family.includes(q)
      );
    });
  }, [deviceOpen, deviceQuery, externalSearch]);

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

  const place = (layout: FrameLayoutPreset) => {
    setLayoutId(layout.id);
    onPlace(selectedKind, layout, { fit });
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
      <Popover
        open={deviceOpen}
        onOpenChange={(open) => {
          setDeviceOpen(open);
          if (!open) setDeviceQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || devices.length === 0}
            className={cn(
              controlH,
              "box-border flex w-full min-w-0 items-center gap-2.5 rounded-md border-none bg-muted/40 px-3.5 py-0 text-left shadow-none transition-colors hover:bg-muted/60 disabled:opacity-40 dark:bg-muted/30 dark:hover:bg-muted/45",
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background/80 dark:bg-background/35">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedFrame.src}
                alt=""
                className="max-h-5 max-w-5 object-contain"
              />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-normal leading-none text-foreground">
              {selectedFrame.label}
              <span className="text-muted-foreground"> / </span>
              <span className="tabular-nums text-muted-foreground">
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
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            requestAnimationFrame(() => searchRef.current?.focus());
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">
            <div className="shrink-0 px-2.5 pt-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={deviceQuery}
                  onChange={(e) => setDeviceQuery(e.target.value)}
                  placeholder={te("searchDevices")}
                  aria-label={te("searchDevices")}
                  className={cn(
                    controlH,
                    "w-full rounded-md border-none bg-muted/40 pl-9 pr-3 text-[13px] font-normal text-foreground shadow-none outline-none placeholder:text-muted-foreground/70 focus:bg-muted/60",
                  )}
                />
              </div>
            </div>
            <div className="max-h-[min(20rem,45vh)] overflow-y-auto overscroll-contain px-2.5 pt-1.5 pb-2 [scrollbar-width:thin]">
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
                        setDeviceQuery("");
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
