"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, RotateCcw, SunMedium } from "lucide-react";
import { Shadow as FabricShadow } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCanvasManager } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import type { FilterPresetValues } from "@/store/slices/settingsSlice";
import { FilterMenu } from "@/components/canvas/sidebar/filter-menu";
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

type Tab = "slide" | "image";

const PRESETS: { id: string; label: string; values: FilterPresetValues }[] = [
  {
    id: "none",
    label: "None",
    values: {},
  },
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

export function SidebarFilters() {
  const manager = useCanvasManager();
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

  const [tab, setTab] = useState<Tab>("slide");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [hasImageTarget, setHasImageTarget] = useState(false);

  const [shadowType, setShadowType] = useState<ShadowKind>("spread");
  const [intensity, setIntensity] = useState<ShadowIntensity>("medium");
  const [lightSourcePos, setLightSourcePos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 40,
  });

  const syncImageTarget = useCallback(() => {
    setHasImageTarget(Boolean(manager?.effects.resolveImageTarget()));
  }, [manager]);

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
    syncImageTarget();
    const canvas = manager.canvas;
    const bump = () => syncImageTarget();
    canvas.on("selection:created", bump);
    canvas.on("selection:updated", bump);
    canvas.on("selection:cleared", bump);
    return () => {
      canvas.off("selection:created", bump);
      canvas.off("selection:updated", bump);
      canvas.off("selection:cleared", bump);
    };
  }, [manager, syncImageTarget]);

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
      const ok = manager?.effects.setImageAdjustments(next);
      if (ok === false) syncImageTarget();
    },
    [manager, blur, brightness, contrast, saturation, hue, syncImageTarget],
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

  const hasActive =
    vignette > 0 ||
    noise > 0 ||
    Math.abs(warmth) > 0.01 ||
    blur > 0 ||
    Math.abs(brightness) > 0.01 ||
    Math.abs(contrast) > 0.01 ||
    Math.abs(saturation) > 0.01 ||
    Math.abs(hue) > 0.01;

  const handleReset = () => {
    resetFilters();
    setActivePreset("none");
    manager?.effects.clearAll();
  };

  const handlePreset = (id: string, values: FilterPresetValues) => {
    setActivePreset(id);
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
    manager?.effects.setImageAdjustments(next);
    syncImageTarget();
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as Tab)}
      className="gap-3 overflow-hidden p-1.5 text-[13px] p-3"
    >
      <div className="flex items-center gap-1">
        <TabsList className="grid h-11 min-w-0 flex-1 grid-cols-2 rounded-full bg-muted/60 p-1 group-data-horizontal/tabs:h-11 dark:bg-muted/25">
          <TabsTrigger
            value="slide"
            className="rounded-full text-[13px] font-medium shadow-none data-active:border-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-background"
          >
            Slide
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="rounded-full text-[13px] font-medium shadow-none data-active:border-transparent data-active:bg-background data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-background"
          >
            Image
          </TabsTrigger>
        </TabsList>
        <FilterMenu
          icon={Filter}
          value={activePreset ?? "none"}
          onChange={(id) => {
            const preset = PRESETS.find((item) => item.id === id);
            if (preset) handlePreset(preset.id, preset.values);
          }}
          groups={[
            {
              label: "Preset",
              options: PRESETS.map((preset) => ({ id: preset.id, label: preset.label })),
            },
          ]}
        />
        {hasActive && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>

      <TabsContent value="slide">
        <div className="flex flex-col gap-2">
          <PillSlider
            label="Vignette"
            value={vignette * 100}
            min={0}
            max={100}
            step={1}
            formatValue={(n) => `${Math.round(n)}%`}
            onValueChange={(val) => {
              setActivePreset(null);
              const v = val / 100;
              setVignette(v);
              manager?.effects.setVignette(v);
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
              setActivePreset(null);
              const v = val / 100;
              setNoise(v);
              void manager?.effects.setNoise(v);
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
              setActivePreset(null);
              const v = val / 100;
              setWarmth(v);
              manager?.effects.setWarmth(v);
            }}
          />
        </div>
      </TabsContent>

      <TabsContent value="image">
        <div className="flex flex-col gap-3">
          {!hasImageTarget && (
            <p className="text-[13px] text-muted-foreground">
              Select an image or use an image background.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-medium text-muted-foreground">
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
                  disabled={!hasImageTarget}
                  onClick={() => {
                    setShadowType(item.id);
                    applyImageShadow(item.id, intensity, lightSourcePos);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl bg-muted/40 px-2 py-2.5 transition-colors disabled:opacity-40",
                    shadowType === item.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
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
            <span className="px-1 text-[13px] font-medium text-muted-foreground">
              Intensity
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-muted/60 p-1 dark:bg-muted/25">
              {(["low", "medium", "high"] as const).map((id) => {
                const active = intensity === id;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!hasImageTarget || shadowType === "none"}
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
            <span className="px-1 text-[13px] font-medium text-muted-foreground">
              Light source
            </span>
            <div
              role="slider"
              aria-label="Light source position"
              className="relative flex h-32 w-full cursor-crosshair select-none items-center justify-center overflow-hidden rounded-2xl bg-muted/40"
              onPointerDown={(e) => {
                if (!hasImageTarget || shadowType === "none") return;
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
            <button
              type="button"
              disabled={!hasImageTarget}
              onClick={() => {
                setShadowType("none");
                setIntensity("medium");
                setLightSourcePos({ x: 50, y: 40 });
                applyImageShadow("none", "medium", { x: 50, y: 40 });
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-muted/50 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" />
              Reset shadow
            </button>
          </div>

          <div className="my-1 h-px bg-muted/60" />

          {/* Стандартные слайдеры Image */}
          <PillSlider
            label="Blur"
            value={blur}
            min={0}
            max={40}
            step={1}
            disabled={!hasImageTarget}
            formatValue={(n) => `${Math.round(n)}px`}
            onValueChange={(val) => {
              setActivePreset(null);
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
            disabled={!hasImageTarget}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setActivePreset(null);
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
            disabled={!hasImageTarget}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setActivePreset(null);
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
            disabled={!hasImageTarget}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setActivePreset(null);
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
            disabled={!hasImageTarget}
            formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
            onValueChange={(val) => {
              setActivePreset(null);
              const v = val / 100;
              setHue(v);
              applyImage({ hue: v });
            }}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}