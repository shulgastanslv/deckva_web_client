import type { FabricCanvasJSON, SlideItem } from "@/lib/types";
import { hexToHsl } from "@/lib/color/palette";
import {
  applyChrome,
  type ChromeTemplate,
} from "@/lib/canvas/chrome";

export type PaletteSlot = "background" | "text" | "accent" | "card";
export type TextStyleId = "heading" | "subtitle" | "body";

export interface TextStyleDef {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
}

export interface ProjectPalette {
  background: string;
  text: string;
  accent: string;
  card: string;
}

export interface DocumentMeta {
  palette: ProjectPalette;
  textStyles: Record<TextStyleId, TextStyleDef>;
  chrome: ChromeTemplate[];
}

export const PALETTE_SLOTS: { id: PaletteSlot; label: string }[] = [
  { id: "background", label: "Background" },
  { id: "text", label: "Text" },
  { id: "accent", label: "Accent" },
  { id: "card", label: "Card" },
];

export const TEXT_STYLES: { id: TextStyleId; label: string }[] = [
  { id: "heading", label: "Heading" },
  { id: "subtitle", label: "Subtitle" },
  { id: "body", label: "Body" },
];

const SLOTS = new Set<string>(PALETTE_SLOTS.map((slot) => slot.id));
const STYLE_IDS = new Set<string>(TEXT_STYLES.map((style) => style.id));

export function defaultDocument(): DocumentMeta {
  return {
    palette: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#3b82f6",
      card: "#f1f5f9",
    },
    textStyles: {
      heading: { fontFamily: "Inter", fontSize: 80, fontWeight: "bold", lineHeight: 0.8 },
      subtitle: { fontFamily: "Inter", fontSize: 40, fontWeight: "400", lineHeight: 0.8 },
      body: { fontFamily: "Inter", fontSize: 28, fontWeight: "400", lineHeight: 0.8 },
    },
    chrome: [],
  };
}

export function paletteSlot(value: unknown): PaletteSlot | null {
  return typeof value === "string" && SLOTS.has(value) ? (value as PaletteSlot) : null;
}

export function textStyleId(value: unknown): TextStyleId | null {
  return typeof value === "string" && STYLE_IDS.has(value) ? (value as TextStyleId) : null;
}

export function normalizeDocument(value: unknown): DocumentMeta {
  const base = defaultDocument();
  if (!value || typeof value !== "object") return base;
  const raw = value as Partial<DocumentMeta>;
  const palette = { ...base.palette };
  if (raw.palette && typeof raw.palette === "object") {
    for (const slot of PALETTE_SLOTS) {
      const color = raw.palette[slot.id];
      if (typeof color === "string" && color.trim()) palette[slot.id] = color;
    }
  }
  const textStyles = { ...base.textStyles };
  if (raw.textStyles && typeof raw.textStyles === "object") {
    for (const style of TEXT_STYLES) {
      const next = raw.textStyles[style.id];
      if (!next || typeof next !== "object") continue;
      textStyles[style.id] = {
        fontFamily: typeof next.fontFamily === "string" ? next.fontFamily : textStyles[style.id].fontFamily,
        fontSize: typeof next.fontSize === "number" ? next.fontSize : textStyles[style.id].fontSize,
        fontWeight: typeof next.fontWeight === "string" ? next.fontWeight : textStyles[style.id].fontWeight,
        lineHeight: typeof next.lineHeight === "number" ? next.lineHeight : textStyles[style.id].lineHeight,
      };
    }
  }
  return {
    palette,
    textStyles,
    chrome: Array.isArray(raw.chrome) ? raw.chrome.filter(isChromeTemplate) : [],
  };
}

function isChromeTemplate(value: unknown): value is ChromeTemplate {
  if (!value || typeof value !== "object") return false;
  const role = (value as ChromeTemplate).role;
  return (
    (role === "number" || role === "handle" || role === "swipe") &&
    typeof (value as ChromeTemplate).object === "object" &&
    (value as ChromeTemplate).object != null
  );
}

