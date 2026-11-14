"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  ArrowCounterClockwise as RotateCcw,
} from "@phosphor-icons/react";
import { Image as FabricImage, Shadow as FabricShadow, filters as fabricFilters } from "fabric";
import { PillSlider } from "@/components/ui/pill-slider";
import { useCanvasManager } from "@/context/canvas-manager";
import { cn } from "@/lib/utils";
import { controlH } from "@/components/ui/control";

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

const LIGHT_COLS = 5;
const LIGHT_ROWS = 3;

const PRESETS: Preset[] = [
  { id: "none", label: "none", values: {}, css: "none" },
  {
    id: "soft",
    label: "soft",
    values: { blur: 2, brightness: 0.06, contrast: -0.06, saturation: -0.05 },
    css: "brightness(1.06) contrast(0.94) saturate(0.95) blur(0.4px)",
  },
  {
    id: "punch",
    label: "punch",
    values: { contrast: 0.28, saturation: 0.22, brightness: 0.04 },
    css: "contrast(1.28) saturate(1.22) brightness(1.04)",
  },
  {
    id: "bw",
    label: "bw",
    values: { saturation: -1, contrast: 0.12 },
    css: "grayscale(1) contrast(1.12)",
  },
  {
    id: "warm",
    label: "warm",
    values: { hue: 0.08, saturation: 0.08, brightness: 0.03 },
    css: "sepia(0.2) saturate(1.1) brightness(1.03)",
  },
  {
    id: "cool",
    label: "cool",
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
  const t = useTranslations("editor.filters");
  const tc = useTranslations("common");
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
      <div className="flex min-w-0 flex-col gap-2">
        <div
          className="relative touch-pan-y overflow-hidden rounded-md bg-muted/40 select-none"
          onPointerDown={onPadPointerDown}
          onPointerMove={onPadPointerMove}
          onPointerUp={onPadPointerUp}
          onPointerCancel={onPadPointerUp}
        >
          <div className="flex h-36 w-full cursor-grab items-center justify-center px-3 py-3 active:cursor-grabbing">
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                draggable={false}
                className="pointer-events-none max-h-full max-w-full rounded-md object-contain"
                style={{ filter: draftPreset.css }}
              />
            ) : (
              <div className="pointer-events-none flex items-center justify-center text-muted-foreground">
                {t("image")}
              </div>
            )}
          </div>
        </div>

        <div className={cn("flex items-center gap-1.5", controlH)}>
          <button
            type="button"
            aria-label={t("previous")}
            onClick={() => stepDraft(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-md bg-muted/40 px-3.5 text-[13px] font-normal text-foreground",
              controlH,
            )}
          >
            <span className="truncate">
              {t(`presets.${draftPreset.id}` as "presets.none")}
            </span>
          </div>
          <button
            type="button"
            aria-label={t("next")}
            onClick={() => stepDraft(1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground transition-colors hover:bg-muted/60"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!dirty}
          onClick={applyDraft}
          className={cn(
            "flex flex-1 items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-35",
            controlH,
          )}
        >
          {t("apply")}
        </button>
        {(hasActive || appliedId !== "none" || shadowType !== "none") && (
          <button
            type="button"
            onClick={handleReset}
            title={tc("reset")}
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <RotateCcw className="size-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-muted-foreground">{t("shadow")}</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "none", label: t("presets.none"), preview: "shadow-none" },
                { id: "spread", label: t("shadowModes.spread"), preview: "shadow-[0_10px_18px_rgba(0,0,0,0.28)]" },
                { id: "hug", label: t("shadowModes.hug"), preview: "shadow-[0_3px_6px_rgba(0,0,0,0.35)]" },
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
                  "flex flex-col items-center justify-center rounded-md bg-muted/40 px-2 py-2.5 transition-colors",
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
                  <div className="size-4 rounded-md bg-foreground/20" />
                </div>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-muted-foreground">{t("intensity")}</span>
          <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/40 p-0.5">
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
                    "h-8 rounded-md text-[12px] font-medium capitalize transition-colors disabled:opacity-40",
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
          <span className="text-[13px] font-medium text-muted-foreground">{t("lightSource")}</span>
          <div
            role="application"
            aria-label={t("lightSourcePosition")}
            aria-disabled={shadowType === "none"}
            className={cn(
              "relative h-40 touch-none select-none overflow-hidden rounded-md bg-muted/40 p-5 dark:bg-muted/25",
              shadowType === "none"
                ? "cursor-not-allowed opacity-45"
                : "cursor-grab active:cursor-grabbing",
            )}
            onPointerDown={(e) => {
              if (shadowType === "none") return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              const pad = e.currentTarget;
              const grid = pad.firstElementChild as HTMLElement | null;
              const box = (grid ?? pad).getBoundingClientRect();
              const cellW = box.width / LIGHT_COLS;
              const cellH = box.height / LIGHT_ROWS;
              const move = (clientX: number, clientY: number, snap: boolean) => {
                let nx =
                  (clientX - box.left - cellW / 2) /
                  Math.max(1, box.width - cellW);
                let ny =
                  (clientY - box.top - cellH / 2) /
                  Math.max(1, box.height - cellH);
                nx = Math.max(0, Math.min(1, nx));
                ny = Math.max(0, Math.min(1, ny));
                if (snap) {
                  nx = Math.round(nx * (LIGHT_COLS - 1)) / (LIGHT_COLS - 1);
                  ny = Math.round(ny * (LIGHT_ROWS - 1)) / (LIGHT_ROWS - 1);
                }
                const next = {
                  x: Math.round(nx * 100),
                  y: Math.round(ny * 100),
                };
                setLightSourcePos(next);
                applyImageShadow(shadowType, intensity, next);
              };
              move(e.clientX, e.clientY, false);
              const onMove = (ev: PointerEvent) => move(ev.clientX, ev.clientY, false);
              const onUp = (ev: PointerEvent) => {
                move(ev.clientX, ev.clientY, true);
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
            }}
          >
            <div
              className="pointer-events-none relative grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${LIGHT_COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${LIGHT_ROWS}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: LIGHT_ROWS * LIGHT_COLS }, (_, i) => {
                const col = i % LIGHT_COLS;
                const row = Math.floor(i / LIGHT_COLS);
                const activeCol = Math.round((lightSourcePos.x / 100) * (LIGHT_COLS - 1));
                const activeRow = Math.round((lightSourcePos.y / 100) * (LIGHT_ROWS - 1));
                const active = activeCol === col && activeRow === row;
                return (
                  <div key={`${col}-${row}`} className="flex items-center justify-center">
                    <span
                      className={cn(
                        "size-1.5 rounded-full bg-muted-foreground/40 transition-opacity",
                        active && "opacity-0",
                      )}
                    />
                  </div>
                );
              })}
              <div className="absolute inset-0 z-10" aria-hidden>
                <div
                  className="absolute size-7 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${((lightSourcePos.x / 100) * (LIGHT_COLS - 1) + 0.5) / LIGHT_COLS * 100}%`,
                    top: `${((lightSourcePos.y / 100) * (LIGHT_ROWS - 1) + 0.5) / LIGHT_ROWS * 100}%`,
                  }}
                >
                  <span className="absolute inset-0 rounded-full bg-background shadow-[0_1px_4px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:shadow-[0_1px_4px_rgba(0,0,0,0.45)] dark:ring-white/10" />
                  <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_45%,transparent)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <PillSlider
          label={t("blur")}
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
          label={t("brightness")}
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
          label={t("contrast")}
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
          label={t("saturation")}
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
          label={t("hue")}
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
