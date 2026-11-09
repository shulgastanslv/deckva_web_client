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
import { Image as FabricImage, Shadow as FabricShadow, filters as fabricFilters } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
import { useCanvasManager } from "@/context/canvas-manager";
import { cn } from "@/lib/utils";

type ShadowKind = "none" | "spread" | "hug";
type ShadowIntensity = "low" | "medium" | "high";

type ImageAdjustments = {
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
};

const EMPTY: ImageAdjustments = {
  blur: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
};

type Preset = { id: string; label: string; values: Partial<ImageAdjustments>; css: string };

const PRESETS: Preset[] = [
  { id: "none", label: "None", values: {}, css: "none" },
  {
    id: "soft",
    label: "Soft",
    values: { blur: 2, brightness: 0.06, contrast: -0.06, saturation: -0.05 },
    css: "brightness(1.06) contrast(0.94) saturate(0.95) blur(0.4px)",
  },
  {
    id: "punch",
    label: "Punch",
    values: { contrast: 0.28, saturation: 0.22, brightness: 0.04 },
    css: "contrast(1.28) saturate(1.22) brightness(1.04)",
  },
  {
    id: "bw",
    label: "B&W",
    values: { saturation: -1, contrast: 0.12 },
    css: "grayscale(1) contrast(1.12)",
  },
  {
    id: "warm",
    label: "Warm",
    values: { hue: 0.08, saturation: 0.08, brightness: 0.03 },
    css: "sepia(0.2) saturate(1.1) brightness(1.03)",
  },
  {
    id: "cool",
    label: "Cool",
    values: { hue: -0.12, saturation: -0.05, brightness: 0.02 },
    css: "hue-rotate(195deg) saturate(0.9) brightness(1.02)",
  },
];

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

function readAdjustments(img: FabricImage): ImageAdjustments {
  const list = img.filters ?? [];
  const next = { ...EMPTY };
  for (const f of list) {
    if (f instanceof fabricFilters.Blur) next.blur = (f.blur ?? 0) * 40;
    if (f instanceof fabricFilters.Brightness) next.brightness = f.brightness ?? 0;
    if (f instanceof fabricFilters.Contrast) next.contrast = f.contrast ?? 0;
    if (f instanceof fabricFilters.Saturation) next.saturation = f.saturation ?? 0;
    if (f instanceof fabricFilters.HueRotation) next.hue = f.rotation ?? 0;
  }
  return next;
}

function imagePreviewSrc(img: FabricImage): string | null {
  try {
    const src = img.getSrc?.();
    return typeof src === "string" && src.length > 0 ? src : null;
  } catch {
    return null;
  }
}

