"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  BringToFront,
  SendToBack,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  PanelRightClose,
  PanelRightOpen,
  Upload,
  Crop,
  WandSparkles,
  Loader2,
  Lock,
  Unlock,
  List,
  ListOrdered,
} from "lucide-react";
import { AiTextAssist } from "@/components/canvas/ai-text-assist";
import { useSelectedObject } from "@/hooks/use-selected-object";
import {
  FabricImage,
  type FabricObject,
  type FabricText,
  Rect,
  Shadow as FabricShadow,
} from "fabric";
import { useCanvasManager } from "@/context/canvas-manager";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { canFillShape } from "@/lib/canvas/objects";
import { iconFill } from "@/lib/canvas/recolor-icon";
import { removeImageBackground } from "@/lib/image/remove-background";
import { FontSelect } from "@/components/canvas/font-select";
import {
  loadGoogleFont,
  normalizeFontFamily,
} from "@/lib/fonts/google-fonts";
import { alignSelected, type ObjectAlign } from "@/lib/canvas/align";
import {
  applyTextStyleToSlide,
  PALETTE_SLOTS,
  paletteSlot,
  TEXT_STYLES,
  textStyleId,
  type TextStyleDef,
  type TextStyleId,
} from "@/lib/canvas/document";
import { applyStyleOnCanvas, paintSlotOnCanvas, refreshCanvasFonts } from "@/lib/canvas/paint-live";
import { applyCarouselFont } from "@/lib/canvas/apply-carousel-font";
import { useCanvasStore } from "@/store/useCanvasStore";
import { canUngroup, groupSelection, ungroupSelection } from "@/lib/canvas/group";
import {
  copyStyleFromSelection,
  hasCopiedStyle,
  pasteObjectStyle,
  subscribeCopiedStyle,
} from "@/lib/canvas/style-clipboard";
import {
  applyMask,
  BLEND_MODES,
  gradientStops,
  linearGradient,
  maskKind,
  refreshMask,
  type MaskKind,
} from "@/lib/canvas/object-appearance";
import { applyList, applySelectionStyle, writeFormattedText, type ListKind } from "@/lib/canvas/text-format";
import type { TextStyles } from "@/lib/canvas/text-flow";
import { textLengthNote, textLengthStatus } from "@/lib/canvas/insights";
import { SelectObjectArt } from "@/components/canvas/canvas_icons";
import { ColorPicker } from "@/components/ui/color-picker";

type TextAlign = "left" | "center" | "right" | "justify";

interface RightSidebarProps {
  isRightCollapsed: boolean;
  setIsRightCollapsed: (v: boolean) => void;
}