/** Map a generated harmony onto the four document slots. The seed becomes the accent. */
export function paletteFromHarmony(colors: string[], seed?: string): ProjectPalette {
  const list = colors.filter((color) => /^#?[0-9a-f]{3,8}$/i.test(color));
  const source = list.length > 0 ? list : ["#3b82f6"];
  const byLight = [...source].sort((a, b) => hexToHsl(a)[2] - hexToHsl(b)[2]);
  const background = byLight[byLight.length - 1]!;
  const text = byLight[0] === background ? "#0f172a" : byLight[0]!;
  const cardCandidate = byLight.length > 2 ? byLight[byLight.length - 2]! : background;

  const seedMatch = seed
    ? source.find((color) => color.toLowerCase() === seed.toLowerCase())
    : undefined;
  const accentPool = source.filter((color) => color !== background && color !== text);
  const accent =
    seedMatch && seedMatch !== background && seedMatch !== text
      ? seedMatch
      : [...(accentPool.length > 0 ? accentPool : source)].sort((a, b) => {
          const [, aSat, aLight] = hexToHsl(a);
          const [, bSat, bLight] = hexToHsl(b);
          const score = (saturation: number, lightness: number) =>
            saturation - Math.abs(lightness - 48) * 0.45;
          return score(bSat, bLight) - score(aSat, aLight);
        })[0]!;

  return {
    background,
    text,
    accent,
    card: cardCandidate === background ? accent : cardCandidate,
  };
}

function paintRecord(
  object: Record<string, unknown>,
  slot: PaletteSlot,
  color: string,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...object };
  if (next.swibpSlot === slot) next.fill = color;
  if (Array.isArray(next.objects)) {
    next.objects = (next.objects as Record<string, unknown>[]).map((child) =>
      paintRecord(child, slot, color),
    );
  }
  return next;
}

export function paintSlide(
  json: FabricCanvasJSON,
  slot: PaletteSlot,
  color: string,
): FabricCanvasJSON {
  const next: FabricCanvasJSON = {
    ...json,
    objects: (json.objects ?? []).map((object) => paintRecord(object, slot, color)),
  };
  if (slot === "background") {
    next.background = color;
    delete next.backgroundImage;
  }
  return next;
}

function styleRecord(
  object: Record<string, unknown>,
  styleId: TextStyleId,
  style: TextStyleDef,
): Record<string, unknown> {
  const children = Array.isArray(object.objects)
    ? (object.objects as Record<string, unknown>[]).map((child) => styleRecord(child, styleId, style))
    : undefined;
  if (object.swibpStyle !== styleId) {
    return children ? { ...object, objects: children } : object;
  }
  return {
    ...object,
    ...(children ? { objects: children } : {}),
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
  };
}

const TEXT_TYPES = new Set(["text", "i-text", "textbox", "itext"]);

function isTextRecord(object: Record<string, unknown>) {
  const type = typeof object.type === "string" ? object.type.toLowerCase() : "";
  return TEXT_TYPES.has(type);
}

function withFont(object: Record<string, unknown>, fontFamily: string): Record<string, unknown> {
  const children = Array.isArray(object.objects)
    ? (object.objects as Record<string, unknown>[]).map((child) => withFont(child, fontFamily))
    : undefined;
  const next = children ? { ...object, objects: children } : { ...object };
  if (!isTextRecord(object)) return next;
  return { ...next, fontFamily };
}

/** Sets the typeface on every text object and leaves size, weight, and color alone. */
export function applyFontToSlide(json: FabricCanvasJSON, fontFamily: string): FabricCanvasJSON {
  return {
    ...json,
    objects: (json.objects ?? []).map((object) => withFont(object, fontFamily)),
  };
}

export function applyTextStyleToSlide(
  json: FabricCanvasJSON,
  styleId: TextStyleId,
  style: TextStyleDef,
): FabricCanvasJSON {
  return {
    ...json,
    objects: (json.objects ?? []).map((object) => styleRecord(object, styleId, style)),
  };
}

export function splitSlideLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function slidesFromLines(input: {
  text: string;
  styleId: TextStyleId;
  style: TextStyleDef;
  palette: ProjectPalette;
  chrome: ChromeTemplate[];
  width: number;
  height: number;
}): SlideItem[] {
  const lines = splitSlideLines(input.text);
  return lines.map((line, index) => {
    const canvasJSON: FabricCanvasJSON = {
      version: "6.0.0",
      background: input.palette.background,
      objects: [
        {
          type: "Textbox",
          originX: "center",
          originY: "center",
          left: input.width / 2,
          top: input.height / 2,
          width: Math.round(input.width * 0.78),
          text: line,
          fill: input.palette.text,
          fontSize: input.style.fontSize,
          fontFamily: input.style.fontFamily,
          fontWeight: input.style.fontWeight,
          lineHeight: input.style.lineHeight,
          textAlign: "center",
          swibpStyle: input.styleId,
          swibpSlot: "text",
          swibpTextResize: "auto-height",
          swibpFitWidth: false,
        },
      ],
    };
    return {
      id: index + 1,
      thumbnail: null,
      canvasJSON: applyChrome(canvasJSON, input.chrome, index, lines.length),
    };
  });
}