/** Image-only filter controls — requires a selected Fabric image. */
export function FiltersControls() {
  const manager = useCanvasManager();
  const [target, setTarget] = useState<FabricImage | null>(null);
  const [adj, setAdj] = useState<ImageAdjustments>(EMPTY);
  const [draftId, setDraftId] = useState("none");
  const [appliedId, setAppliedId] = useState("none");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const [shadowType, setShadowType] = useState<ShadowKind>("none");
  const [intensity, setIntensity] = useState<ShadowIntensity>("medium");
  const [lightSourcePos, setLightSourcePos] = useState({ x: 50, y: 40 });

  const draftPreset = useMemo(
    () => PRESETS.find((p) => p.id === draftId) ?? PRESETS[0]!,
    [draftId],
  );
  const dirty = draftId !== appliedId;

  const syncTarget = useCallback(() => {
    const active = manager?.canvas.getActiveObject();
    const img = active instanceof FabricImage ? active : null;
    setTarget(img);
    if (!img) {
      setAdj(EMPTY);
      setPreviewSrc(null);
      setDraftId("none");
      setAppliedId("none");
      setShadowType("none");
      return;
    }
    setAdj(readAdjustments(img));
    setPreviewSrc(imagePreviewSrc(img));
    setShadowType(img.shadow ? "spread" : "none");
  }, [manager]);

  useEffect(() => {
    if (!manager) return;
    syncTarget();
    const canvas = manager.canvas;
    const bump = () => syncTarget();
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
  }, [manager, syncTarget]);

  const applyAdjustments = useCallback(
    (next: ImageAdjustments) => {
      if (!manager) return;
      setAdj(next);
      manager.effects.setImageAdjustments(next);
      manager.canvas.requestRenderAll();
    },
    [manager],
  );

  const applyImageShadow = useCallback(
    (
      kind: ShadowKind,
      nextIntensity: ShadowIntensity,
      light: { x: number; y: number },
    ) => {
      if (!manager || !target) return;
      const params = shadowParams(kind, nextIntensity, light);
      target.set({ shadow: params ? new FabricShadow(params) : null });
      manager.canvas.requestRenderAll();
      manager.commit();
    },
    [manager, target],
  );

  const paintPreset = useCallback(
    (values: Partial<ImageAdjustments>) => {
      const next = { ...EMPTY, ...values };
      applyAdjustments(next);
    },
    [applyAdjustments],
  );

  const previewDraft = useCallback(
    (id: string) => {
      const preset = PRESETS.find((item) => item.id === id);
      if (!preset) return;
      setDraftId(id);
      paintPreset(preset.values);
    },
    [paintPreset],
  );

  const applyDraft = () => {
    if (draftId === "custom") {
      setAppliedId("custom");
      manager?.commit();
      return;
    }
    paintPreset(draftPreset.values);
    setAppliedId(draftId);
    manager?.commit();
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

  const hasActive =
    adj.blur > 0 ||
    Math.abs(adj.brightness) > 0.01 ||
    Math.abs(adj.contrast) > 0.01 ||
    Math.abs(adj.saturation) > 0.01 ||
    Math.abs(adj.hue) > 0.01;

  const handleReset = () => {
    setDraftId("none");
    setAppliedId("none");
    applyAdjustments(EMPTY);
    if (target) {
      target.set({ shadow: null });
      setShadowType("none");
    }
    manager?.commit();
  };

  if (!target) return null;

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
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-cover"
              style={{ filter: draftPreset.css }}
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
              Image
            </div>
          )}

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
        {(hasActive || appliedId !== "none" || shadowType !== "none") && (
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

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-muted-foreground">Shadow</span>
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
          <span className="text-[13px] font-medium text-muted-foreground">Intensity</span>
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
          <span className="text-[13px] font-medium text-muted-foreground">Light source</span>
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
              className="pointer-events-none absolute -ml-3.5 -mt-3.5 flex size-7 items-center justify-center rounded-full bg-foreground text-background"
              style={{ left: `${lightSourcePos.x}%`, top: `${lightSourcePos.y}%` }}
            >
              <SunMedium className="size-3.5" />
            </div>
          </div>
        </div>

        <PillSlider
          label="Blur"
          value={adj.blur}
          min={0}
          max={40}
          step={1}
          formatValue={(n) => `${Math.round(n)}px`}
          onValueChange={(val) => {
            setDraftId("custom");
            applyAdjustments({ ...adj, blur: val });
          }}
        />
        <PillSlider
          label="Brightness"
          value={adj.brightness * 100}
          min={-100}
          max={100}
          step={1}
          formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
          onValueChange={(val) => {
            setDraftId("custom");
            applyAdjustments({ ...adj, brightness: val / 100 });
          }}
        />
        <PillSlider
          label="Contrast"
          value={adj.contrast * 100}
          min={-100}
          max={100}
          step={1}
          formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
          onValueChange={(val) => {
            setDraftId("custom");
            applyAdjustments({ ...adj, contrast: val / 100 });
          }}
        />
        <PillSlider
          label="Saturation"
          value={adj.saturation * 100}
          min={-100}
          max={100}
          step={1}
          formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
          onValueChange={(val) => {
            setDraftId("custom");
            applyAdjustments({ ...adj, saturation: val / 100 });
          }}
        />
        <PillSlider
          label="Hue"
          value={adj.hue * 100}
          min={-100}
          max={100}
          step={1}
          formatValue={(n) => `${n >= 0 ? "+" : ""}${Math.round(n)}`}
          onValueChange={(val) => {
            setDraftId("custom");
            applyAdjustments({ ...adj, hue: val / 100 });
          }}
        />
      </div>
    </div>
  );
}