interface InspectedProperties {
  type: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  padding: number;
  angle: number;
  width: number;
  height: number;
  rx?: number;
  src?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  textAlign?: TextAlign;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  charSpacing?: number;
  backgroundColor?: string;
  isLocked?: boolean;
  blendMode?: string;
  mask?: MaskKind;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  hasShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

/** Shared shell for inspector fields — muted pill, fully rounded. */
const fieldShell = "flex items-center rounded-full bg-muted/40";

const btnRound = "rounded-full";

function clampNumber(value: number, min?: number, max?: number): number {
  let next = value;
  if (min != null) next = Math.max(min, next);
  if (max != null) next = Math.min(max, next);
  return next;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  decimals = 0,
  showSlider = true,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  decimals?: number;
  showSlider?: boolean;
}) {
  const format = (n: number) =>
    decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
  const [draft, setDraft] = useState(format(value));

  useEffect(() => {
    setDraft(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from external value only
  }, [value, decimals]);

  const commit = () => {
    const parsed = Number(draft.replace(",", "."));
    if (!Number.isFinite(parsed)) {
      setDraft(format(value));
      return;
    }
    const next = clampNumber(parsed, min, max);
    onChange(next);
    setDraft(format(next));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <div className={`${fieldShell} h-8 w-[4.75rem] px-2`}>
          <Input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="h-7 flex-1 border-0 bg-transparent px-0.5 text-right font-mono text-[13px] tabular-nums shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          {unit ? (
            <span className="shrink-0 pl-0.5 text-[13px] text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
      {showSlider && min != null && max != null ? (
        <Slider
          value={[clampNumber(value, min, max)]}
          onValueChange={([val]) => onChange(val ?? min)}
          min={min}
          max={max}
          step={step}
        />
      ) : null}
    </div>
  );
}

function DimInput({
  label,
  value,
  onChange,
  unit = "px",
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  unit?: string;
}) {
  const [draft, setDraft] = useState(String(Math.round(value)));

  useEffect(() => {
    setDraft(String(Math.round(value)));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDraft(String(Math.round(value)));
      return;
    }
    const next = Math.round(parsed);
    onChange(next);
    setDraft(String(next));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <div className={`${fieldShell} h-9 px-3`}>
        <Input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-7 flex-1 border-0 bg-transparent px-0.5 font-mono text-[13px] tabular-nums shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <span className="shrink-0 text-[13px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export function RightSidebar({
  isRightCollapsed,
  setIsRightCollapsed,
}: RightSidebarProps) {
  const { selectedObject, updateSelected } = useSelectedObject();
  const manager = useCanvasManager();
  const copiedStyle = useSyncExternalStore(subscribeCopiedStyle, hasCopiedStyle, () => false);
  const [formValues, setFormValues] = useState<InspectedProperties | null>(
    null,
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgProgress, setBgProgress] = useState<string | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const palette = useCanvasStore((s) => s.palette);
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const [styleOffer, setStyleOffer] = useState<TextStyleId | null>(null);
  const [fontOffer, setFontOffer] = useState<string | null>(null);

  useEffect(() => {
    setStyleOffer(null);
    if (!selectedObject) {
      setFormValues(null);
      setImageUrlInput("");
      setBgRemoving(false);
      setBgProgress(null);
      setBgError(null);
      return;
    }

    const subject =
      selectedObject.type === "activeselection"
        ? (selectedObject as FabricObject & { getObjects: () => FabricObject[] }).getObjects()[0]
        : selectedObject;
    if (!subject) {
      setFormValues(null);
      setImageUrlInput("");
      return;
    }

    const type = subject.type ?? "object";
    const icon = subject as FabricObject & { swibpIcon?: boolean };
    const painted = icon.swibpIcon ? iconFill(icon) : null;
    const rawFill = subject.fill;
    const fill = painted ?? (typeof rawFill === "string" ? rawFill : "#000000");

    const rawStroke = subject.stroke;
    const stroke = typeof rawStroke === "string" ? rawStroke : "#000000";

    const strokeWidth = subject.strokeWidth ?? 0;
    const opacity = subject.opacity ?? 1;
    const padding = subject.padding ?? 0;
    const angle = Math.round(subject.angle ?? 0);
    const width = Math.round((subject.width ?? 0) * (subject.scaleX ?? 1));
    const height = Math.round((subject.height ?? 0) * (subject.scaleY ?? 1));

    const shadow = subject.shadow as FabricShadow | null;

    const baseProps: InspectedProperties = {
      type,
      fill,
      stroke,
      strokeWidth,
      opacity,
      padding,
      angle,
      width,
      height,
      isLocked: Boolean(subject.lockMovementX && subject.lockMovementY),
      hasShadow: !!shadow,
      shadowColor: shadow?.color ?? "#00000040",
      shadowBlur: shadow?.blur ?? 12,
      shadowOffsetX: shadow?.offsetX ?? 0,
      shadowOffsetY: shadow?.offsetY ?? 8,
      blendMode: subject.globalCompositeOperation || "source-over",
      mask: maskKind(subject as FabricObject & { swibpMask?: unknown }),
    };

    const stops = gradientStops(subject.fill);
    if (stops) {
      baseProps.gradientFrom = stops[0];
      baseProps.gradientTo = stops[1];
      baseProps.fill = stops[0];
    }

    if (type === "text" || type === "i-text" || type === "textbox") {
      const textObj = subject as unknown as FabricText;
      baseProps.text = textObj.text ?? "";
      baseProps.fontFamily = normalizeFontFamily(
        typeof textObj.fontFamily === "string" ? textObj.fontFamily : undefined,
      );
      baseProps.fontSize = textObj.fontSize ?? 32;
      baseProps.lineHeight = textObj.lineHeight ?? 1.16;
      baseProps.charSpacing = textObj.charSpacing ?? 0;
      baseProps.textAlign = (textObj.textAlign as TextAlign) ?? "left";
      baseProps.isBold =
        textObj.fontWeight === "bold" || Number(textObj.fontWeight) >= 700;
      baseProps.isItalic = textObj.fontStyle === "italic";
      baseProps.isUnderline = Boolean(textObj.underline);
      baseProps.backgroundColor =
        typeof textObj.backgroundColor === "string"
          ? textObj.backgroundColor
          : "transparent";

      const family = baseProps.fontFamily;
      if (family && manager) {
        const canvas = manager.canvas;
        void loadGoogleFont(family).then(() => {
          refreshCanvasFonts(canvas);
        });
      }
    }

    if (type === "rect") {
      const rectObj = subject as unknown as Rect;
      baseProps.rx = rectObj.rx ?? 0;
    }

    if (type === "image") {
      const imgObj = subject as unknown as FabricImage;
      const currentSrc = imgObj.getSrc ? imgObj.getSrc() : "";
      baseProps.src = currentSrc;
      setImageUrlInput(currentSrc);
      baseProps.rx = (imgObj as unknown as { rx?: number }).rx ?? 0;
    }

    setFormValues(baseProps);
  }, [selectedObject]);

  const canvas = manager?.canvas;

  const updateProp = (
    key: keyof InspectedProperties,
    value: unknown,
    fabricKey: string = key,
  ) => {
    setFormValues((prev) => (prev ? { ...prev, [key]: value } : null));
    updateSelected({
      [fabricKey]: value,
    } as unknown as Partial<FabricObject>);
  };

  const groupSelected = () => {
    if (!manager || (canvas?.getActiveObjects().length ?? 0) < 2) return;
    manager.transact(() => groupSelection(manager.canvas));
  };

  const ungroupSelected = () => {
    if (!manager || !canUngroup(selectedObject)) return;
    manager.transact(() => ungroupSelection(manager.canvas));
  };

  const copyStyle = () => {
    if (!canvas) return;
    copyStyleFromSelection(canvas);
  };

  const pasteStyle = () => {
    if (!manager || !copiedStyle) return;
    manager.transact(() => pasteObjectStyle(manager.canvas));
  };

  const setMask = (kind: MaskKind) => {
    if (!manager || !canvas) return;
    const objects = canvas.getActiveObjects();
    if (objects.length === 0) return;
    for (const obj of objects) applyMask(obj, kind);
    setFormValues((prev) => (prev ? { ...prev, mask: kind } : null));
    canvas.requestRenderAll();
    manager.commit();
  };

  const setGradient = (from: string, to: string) => {
    setFormValues((prev) =>
      prev ? { ...prev, fill: from, gradientFrom: from, gradientTo: to } : null,
    );
    updateSelected({
      fill: linearGradient(from, to),
      swibpSlot: "",
    } as unknown as Partial<FabricObject>);
  };

  const clearGradient = () => {
    const solid = formValues?.gradientFrom || formValues?.fill || "#000000";
    setFormValues((prev) =>
      prev ? { ...prev, fill: solid, gradientFrom: null, gradientTo: null } : null,
    );
    updateSelected({ fill: solid } as unknown as Partial<FabricObject>);
  };

  const toggleTextStyle = (kind: "bold" | "italic" | "underline") => {
    if (!formValues) return;
    const next =
      kind === "bold"
        ? !formValues.isBold
        : kind === "italic"
          ? !formValues.isItalic
          : !formValues.isUnderline;
    const patch =
      kind === "bold"
        ? { fontWeight: next ? "bold" : "normal" }
        : kind === "italic"
          ? { fontStyle: next ? "italic" : "normal" }
          : { underline: next };
    const active = manager?.getActiveObject();
    if (active && applySelectionStyle(active, patch)) {
      refreshMask(active);
      manager?.canvas.requestRenderAll();
      manager?.commit();
      return;
    }
    if (kind === "bold") {
      setFormValues((prev) => (prev ? { ...prev, isBold: next } : null));
      updateSelected({ fontWeight: next ? "bold" : "normal" } as unknown as Partial<FabricObject>);
    } else if (kind === "italic") {
      setFormValues((prev) => (prev ? { ...prev, isItalic: next } : null));
      updateSelected({ fontStyle: next ? "italic" : "normal" } as unknown as Partial<FabricObject>);
    } else {
      updateProp("isUnderline", next, "underline");
    }
  };

  const applyTextList = (kind: ListKind) => {
    const active = manager?.getActiveObject();
    if (!active || !manager || formValues?.text == null) return;
    const styles = (active as FabricObject & { styles?: TextStyles }).styles;
    const next = applyList(formValues.text, styles, kind);
    writeFormattedText(active, next.text, next.styles);
    refreshMask(active);
    setFormValues((prev) => (prev ? { ...prev, text: next.text } : null));
    manager.canvas.requestRenderAll();
    manager.commit();
  };

  const updateCornerRadius = (radius: number) => {
    if (!selectedObject || !canvas) return;

    setFormValues((prev) => (prev ? { ...prev, rx: radius } : null));

    if (selectedObject.type === "rect") {
      updateSelected({
        rx: radius,
        ry: radius,
      } as unknown as Partial<FabricObject>);
    } else if (selectedObject.type === "image") {
      const img = selectedObject as FabricImage;

      img.set("rx" as keyof FabricImage, radius);

      if (radius > 0) {
        const clipRect = new Rect({
          width: img.width,
          height: img.height,
          rx: radius,
          ry: radius,
          originX: "center",
          originY: "center",
        });
        img.set({ clipPath: clipRect });
      } else {
        img.set({ clipPath: undefined });
      }
      canvas.requestRenderAll();
      canvas.fire("object:modified");
    }
  };

  const toggleShadow = (enable: boolean) => {
    if (!canvas || !formValues) return;
    const objects = canvas.getActiveObjects();
    if (objects.length === 0) return;

    for (const obj of objects) {
      obj.set({
        shadow: enable
          ? new FabricShadow({
              color: formValues.shadowColor,
              blur: formValues.shadowBlur,
              offsetX: formValues.shadowOffsetX,
              offsetY: formValues.shadowOffsetY,
            })
          : null,
      });
    }

    setFormValues((prev) => (prev ? { ...prev, hasShadow: enable } : null));
    canvas.requestRenderAll();
    manager?.commit();
  };

  const updateShadowProp = (
    key: "shadowColor" | "shadowBlur" | "shadowOffsetX" | "shadowOffsetY",
    val: unknown,
  ) => {
    if (!canvas || !formValues) return;

    const nextValues = { ...formValues, [key]: val };
    setFormValues(nextValues);
    if (!nextValues.hasShadow) return;

    for (const obj of canvas.getActiveObjects()) {
      obj.set({
        shadow: new FabricShadow({
          color: nextValues.shadowColor,
          blur: nextValues.shadowBlur,
          offsetX: nextValues.shadowOffsetX,
          offsetY: nextValues.shadowOffsetY,
        }),
      });
    }
    canvas.requestRenderAll();
    manager?.commit();
  };

  const changeImageSource = (newSrc: string) => {
    if (!selectedObject || selectedObject.type !== "image" || !canvas) return;

    const imgObj = selectedObject as unknown as FabricImage;
    if (typeof imgObj.setSrc === "function") {
      imgObj.setSrc(newSrc, { crossOrigin: "anonymous" }).then(() => {
        imgObj.setCoords();
        canvas.requestRenderAll();
        canvas.fire("object:modified");
        setFormValues((prev) => (prev ? { ...prev, src: newSrc } : null));
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const intoFrame =
      canFillShape(selectedObject?.type) ||
      (selectedObject?.type === "image" && Boolean(selectedObject.clipPath));

    void fileToDataUrl(file)
      .then((dataUrl) => {
        if (intoFrame && selectedObject && manager) {
          return manager.objects.fillFrameWithImage(selectedObject, dataUrl);
        }
        changeImageSource(dataUrl);
        setImageUrlInput("");
      })
      .catch((err) => console.error(err));
    e.target.value = "";
  };

  const handleRemoveBackground = async () => {
    if (!selectedObject || selectedObject.type !== "image") return;

    const imgObj = selectedObject as unknown as FabricImage;
    const src =
      (typeof imgObj.getSrc === "function" ? imgObj.getSrc() : "") ||
      formValues?.src ||
      "";
    if (!src) {
      setBgError("No image source");
      return;
    }

    setBgRemoving(true);
    setBgError(null);
    setBgProgress("Preparing the model…");

    try {
      const result = await removeImageBackground(src, {
        onProgress: ({ key, current, total }) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          setBgProgress(
            pct >= 100 ? "Processing…" : `Loading ${key}: ${pct}%`,
          );
        },
      });
      changeImageSource(result);
      setBgProgress(null);
    } catch (err) {
      console.error(err);
      setBgError("Couldn't remove the background. Try again.");
      setBgProgress(null);
    } finally {
      setBgRemoving(false);
    }
  };

  const handleCenterH = () => {
    const active = canvas?.getActiveObject();
    if (active && manager) {
      manager.grid.centerObject(active, "horizontal");
      manager.commit();
    }
  };

  const handleCenterV = () => {
    const active = canvas?.getActiveObject();
    if (active && manager) {
      manager.grid.centerObject(active, "vertical");
      manager.commit();
    }
  };

  const handleBringForward = () => {
    const active = canvas?.getActiveObject();
    if (active && canvas) {
      canvas.bringObjectForward(active);
      canvas.requestRenderAll();
      manager?.commit();
    }
  };

  const handleSendBackwards = () => {
    const active = canvas?.getActiveObject();
    if (active && canvas) {
      canvas.sendObjectBackwards(active);
      canvas.requestRenderAll();
      manager?.commit();
    }
  };

  const handleToggleLock = () => {
    if (!canvas || !formValues) return;
    const objects = canvas.getActiveObjects();
    if (objects.length === 0) return;
    const next = !formValues.isLocked;
    setFormValues((prev) => (prev ? { ...prev, isLocked: next } : null));
    for (const obj of objects) {
      obj.set({
        lockMovementX: next,
        lockMovementY: next,
        lockRotation: next,
        lockScalingX: next,
        lockScalingY: next,
        lockSkewingX: next,
        lockSkewingY: next,
        hasControls: !next,
      });
    }
    canvas.requestRenderAll();
    manager?.commit();
  };

  const setWidth = (val: number) => {
    setFormValues((p) => (p ? { ...p, width: val } : null));
    if (selectedObject && val > 0) {
      selectedObject.scaleToWidth(val);
      canvas?.requestRenderAll();
      canvas?.fire("object:modified");
    }
  };

  const setHeight = (val: number) => {
    setFormValues((p) => (p ? { ...p, height: val } : null));
    if (selectedObject && val > 0) {
      selectedObject.scaleToHeight(val);
      canvas?.requestRenderAll();
      canvas?.fire("object:modified");
    }
  };

  const boundStyle = textStyleId(
    (selectedObject as { swibpStyle?: unknown } | null)?.swibpStyle,
  );
  const boundSlot = paletteSlot(
    (selectedObject as { swibpSlot?: unknown } | null)?.swibpSlot,
  );
  const selectedCount = manager?.canvas.getActiveObjects().length ?? 0;
  const isMulti = selectedCount >= 2;
  const sharedText =
    isMulti &&
    (canvas?.getActiveObjects() ?? []).every(
      (obj) => obj.type === "text" || obj.type === "i-text" || obj.type === "textbox",
    );

  const noteStyleEdit = () => {
    if (boundStyle) setStyleOffer(boundStyle);
  };

  const applyStyleToSlides = (ids: number[] | null) => {
    if (!manager || !boundStyle) return;
    const active = manager.getActiveObject() as FabricObject & {
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string | number;
      lineHeight?: number;
    };
    if (!active) return;
    if (ids && ids.length === 0) return;
    const next: TextStyleDef = {
      fontFamily: typeof active.fontFamily === "string" ? active.fontFamily : "Inter",
      fontSize: typeof active.fontSize === "number" ? active.fontSize : 32,
      fontWeight: String(active.fontWeight ?? "400"),
      lineHeight: typeof active.lineHeight === "number" ? active.lineHeight : 1.16,
    };
    const store = useCanvasStore.getState();
    if (!ids) store.setTextStyle(boundStyle, next);
    const chosen = ids ? new Set(ids) : null;
    store.setSlides(
      store.slides.map((slide) =>
        !chosen || chosen.has(slide.id)
          ? { ...slide, canvasJSON: applyTextStyleToSlide(slide.canvasJSON, boundStyle, next) }
          : slide,
      ),
    );
    if (!chosen || chosen.has(store.currentSlideId)) {
      applyStyleOnCanvas(manager.canvas, boundStyle, next);
      manager.commit();
    }
    store.setDirty(true);
    setStyleOffer(null);
  };

  const applyStyleToCarousel = () => applyStyleToSlides(null);

  const assignFillSlot = (slot: (typeof PALETTE_SLOTS)[number]["id"]) => {
    const color = palette[slot];
    setFormValues((prev) =>
      prev ? { ...prev, fill: color, gradientFrom: null, gradientTo: null } : null,
    );
    updateSelected({ fill: color, swibpSlot: slot } as unknown as Partial<FabricObject>);
  };

  const alignSelection = (mode: ObjectAlign) => {
    if (!manager) return;
    alignSelected(manager.canvas, mode);
    manager.commit();
  };

  const isText =
    formValues?.type === "text" ||
    formValues?.type === "i-text" ||
    formValues?.type === "textbox";

  const [cropping, setCropping] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropMax, setCropMax] = useState(4);

  useEffect(() => {
    if (!manager) return;
    manager.crop.subscribe(() => {
      setCropping(manager.crop.active);
      setCropZoom(manager.crop.zoom);
      setCropMax(manager.crop.maxZoom);
    });
  }, [manager]);

  const isRect = formValues?.type === "rect";
  const isImage = formValues?.type === "image";
  const canHaveRadius = isRect || isImage;
  const canImportImage = canFillShape(formValues?.type);

  const typeLabel: Record<string, string> = {
    rect: "Rectangle",
    circle: "Circle",
    triangle: "Triangle",
    image: "Image",
    text: "Text",
    "i-text": "Text",
    textbox: "Text",
    path: "Shape",
    group: "Group",
  };

  const alignIcons: Record<TextAlign, React.ElementType> = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
    justify: AlignJustify,
  };

  return (
    <div className="relative flex h-full overflow-hidden border-l border-border bg-background">
      <div
        className={`flex flex-col overflow-y-auto transition-all duration-200 ease-in-out ${
          isRightCollapsed ? "w-0 opacity-0" : "w-72 opacity-100"
        }`}
      >
        <div className="flex h-11 shrink-0 items-center border-b border-border/60 px-3.5">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {isMulti
              ? "Selection"
              : formValues
                ? (typeLabel[formValues.type] ?? formValues.type)
                : "Properties"}
          </span>
        </div>

        <ScrollArea className="flex-1">
          {isMulti ? (
            <div className="flex flex-col gap-3 px-3 py-3">
              <p className="text-[13px] text-muted-foreground">
                {selectedCount} objects selected
              </p>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    ["left", "Align left", AlignHorizontalJustifyStart],
                    ["center", "Align center", AlignHorizontalJustifyCenter],
                    ["right", "Align right", AlignHorizontalJustifyEnd],
                    ["distribute-x", "Equal horizontal gaps", AlignHorizontalSpaceBetween],
                    ["top", "Align top", AlignVerticalJustifyStart],
                    ["middle", "Align middle", AlignVerticalJustifyCenter],
                    ["bottom", "Align bottom", AlignVerticalJustifyEnd],
                    ["distribute-y", "Equal vertical gaps", AlignVerticalSpaceBetween],
                  ] as const
                ).map(([mode, label, Icon]) => (
                  <Button
                    key={mode}
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={label}
                    className={`size-8 ${btnRound}`}
                    onClick={() => alignSelection(mode)}
                  >
                    <Icon className="size-4" />
                  </Button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 flex-1 text-[13px] ${btnRound}`}
                  onClick={groupSelected}
                >
                  Group
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 flex-1 text-[13px] ${btnRound}`}
                  onClick={copyStyle}
                >
                  Copy style
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 flex-1 text-[13px] ${btnRound}`}
                  disabled={!copiedStyle}
                  onClick={pasteStyle}
                >
                  Paste style
                </Button>
              </div>
              {formValues && (
                <>
                  {sharedText && (
                    <CollapsibleGroup id="rs-multi-text" title="Text" defaultOpen>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] text-muted-foreground">AI rewrite</span>
                        <AiTextAssist manager={manager} />
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          variant={formValues.isBold ? "secondary" : "outline"}
                          size="icon"
                          className={`size-8 ${btnRound}`}
                          onClick={() => toggleTextStyle("bold")}
                        >
                          <Bold className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={formValues.isItalic ? "secondary" : "outline"}
                          size="icon"
                          className={`size-8 ${btnRound}`}
                          onClick={() => toggleTextStyle("italic")}
                        >
                          <Italic className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={formValues.isUnderline ? "secondary" : "outline"}
                          size="icon"
                          className={`size-8 ${btnRound}`}
                          onClick={() => toggleTextStyle("underline")}
                        >
                          <Underline className="size-4" />
                        </Button>
                      </div>
                      <FontSelect
                        value={formValues.fontFamily ?? "Inter"}
                        onChange={(family) => {
                          setFormValues((prev) => (prev ? { ...prev, fontFamily: family } : null));
                          updateSelected({ fontFamily: family } as unknown as Partial<FabricObject>);
                          if (manager) refreshCanvasFonts(manager.canvas);
                        }}
                      />
                      <NumberField
                        label="Font size"
                        value={formValues.fontSize ?? 32}
                        onChange={(v) => updateProp("fontSize", v)}
                        min={8}
                        max={240}
                        unit="px"
                      />
                      <NumberField
                        label="Line height"
                        value={formValues.lineHeight ?? 1.16}
                        onChange={(v) => updateProp("lineHeight", v)}
                        min={0.8}
                        max={2.5}
                        step={0.05}
                        decimals={2}
                      />
                      <div className="flex rounded-full border border-border bg-transparent p-1">
                        {(["left", "center", "right", "justify"] as const).map((align) => {
                          const Icon = alignIcons[align];
                          return (
                            <button
                              key={align}
                              type="button"
                              onClick={() => updateProp("textAlign", align)}
                              className={`flex h-7 flex-1 items-center justify-center rounded-full transition-colors ${
                                formValues.textAlign === align
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Icon className="size-4" />
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleGroup>
                  )}
                  <CollapsibleGroup id="rs-multi-color" title="Color" defaultOpen>
                    <ColorPicker
                      label="Fill"
                      value={formValues.fill}
                      onChange={(hex) => {
                        setFormValues((prev) =>
                          prev ? { ...prev, fill: hex, gradientFrom: null, gradientTo: null } : null,
                        );
                        updateSelected({
                          fill: hex,
                          swibpSlot: "",
                        } as unknown as Partial<FabricObject>);
                      }}
                    />
                    <ColorPicker
                      label="Stroke"
                      value={formValues.stroke}
                      onChange={(hex) => updateProp("stroke", hex)}
                    />
                    <NumberField
                      label="Thickness"
                      value={formValues.strokeWidth}
                      onChange={(v) => updateProp("strokeWidth", v)}
                      min={0}
                      max={40}
                      unit="px"
                    />
                  </CollapsibleGroup>
                  <CollapsibleGroup id="rs-multi-look" title="Appearance" defaultOpen={false}>
                    <NumberField
                      label="Opacity"
                      value={Math.round(formValues.opacity * 100)}
                      onChange={(v) => updateProp("opacity", v / 100)}
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] text-muted-foreground">Blend</span>
                      <select
                        value={
                          BLEND_MODES.some((mode) => mode.id === formValues.blendMode)
                            ? formValues.blendMode
                            : "source-over"
                        }
                        onChange={(e) =>
                          updateProp("blendMode", e.target.value, "globalCompositeOperation")
                        }
                        className="h-9 w-full rounded-full bg-muted/40 px-3 text-[13px] text-foreground outline-none"
                      >
                        {BLEND_MODES.map((mode) => (
                          <option key={mode.id} value={mode.id}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] text-muted-foreground">Shadow</span>
                      <Button
                        type="button"
                        variant={formValues.hasShadow ? "secondary" : "outline"}
                        size="sm"
                        className={`h-8 ${btnRound}`}
                        onClick={() => toggleShadow(!formValues.hasShadow)}
                      >
                        {formValues.hasShadow ? "On" : "Off"}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant={formValues.isLocked ? "secondary" : "outline"}
                      size="sm"
                      className={`h-8 ${btnRound}`}
                      onClick={handleToggleLock}
                    >
                      {formValues.isLocked ? "Unlock" : "Lock"}
                    </Button>
                  </CollapsibleGroup>
                </>
              )}
            </div>
          ) : !formValues ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center text-muted-foreground">
              <SelectObjectArt className="h-auto w-full max-w-[160px]" />
              <p className="text-[13px] leading-snug">
                Select an object on the canvas to change its properties
              </p>
            </div>
          ) : (
            <div className="flex flex-col pb-3">
              {canImportImage && (
                <div className="border-b border-border/60 px-3 py-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-9 w-full justify-center gap-2 text-[13px] ${btnRound}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    Import image
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-1 px-2.5 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`size-8 ${btnRound}`}
                  onClick={handleCenterH}
                  title="Center horizontally"
                >
                  <AlignHorizontalDistributeCenter className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`size-8 ${btnRound}`}
                  onClick={handleCenterV}
                  title="Center vertically"
                >
                  <AlignVerticalDistributeCenter className="size-4" />
                </Button>
                <div className="mx-1.5 h-5 w-px bg-border/70" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`size-8 ${btnRound}`}
                  onClick={handleBringForward}
                  title="Bring forward"
                >
                  <BringToFront className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`size-8 ${btnRound}`}
                  onClick={handleSendBackwards}
                  title="Send backwards"
                >
                  <SendToBack className="size-4" />
                </Button>
                <div className="mx-1.5 h-5 w-px bg-border/70" />
                <Button
                  type="button"
                  variant={formValues.isLocked ? "secondary" : "ghost"}
                  size="icon"
                  className={`size-8 ${btnRound}`}
                  onClick={handleToggleLock}
                  title={formValues.isLocked ? "Unlock" : "Lock"}
                >
                  {formValues.isLocked ? (
                    <Lock className="size-4" />
                  ) : (
                    <Unlock className="size-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-1.5 border-b border-border/60 px-2.5 pb-2">
                {canUngroup(selectedObject) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-8 flex-1 text-[13px] ${btnRound}`}
                    onClick={ungroupSelected}
                  >
                    Ungroup
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 flex-1 text-[13px] ${btnRound}`}
                  onClick={copyStyle}
                >
                  Copy style
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 flex-1 text-[13px] ${btnRound}`}
                  disabled={!copiedStyle}
                  onClick={pasteStyle}
                >
                  Paste style
                </Button>
              </div>

              <CollapsibleGroup id="rs-position" title="Size and angle">
                <div className="grid grid-cols-2 gap-2.5">
                  <DimInput
                    label="Width"
                    value={formValues.width}
                    onChange={setWidth}
                  />
                  <DimInput
                    label="Height"
                    value={formValues.height}
                    onChange={setHeight}
                  />
                </div>
                <NumberField
                  label="Rotation"
                  value={formValues.angle}
                  onChange={(v) => updateProp("angle", v)}
                  min={-180}
                  max={360}
                  unit="°"
                />
              </CollapsibleGroup>

              {isImage && (
                <CollapsibleGroup id="rs-image" title="Image">
                  {cropping ? (
                    <>
                      <p className="text-[13px] leading-snug text-muted-foreground">
                        Drag the picture to move it inside the frame.
                      </p>
                      <NumberField
                        label="Zoom"
                        value={cropZoom}
                        min={1}
                        max={cropMax}
                        step={0.01}
                        decimals={2}
                        unit="×"
                        onChange={(value) => manager?.crop.setZoom(value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-9 flex-1 ${btnRound}`}
                          onClick={() => manager?.crop.cancel()}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className={`h-9 flex-1 ${btnRound}`}
                          onClick={() => manager?.crop.apply()}
                        >
                          Done
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`h-9 w-full justify-center gap-2 text-[13px] ${btnRound}`}
                      onClick={() => selectedObject && manager?.crop.start(selectedObject)}
                      disabled={bgRemoving}
                    >
                      <Crop className="size-4" />
                      Crop
                    </Button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-9 w-full justify-center gap-2 text-[13px] ${btnRound}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={bgRemoving}
                  >
                    <Upload className="size-4" />
                    Upload file
                  </Button>
                  <div className="flex gap-2">
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Image URL"
                      className="h-9 border border-border bg-transparent px-3 text-[13px] dark:bg-transparent"
                      disabled={bgRemoving}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && imageUrlInput.trim()) {
                          changeImageSource(imageUrlInput.trim());
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className={`h-9 px-3 text-[13px] ${btnRound}`}
                      disabled={bgRemoving || !imageUrlInput.trim()}
                      onClick={() => changeImageSource(imageUrlInput.trim())}
                    >
                      OK
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={`h-9 w-full justify-center gap-2 text-[13px] ${btnRound}`}
                    onClick={() => void handleRemoveBackground()}
                    disabled={bgRemoving}
                  >
                    {bgRemoving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <WandSparkles className="size-4" />
                    )}
                    {bgRemoving ? "Removing background…" : "Remove background"}
                  </Button>
                  {bgProgress && (
                    <p className="text-[13px] text-muted-foreground leading-snug">
                      {bgProgress}
                    </p>
                  )}
                  {bgError && (
                    <p className="text-[13px] text-destructive leading-snug">
                      {bgError}
                    </p>
                  )}
                </CollapsibleGroup>
              )}

              {isText && (
                <CollapsibleGroup id="rs-text" title="Text">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted-foreground">
                      Content
                    </span>
                    <textarea
                      rows={3}
                      value={formValues.text ?? ""}
                      onChange={(e) => updateProp("text", e.target.value)}
                      className="resize-none rounded-2xl border border-border bg-transparent p-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    <p
                      className={`text-[13px] leading-snug ${
                        textLengthStatus("Instagram", (formValues.text ?? "").trim().length).tooLong
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {textLengthNote("Instagram", (formValues.text ?? "").trim().length)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted-foreground">AI rewrite</span>
                    <AiTextAssist
                      manager={manager}
                      onApplied={(texts) => {
                        const next = texts[0];
                        if (typeof next !== "string") return;
                        setFormValues((prev) => (prev ? { ...prev, text: next } : null));
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted-foreground">Style</span>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant={formValues.isBold ? "secondary" : "outline"}
                        size="icon"
                        className={`size-8 ${btnRound}`}
                        onClick={() => toggleTextStyle("bold")}
                      >
                        <Bold className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={formValues.isItalic ? "secondary" : "outline"}
                        size="icon"
                        className={`size-8 ${btnRound}`}
                        onClick={() => toggleTextStyle("italic")}
                      >
                        <Italic className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          formValues.isUnderline ? "secondary" : "outline"
                        }
                        size="icon"
                        className={`size-8 ${btnRound}`}
                        onClick={() => toggleTextStyle("underline")}
                      >
                        <Underline className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted-foreground">List</span>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`h-8 flex-1 gap-1.5 text-[13px] ${btnRound}`}
                        onClick={() => applyTextList("bullet")}
                      >
                        <List className="size-3.5" />
                        Bulleted
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`h-8 flex-1 gap-1.5 text-[13px] ${btnRound}`}
                        onClick={() => applyTextList("number")}
                      >
                        <ListOrdered className="size-3.5" />
                        Numbered
                      </Button>
                    </div>
                  </div>

                  <FontSelect
                    value={formValues.fontFamily ?? "Inter"}
                    onChange={(family) => {
                      setFormValues((prev) =>
                        prev ? { ...prev, fontFamily: family } : null,
                      );
                      updateSelected({
                        fontFamily: family,
                      } as unknown as Partial<FabricObject>);
                      setFontOffer(family);
                      if (manager) refreshCanvasFonts(manager.canvas);
                    }}
                  />

                  {fontOffer && (
                    <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-2.5">
                      <p className="text-[13px] leading-snug text-foreground">
                        Use {fontOffer} on which slides?
                      </p>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          className={`h-7 flex-1 text-[13px] ${btnRound}`}
                          onClick={() => {
                            applyCarouselFont(fontOffer, manager);
                            setFontOffer(null);
                          }}
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-7 flex-1 text-[13px] ${btnRound}`}
                          disabled={markedSlideIds.length === 0}
                          title={
                            markedSlideIds.length === 0
                              ? "Mark slides with the corner check"
                              : `Use ${fontOffer} on ${markedSlideIds.length} marked slides`
                          }
                          onClick={() => {
                            applyCarouselFont(fontOffer, manager, markedSlideIds);
                            setFontOffer(null);
                          }}
                        >
                          Marked
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-7 flex-1 text-[13px] ${btnRound}`}
                          onClick={() => setFontOffer(null)}
                        >
                          This
                        </Button>
                      </div>
                    </div>
                  )}

                  <NumberField
                    label="Font size"
                    value={formValues.fontSize ?? 32}
                    onChange={(v) => {
                      updateProp("fontSize", v);
                      noteStyleEdit();
                    }}
                    min={10}
                    max={140}
                    unit="px"
                  />

                  <NumberField
                    label="Line height"
                    value={formValues.lineHeight ?? 1.16}
                    onChange={(v) => updateProp("lineHeight", v)}
                    min={0.8}
                    max={2.5}
                    step={0.05}
                    decimals={2}
                  />

                  <NumberField
                    label="Letter spacing"
                    value={formValues.charSpacing ?? 0}
                    onChange={(v) => updateProp("charSpacing", v)}
                    min={-200}
                    max={800}
                    step={10}
                  />

                  {styleOffer && (
                    <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-2.5">
                      <p className="text-[13px] leading-snug text-foreground">
                        Update every{" "}
                        {TEXT_STYLES.find((style) => style.id === styleOffer)?.label.toLowerCase()}{" "}
                        on which slides?
                      </p>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          className={`h-7 flex-1 text-[13px] ${btnRound}`}
                          onClick={applyStyleToCarousel}
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-7 flex-1 text-[13px] ${btnRound}`}
                          disabled={markedSlideIds.length === 0}
                          title={
                            markedSlideIds.length === 0
                              ? "Mark slides with the corner check"
                              : "Update marked slides"
                          }
                          onClick={() => applyStyleToSlides(markedSlideIds)}
                        >
                          Marked
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-7 flex-1 text-[13px] ${btnRound}`}
                          onClick={() => setStyleOffer(null)}
                        >
                          This
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted-foreground">
                      Alignment
                    </span>
                    <div className="flex rounded-full border border-border bg-transparent p-1">
                      {(
                        ["left", "center", "right", "justify"] as const
                      ).map((align) => {
                        const Icon = alignIcons[align];
                        return (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateProp("textAlign", align)}
                            className={`flex h-7 flex-1 items-center justify-center rounded-full transition-colors ${
                              formValues.textAlign === align
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleGroup>
              )}

              <CollapsibleGroup id="rs-fill" title="Fill">
                {!isImage ? (
                  <>
                    <div className="grid grid-cols-4 gap-1">
                      {PALETTE_SLOTS.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          title={slot.label}
                          onClick={() => assignFillSlot(slot.id)}
                          className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] ${
                            boundSlot === slot.id
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span
                            className="size-4 rounded-full border border-border/40"
                            style={{ backgroundColor: palette[slot.id] }}
                          />
                          {slot.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex rounded-full border border-border bg-transparent p-1">
                      <button
                        type="button"
                        onClick={clearGradient}
                        className={`flex h-7 flex-1 items-center justify-center rounded-full text-[13px] transition-colors ${
                          formValues.gradientFrom
                            ? "text-muted-foreground hover:text-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGradient(
                            formValues.gradientFrom || formValues.fill || "#111111",
                            formValues.gradientTo || "#ffffff",
                          )
                        }
                        className={`flex h-7 flex-1 items-center justify-center rounded-full text-[13px] transition-colors ${
                          formValues.gradientFrom
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Gradient
                      </button>
                    </div>
                    {formValues.gradientFrom && formValues.gradientTo ? (
                      <>
                        <ColorPicker
                          label="Start"
                          value={formValues.gradientFrom}
                          onChange={(hex) => setGradient(hex, formValues.gradientTo || "#ffffff")}
                        />
                        <ColorPicker
                          label="End"
                          value={formValues.gradientTo}
                          onChange={(hex) => setGradient(formValues.gradientFrom || "#111111", hex)}
                        />
                      </>
                    ) : (
                      <ColorPicker
                        label={isText ? "Text color" : "Fill color"}
                        value={formValues.fill}
                        onChange={(hex) => {
                          setFormValues((prev) => (prev ? { ...prev, fill: hex } : null));
                          updateSelected({
                            fill: hex,
                            swibpSlot: "",
                          } as unknown as Partial<FabricObject>);
                        }}
                      />
                    )}
                  </>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    The image has no fill — replace the file in the section above.
                  </p>
                )}
                {isText && (
                  <ColorPicker
                    label="Text background"
                    value={
                      formValues.backgroundColor === "transparent"
                        ? ""
                        : (formValues.backgroundColor ?? "")
                    }
                    onChange={(hex) => updateProp("backgroundColor", hex)}
                    trailing={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 text-[13px] ${btnRound}`}
                        onClick={() =>
                          updateProp("backgroundColor", "transparent")
                        }
                      >
                        Reset
                      </Button>
                    }
                  />
                )}
              </CollapsibleGroup>

              <CollapsibleGroup id="rs-stroke" title="Stroke">
                <ColorPicker
                  label="Stroke color"
                  value={formValues.stroke}
                  onChange={(hex) => updateProp("stroke", hex)}
                />
                <NumberField
                  label="Thickness"
                  value={formValues.strokeWidth}
                  onChange={(v) => updateProp("strokeWidth", v)}
                  min={0}
                  max={20}
                  unit="px"
                />
              </CollapsibleGroup>

              <CollapsibleGroup id="rs-appearance" title="Appearance">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] text-muted-foreground">Blend</span>
                  <select
                    value={
                      BLEND_MODES.some((mode) => mode.id === formValues.blendMode)
                        ? formValues.blendMode
                        : "source-over"
                    }
                    onChange={(e) => updateProp("blendMode", e.target.value, "globalCompositeOperation")}
                    className="h-9 w-full rounded-full bg-muted/40 px-3 text-[13px] text-foreground outline-none"
                  >
                    {BLEND_MODES.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] text-muted-foreground">Mask</span>
                  <div className="flex rounded-full border border-border bg-transparent p-1">
                    {(
                      [
                        ["none", "None"],
                        ["circle", "Circle"],
                        ["rounded", "Rounded"],
                      ] as const
                    ).map(([kind, label]) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setMask(kind)}
                        className={`flex h-7 flex-1 items-center justify-center rounded-full text-[13px] transition-colors ${
                          (formValues.mask ?? "none") === kind
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <NumberField
                  label="Opacity"
                  value={Math.round(formValues.opacity * 100)}
                  onChange={(v) => updateProp("opacity", v / 100)}
                  min={0}
                  max={100}
                  unit="%"
                />

                {canHaveRadius && (
                  <NumberField
                    label="Corner radius"
                    value={formValues.rx ?? 0}
                    onChange={updateCornerRadius}
                    min={0}
                    max={120}
                    unit="px"
                  />
                )}

                <NumberField
                  label="Padding"
                  value={formValues.padding}
                  onChange={(v) => updateProp("padding", v)}
                  min={0}
                  max={60}
                  unit="px"
                />
              </CollapsibleGroup>

              <CollapsibleGroup
                id="rs-effects"
                title="Shadow"
                headerRight={
                  <Switch
                    size="sm"
                    checked={formValues.hasShadow}
                    onCheckedChange={toggleShadow}
                    aria-label="Enable shadow"
                  />
                }
              >
                {formValues.hasShadow ? (
                  <div className="flex flex-col gap-3">
                    <ColorPicker
                      label="Shadow color"
                      value={formValues.shadowColor.slice(0, 7)}
                      onChange={(hex) => updateShadowProp("shadowColor", hex)}
                    />
                    <NumberField
                      label="Blur"
                      value={formValues.shadowBlur}
                      onChange={(v) => updateShadowProp("shadowBlur", v)}
                      min={0}
                      max={50}
                      unit="px"
                    />
                    <NumberField
                      label="Vertical offset"
                      value={formValues.shadowOffsetY}
                      onChange={(v) => updateShadowProp("shadowOffsetY", v)}
                      min={-30}
                      max={50}
                      unit="px"
                    />
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    Enable the switch on the right to add a shadow.
                  </p>
                )}
              </CollapsibleGroup>
            </div>
          )}
        </ScrollArea>
      </div>

      <aside className="flex w-10 shrink-0 flex-col items-center justify-start border-l border-border/50 py-3">
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 text-muted-foreground hover:text-foreground ${btnRound}`}
          onClick={() => setIsRightCollapsed(!isRightCollapsed)}
          title={isRightCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isRightCollapsed ? (
            <PanelRightOpen className="size-4" />
          ) : (
            <PanelRightClose className="size-4" />
          )}
        </Button>
      </aside>
    </div>
  );
}
