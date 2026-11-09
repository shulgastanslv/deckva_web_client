"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, RotateCcw, SunMedium } from "lucide-react";
import { Image as FabricImage, Shadow as FabricShadow } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
import { useCanvasManager } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import type { FilterPresetValues } from "@/store/slices/settingsSlice";
import { captureCanvasThumbnail } from "@/lib/canvas/thumbnail";
import { cn } from "@/lib/utils";

type ShadowKind = "none" | "spread" | "hug";
type ShadowIntensity = "low" | "medium" | "high";

function shadowParams(
  kind: ShadowKind,
  intensity: ShadowIntensity,
  light: { x: number; y: number },
) {
  if (kind === "none") return null;
  const strength =
    intensity === "low" ? 0.55 : intensity === "high" ? 1.25 : 0.9;
  const baseBlur = kind === "hug" ? 18 : 42;
  const baseOffset = kind === "hug" ? 8 : 22;
  const offsetX = ((50 - light.x) / 50) * baseOffset * strength;
  const offsetY = ((50 - light.y) / 50) * baseOffset * strength;
  return {
    color: `rgba(0,0,0,${Math.min(0.55, 0.28 * strength)})`,
    blur: baseBlur * strength,
    offsetX,
    offsetY,
  };
}

const PRESETS: { id: string; label: string; values: FilterPresetValues }[] = [
  { id: "none", label: "None", values: {} },
  {
    id: "film",
    label: "Film",
    values: {
      vignette: 0.4,
      noise: 0.22,
      warmth: 0.15,
      contrast: 0.08,
      saturation: -0.12,
    },
  },
  {
    id: "soft",
    label: "Soft",
    values: {
      vignette: 0.18,
      blur: 2,
      brightness: 0.06,
      contrast: -0.06,
      saturation: -0.05,
    },
  },
  {
    id: "punch",
    label: "Punch",
    values: {
      contrast: 0.28,
      saturation: 0.22,
      brightness: 0.04,
      vignette: 0.12,
    },
  },
  {
    id: "bw",
    label: "B&W",
    values: {
      saturation: -1,
      contrast: 0.12,
      vignette: 0.25,
      noise: 0.1,
    },
  },
  {
    id: "warm",
    label: "Warm",
    values: {
      warmth: 0.45,
      saturation: 0.08,
      vignette: 0.2,
    },
  },
  {
    id: "cool",
    label: "Cool",
    values: {
      warmth: -0.4,
      saturation: -0.05,
      contrast: 0.06,
      vignette: 0.15,
    },
  },
];

/** Instant CSS look for the preview pad (canvas gets the real effects). */
function presetCss(id: string): { filter: string; vignette: number } {
  switch (id) {
    case "film":
      return { filter: "contrast(1.08) saturate(0.88) sepia(0.18)", vignette: 0.4 };
    case "soft":
      return { filter: "brightness(1.06) contrast(0.94) saturate(0.95)", vignette: 0.18 };
    case "punch":
      return { filter: "contrast(1.28) saturate(1.22) brightness(1.04)", vignette: 0.12 };
    case "bw":
      return { filter: "grayscale(1) contrast(1.12)", vignette: 0.25 };
    case "warm":
      return { filter: "sepia(0.28) saturate(1.1) brightness(1.02)", vignette: 0.2 };
    case "cool":
      return { filter: "hue-rotate(195deg) saturate(0.85) brightness(1.02)", vignette: 0.15 };
    default:
      return { filter: "none", vignette: 0 };
  }
}

