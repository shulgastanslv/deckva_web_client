"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  CaretUpDown as ChevronsUpDown,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { controlH } from "@/components/ui/control";
import { FRAME_ITEMS } from "@/components/canvas/use-element-library";
import type { FrameKind } from "@/lib/canvas/frames";
import {
  FRAME_FAMILY_FILTERS,
  FRAME_LAYOUT_PRESETS,
  frameFamilyForKind,
  type FrameFamilyFilter,
  type FrameLayoutPreset,
} from "@/lib/canvas/frame-layouts";
import { getDeviceScreenSize } from "@/lib/canvas/device-mockup";
import { cn } from "@/lib/utils";

type FrameItem = (typeof FRAME_ITEMS)[number];
type FrameFamily = FrameLayoutPreset["family"];

export type FrameFitMode = "max" | "fit";

export type FramePlaceOptions = {
  fit: FrameFitMode;
};

const FAMILY_LABEL: Record<Exclude<FrameFamilyFilter, "all">, string> = {
  phone: "Phone",
  tablet: "Tablet",
  desktop: "Desktop",
  watch: "Watch",
};

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

function DeviceThumb({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-muted/30",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="max-h-[72%] max-w-[55%] object-contain"
      />
    </span>
  );
}

function LayoutCard({
  layout,
  frame,
  family,
  active,
  disabled,
  onSelect,
}: {
  layout: FrameLayoutPreset;
  frame: FrameItem;
  family: FrameFamily;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const size = previewSize(family);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      title={layout.label}
      className={cn(
        "group relative flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2 text-center transition-colors disabled:opacity-40",
        active
          ? "ring-1 ring-primary px-2 m-2"
          : "hover:bg-muted/60 dark:hover:bg-muted/35",
      )}
    >
      <span className="relative aspect-[5/4] w-full overflow-hidden rounded-xl bg-muted/30">
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
      </span>
      <span className="w-full truncate text-[11px] font-normal leading-tight text-foreground">
        {layout.label}
      </span>
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] =
    useState<FrameFamilyFilter>("all");
  const [kind, setKind] = useState<FrameKind>("iphone18pro");
  const [layoutId, setLayoutId] = useState("center");

  const devices = useMemo(() => {
    const q = (open ? query : externalSearch).trim().toLowerCase();
    return FRAME_ITEMS.filter((item) => {
      const family = frameFamilyForKind(item.kind);
      if (familyFilter !== "all" && family !== familyFilter) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        family.includes(q)
      );
    });
  }, [open, query, externalSearch, familyFilter]);

  useEffect(() => {
    if (devices.some((item) => item.kind === kind)) return;
    const next = devices[0];
    if (next) setKind(next.kind as FrameKind);
  }, [devices, kind]);

  const selectedFrame =
    FRAME_ITEMS.find((item) => item.kind === kind) ?? FRAME_ITEMS[0]!;
  const family = frameFamilyForKind(kind);
  const selectedSize = getDeviceScreenSize(kind);

  const layouts = useMemo(() => {
    const matched = FRAME_LAYOUT_PRESETS.filter((p) => p.family === family);
    return matched.length > 0
      ? matched
      : FRAME_LAYOUT_PRESETS.filter((p) => p.family === "phone");
  }, [family]);

  useEffect(() => {
    if (layouts.some((p) => p.id === layoutId)) return;
    setLayoutId(layouts[0]?.id ?? "center");
  }, [layouts, layoutId]);

  const place = (layout: FrameLayoutPreset) => {
    if (disabled) return;
    setLayoutId(layout.id);
    onPlace(kind, layout, { fit: "max" });
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setFamilyFilter("all");
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || devices.length === 0}
            aria-label={t("deviceAria")}
            className={cn(
              controlH,
              "box-border flex w-full min-w-0 items-center gap-2 rounded-md border-none bg-muted/40 px-3.5 py-0 text-left shadow-none transition-colors hover:bg-muted/60 disabled:opacity-40 dark:bg-muted/30 dark:hover:bg-muted/45",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-[13px] font-normal leading-none text-foreground">
              {selectedFrame.label}
              <span className="text-muted-foreground"> / </span>
              <span className="tabular-nums text-muted-foreground">
                {selectedSize.width}×{selectedSize.height}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.35rem] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2.5 border-b border-border/40 px-3.5 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={te("searchDevices")}
              aria-label={te("searchDevices")}
              className="h-9 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-[min(22rem,50vh)] overflow-y-auto overscroll-contain px-2.5 pt-2.5 pb-2 [scrollbar-width:thin]">
            <div className="grid grid-cols-2 gap-2">
              {devices.map((item) => {
                const active = item.kind === kind;
                return (
                  <button
                    key={item.kind}
                    type="button"
                    title={item.label}
                    onClick={() => {
                      setKind(item.kind as FrameKind);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2 text-center transition-colors",
                      active
                        ? "bg-muted/70 dark:bg-muted/45"
                        : "hover:bg-muted/60 dark:hover:bg-muted/35",
                    )}
                  >
                    <DeviceThumb
                      src={item.src}
                      className="aspect-[5/4] w-full rounded-xl"
                    />
                    <span className="w-full truncate text-[11px] font-normal leading-tight text-foreground">
                      {item.label}
                    </span>
                  </button>
                );
              })}
              {devices.length === 0 ? (
                <p className="col-span-2 px-2 py-10 text-center text-[13px] text-muted-foreground">
                  {t("noDevices")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-border/40 px-3 py-3">
            <div
              className={cn(
                "flex w-full min-w-0 items-center overflow-x-auto rounded-md bg-muted/40 p-1 [scrollbar-width:none]",
                controlH,
              )}
            >
              {FRAME_FAMILY_FILTERS.map((id) => {
                const active = familyFilter === id;
                const label =
                  id === "all" ? t("allDevices") : FAMILY_LABEL[id];
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFamilyFilter(id)}
                    className={cn(
                      "h-full shrink-0 rounded-md px-3 text-[13px] font-normal whitespace-nowrap transition-colors",
                      active
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="grid w-full grid-cols-1">
        {layouts.map((layout) => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            frame={selectedFrame}
            family={family}
            active={layout.id === layoutId}
            disabled={disabled}
            onSelect={() => place(layout)}
          />
        ))}
      </div>
    </div>
  );
}