/** Filter controls for CollapsibleGroup — slide always; image when selected. */
export function FiltersControls() {
  const manager = useCanvasManager();
  const currentSlideId = useCanvasStore((s) => s.currentSlideId);
  const slides = useCanvasStore((s) => s.slides);
  const vignette = useCanvasStore((s) => s.vignette);
  const noise = useCanvasStore((s) => s.noise);
  const warmth = useCanvasStore((s) => s.warmth);
  const blur = useCanvasStore((s) => s.blur);
  const brightness = useCanvasStore((s) => s.brightness);
  const contrast = useCanvasStore((s) => s.contrast);
  const saturation = useCanvasStore((s) => s.saturation);
  const hue = useCanvasStore((s) => s.hue);
  const setVignette = useCanvasStore((s) => s.setVignette);
  const setNoise = useCanvasStore((s) => s.setNoise);
  const setWarmth = useCanvasStore((s) => s.setWarmth);
  const setBlur = useCanvasStore((s) => s.setBlur);
  const setBrightness = useCanvasStore((s) => s.setBrightness);
  const setContrast = useCanvasStore((s) => s.setContrast);
  const setSaturation = useCanvasStore((s) => s.setSaturation);
  const setHue = useCanvasStore((s) => s.setHue);
  const resetFilters = useCanvasStore((s) => s.resetFilters);
  const applyFilterPreset = useCanvasStore((s) => s.applyFilterPreset);

  const [draftId, setDraftId] = useState("none");
  const [appliedId, setAppliedId] = useState("none");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [imageSelected, setImageSelected] = useState(false);

  const [shadowType, setShadowType] = useState<ShadowKind>("spread");
  const [intensity, setIntensity] = useState<ShadowIntensity>("medium");
  const [lightSourcePos, setLightSourcePos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 40,
  });

  const draftPreset = useMemo(() => {
    if (draftId === "custom") {
      return { id: "custom", label: "Custom", values: {} as FilterPresetValues };
    }
    return PRESETS.find((p) => p.id === draftId) ?? PRESETS[0]!;
  }, [draftId]);
  const draftLook = presetCss(draftId === "custom" ? "none" : draftId);
  const dirty = draftId !== appliedId;

  const slideThumb = useMemo(() => {
    const slide = slides.find((s) => s.id === currentSlideId);
    return slide?.thumbnail ?? null;
  }, [slides, currentSlideId]);

  const syncImageSelection = useCallback(() => {
    const active = manager?.canvas.getActiveObject();
    setImageSelected(active instanceof FabricImage);
  }, [manager]);

  const refreshPreview = useCallback(() => {
    if (!manager) return;
    const live = captureCanvasThumbnail(manager.canvas, manager.isDisposed);
    setPreviewSrc(live ?? slideThumb);
  }, [manager, slideThumb]);

  const applyImageShadow = useCallback(
    (
      kind: ShadowKind,
      nextIntensity: ShadowIntensity,
      light: { x: number; y: number },
    ) => {
      const target = manager?.effects.resolveImageTarget();
      if (!target || !manager) return;
      const params = shadowParams(kind, nextIntensity, light);
      target.set({
        shadow: params ? new FabricShadow(params) : null,
      });
      manager.canvas.requestRenderAll();
      manager.commit();
    },
    [manager],
  );

  useEffect(() => {
    if (!manager) return;
    syncImageSelection();
    refreshPreview();
    const canvas = manager.canvas;
    const bump = () => {
      syncImageSelection();
      refreshPreview();
    };
    canvas.on("selection:created", bump);
    canvas.on("selection:updated", bump);
    canvas.on("selection:cleared", bump);
    canvas.on("object:modified", bump);
    return () => {
      canvas.off("selection:created", bump);
      canvas.off("selection:updated", bump);
      canvas.off("selection:cleared", bump);
      canvas.off("object:modified", bump);
    };
  }, [manager, syncImageSelection, refreshPreview]);

  useEffect(() => {
    setPreviewSrc(slideThumb);
    refreshPreview();
  }, [currentSlideId, slideThumb, refreshPreview]);

  const applyImage = useCallback(
    (patch: Partial<{
      blur: number;
      brightness: number;
      contrast: number;
      saturation: number;
      hue: number;
    }>) => {
      const next = {
        blur: patch.blur ?? blur,
        brightness: patch.brightness ?? brightness,
        contrast: patch.contrast ?? contrast,
        saturation: patch.saturation ?? saturation,
        hue: patch.hue ?? hue,
      };
      manager?.effects.setImageAdjustments(next);
    },
    [manager, blur, brightness, contrast, saturation, hue],
  );

  const applySlideFromStore = useCallback(
    (values: {
      vignette: number;
      noise: number;
      warmth: number;
    }) => {
      manager?.effects.setVignette(values.vignette);
      void manager?.effects.setNoise(values.noise);
      manager?.effects.setWarmth(values.warmth);
    },
    [manager],
  );

  const paintPreset = useCallback(
    (values: FilterPresetValues, withImage: boolean) => {
      applyFilterPreset(values);
      const next = {
        vignette: values.vignette ?? 0,
        noise: values.noise ?? 0,
        warmth: values.warmth ?? 0,
        blur: values.blur ?? 0,
        brightness: values.brightness ?? 0,
        contrast: values.contrast ?? 0,
        saturation: values.saturation ?? 0,
        hue: values.hue ?? 0,
      };
      applySlideFromStore(next);
      if (withImage) manager?.effects.setImageAdjustments(next);
    },
    [applyFilterPreset, applySlideFromStore, manager],
  );

  const previewDraft = useCallback(
    (id: string) => {
      const preset = PRESETS.find((item) => item.id === id);
      if (!preset) return;
      setDraftId(id);
      paintPreset(preset.values, imageSelected);
    },
    [imageSelected, paintPreset],
  );

  const applyDraft = () => {
    if (draftId === "custom") {
      setAppliedId("custom");
      manager?.commit();
      refreshPreview();
      return;
    }
    paintPreset(draftPreset.values, imageSelected);
    setAppliedId(draftId);
    manager?.commit();
    refreshPreview();
  };

  const stepDraft = useCallback(
    (dir: -1 | 1) => {
      const index = PRESETS.findIndex((p) => p.id === draftId);
      const from = index < 0 ? 0 : index;
      const next = PRESETS[(from + dir + PRESETS.length) % PRESETS.length];
      if (next) previewDraft(next.id);
    },
    [draftId, previewDraft],
  );

  const swipeRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const onPadPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    swipeRef.current = { x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPadPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (!start || start.moved) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    start.moved = true;
    stepDraft(dx < 0 ? 1 : -1);
  };

  const onPadPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const hasActiveSlide =
    vignette > 0 || noise > 0 || Math.abs(warmth) > 0.01;

  const hasActiveImage =
    blur > 0 ||
    Math.abs(brightness) > 0.01 ||
    Math.abs(contrast) > 0.01 ||
    Math.abs(saturation) > 0.01 ||
    Math.abs(hue) > 0.01;

  const handleReset = () => {
    resetFilters();
    setDraftId("none");
    setAppliedId("none");
    manager?.effects.clearAll();
    manager?.commit();
    refreshPreview();
  };

  const thumb = previewSrc ?? slideThumb;

  return (
    <div className="flex min-w-0 flex-col gap-3 text-[13px]">
      <div
        className="relative touch-pan-y overflow-hidden rounded-2xl bg-muted/40 select-none"
        onPointerDown={onPadPointerDown}
        onPointerMove={onPadPointerMove}
        onPointerUp={onPadPointerUp}
        onPointerCancel={onPadPointerUp}
      >
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] cursor-grab active:cursor-grabbing">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-cover"
              style={{ filter: draftLook.filter }}
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
              Slide preview
            </div>
          )}
          {draftLook.vignette > 0 ? (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                boxShadow: `inset 0 0 ${40 + draftLook.vignette * 80}px rgba(0,0,0,${0.25 + draftLook.vignette * 0.45})`,
              }}
            />
          ) : null}

          <button
            type="button"
            aria-label="Previous filter"
            onClick={(e) => {
              e.stopPropagation();
              stepDraft(-1);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next filter"
            onClick={(e) => {
              e.stopPropagation();
              stepDraft(1);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-background/90 px-3 py-1 text-[12px] font-medium text-foreground">
              {draftPreset.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!dirty}
          onClick={applyDraft}
          className="flex h-9 flex-1 items-center justify-center rounded-full bg-foreground text-[13px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-35"
        >
          Apply
        </button>
        {(hasActiveSlide || (imageSelected && hasActiveImage) || appliedId !== "none") && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <PillSlider
          label="Vignette"
          value={vignette * 100}
          min={0}
          max={100}
          step={1}
          formatValue={(n) => `${Math.round(n)}%`}
          onValueChange={(val) => {
            setDraftId("custom");
            const v = val / 100;
            setVignette(v);
            manager?.effects.setVignette(v);
            refreshPreview();
          }}
        />
        <PillSlider
          label="Grain"
          value={noise * 100}
          min={0}
          max={100}
          step={1}
          formatValue={(n) => `${Math.round(n)}%`}
          onValueChange={(val) => {
            setDraftId("custom");
            const v = val / 100;
            setNoise(v);
            void manager?.effects.setNoise(v);
            refreshPreview();
          }}
        />
        <PillSlider
          label="Warmth"
          value={warmth * 100}
          min={-100}
          max={100}
          step={1}
          formatValue={(n) =>
            Math.abs(n) < 1 ? "0" : `${n > 0 ? "+" : ""}${Math.round(n)}`
          }
          onValueChange={(val) => {
            setDraftId("custom");
            const v = val / 100;
            setWarmth(v);
            manager?.effects.setWarmth(v);
            refreshPreview();
          }}
        />
      </div>

      {imageSelected ? (
        <div className="flex flex-col gap-3 border-t border-border/50 pt-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-muted-foreground">
              Shadow
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "none", label: "None", preview: "shadow-none" },
                  { id: "spread", label: "Spread", preview: "shadow-[0_10px_18px_rgba(0,0,0,0.28)]" },
                  { id: "hug", label: "Hug", preview: "shadow-[0_3px_6px_rgba(0,0,0,0.35)]" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setShadowType(item.id);
                    applyImageShadow(item.id, intensity, lightSourcePos);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl bg-muted/40 px-2 py-2.5 transition-colors",
                    shadowType === item.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1.5 flex h-8 w-10 items-center justify-center rounded-md bg-background",
                      item.preview,
                    )}
                  >
                    <div className="size-4 rounded-sm bg-foreground/20" />
                  </div>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-muted-foreground">
              Intensity
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-muted/40 p-0.5">
              {(["low", "medium", "high"] as const).map((id) => {
                const active = intensity === id;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={shadowType === "none"}
                    onClick={() => {
                      setIntensity(id);
                      applyImageShadow(shadowType, id, lightSourcePos);
                    }}
                    className={cn(
                      "h-8 rounded-full text-[12px] font-medium capitalize transition-colors disabled:opacity-40",
                      active
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-muted-foreground">
              Light source
            </span>
            <div
              role="slider"
              aria-label="Light source position"
              className="relative flex h-32 w-full cursor-crosshair select-none items-center justify-center overflow-hidden rounded-2xl bg-muted/40"
              onPointerDown={(e) => {
                if (shadowType === "none") return;
                const rect = e.currentTarget.getBoundingClientRect();
                const move = (clientX: number, clientY: number) => {
                  const x = Math.max(
                    0,
                    Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)),
                  );
                  const y = Math.max(
                    0,
                    Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)),
                  );
                  const next = { x, y };
                  setLightSourcePos(next);
                  applyImageShadow(shadowType, intensity, next);
                };
                move(e.clientX, e.clientY);
                const onMove = (ev: PointerEvent) => move(ev.clientX, ev.clientY);
                const onUp = () => {
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                };
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
            >
              <div className="flex h-3/4 w-3/4 flex-col rounded-xl bg-background/80 p-2">
                <div className="mb-1 h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-1/2 rounded-full bg-muted" />
              </div>
              <div
                className="pointer-events-none absolute flex size-7 -ml-3.5 -mt-3.5 items-center justify-center rounded-full bg-foreground text-background"
                style={{ left: `${lightSourcePos.x}%`, top: `${lightSourcePos.y}%` }}
              >
                <SunMedium className="size-3.5" />
              </div>
            </div>
          </div>

          <PillSlider
            label="Blur"
            value={blur}
            min={0}
            max={40}
            step={1}
            formatValue={(n) => `${Math.round(n)}px`}
            onValueChange={(val) => {
              setDraftId("custom");
              setBlur(val);
              applyImage({ blur: val });
            }}
          />
          <PillSlider
            label="Brightness"
            value={brightness * 100}
            min={-100}
            max={100}
            step={1}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setDraftId("custom");
              const v = val / 100;
              setBrightness(v);
              applyImage({ brightness: v });
            }}
          />
          <PillSlider
            label="Contrast"
            value={contrast * 100}
            min={-100}
            max={100}
            step={1}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setDraftId("custom");
              const v = val / 100;
              setContrast(v);
              applyImage({ contrast: v });
            }}
          />
          <PillSlider
            label="Saturation"
            value={saturation * 100}
            min={-100}
            max={100}
            step={1}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setDraftId("custom");
              const v = val / 100;
              setSaturation(v);
              applyImage({ saturation: v });
            }}
          />
          <PillSlider
            label="Hue"
            value={hue * 100}
            min={-100}
            max={100}
            step={1}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setDraftId("custom");
              const v = val / 100;
              setHue(v);
              applyImage({ hue: v });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
