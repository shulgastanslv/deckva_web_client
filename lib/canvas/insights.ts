import type { RatioKey } from "@/lib/types";
import { skipsInsightText } from "./roles";

/** Platforms the editor already designs for. Patterns are general, not an account's own audience. */
export const INSIGHT_PLATFORMS = ["Telegram", "Threads", "Instagram", "X"] as const;
export type InsightPlatform = (typeof INSIGHT_PLATFORMS)[number];

export interface AttentionZone {
  id: string;
  /** 0–1 from the left edge. */
  x: number;
  /** 0–1 from the top edge. */
  y: number;
  /** Diameter as a fraction of the slide width. */
  r: number;
  /** 0–1, hotter is looked at more often. */
  heat: number;
  label: string;
  hint: string;
}

export interface SlideSignals {
  characters: number;
  textColors: string[];
  backgrounds: string[];
  patterned: boolean;
}

export interface EngagementReport {
  score: number;
  label: "Low" | "Steady" | "Strong";
  notes: [string, string, string];
}

interface ReadableObject {
  type?: string;
  text?: unknown;
  fill?: unknown;
  swibpRole?: unknown;
  objects?: ReadableObject[];
  getObjects?: () => ReadableObject[];
}

const TEXT_TYPES = new Set(["text", "i-text", "itext", "textbox"]);

const ZONES: Record<InsightPlatform, AttentionZone[]> = {
  Instagram: [
    {
      id: "headline",
      x: 0.3,
      y: 0.22,
      r: 0.46,
      heat: 1,
      label: "Headline",
      hint: "The first look lands on the headline.",
    },
    {
      id: "picture",
      x: 0.56,
      y: 0.5,
      r: 0.4,
      heat: 0.72,
      label: "Picture",
      hint: "The eye moves to the picture in the middle.",
    },
    {
      id: "swipe",
      x: 0.8,
      y: 0.86,
      r: 0.32,
      heat: 0.5,
      label: "Swipe",
      hint: "The last glance is the cue to swipe.",
    },
  ],
  Threads: [
    {
      id: "opener",
      x: 0.32,
      y: 0.18,
      r: 0.44,
      heat: 1,
      label: "Opener",
      hint: "The first line is what gets read.",
    },
    {
      id: "body",
      x: 0.36,
      y: 0.48,
      r: 0.4,
      heat: 0.7,
      label: "Body",
      hint: "Reading continues down the left side.",
    },
    {
      id: "close",
      x: 0.4,
      y: 0.74,
      r: 0.32,
      heat: 0.4,
      label: "Close",
      hint: "A short last line still gets a glance.",
    },
  ],
  Telegram: [
    {
      id: "top",
      x: 0.4,
      y: 0.16,
      r: 0.42,
      heat: 1,
      label: "Top",
      hint: "The top of the card is read first.",
    },
    {
      id: "column",
      x: 0.4,
      y: 0.46,
      r: 0.4,
      heat: 0.74,
      label: "Column",
      hint: "The eye then travels straight down the text.",
    },
    {
      id: "end",
      x: 0.4,
      y: 0.78,
      r: 0.3,
      heat: 0.36,
      label: "End",
      hint: "The last line is read when the card stays short.",
    },
  ],
  X: [
    {
      id: "line",
      x: 0.34,
      y: 0.2,
      r: 0.44,
      heat: 1,
      label: "Top line",
      hint: "The top line is what stops the scroll.",
    },
    {
      id: "proof",
      x: 0.4,
      y: 0.46,
      r: 0.36,
      heat: 0.58,
      label: "Next line",
      hint: "One supporting line is usually enough.",
    },
    {
      id: "mark",
      x: 0.78,
      y: 0.18,
      r: 0.26,
      heat: 0.32,
      label: "Corner",
      hint: "A small corner mark is noticed, then left.",
    },
  ],
};

const SLIDE_BANDS: Record<InsightPlatform, { ideal: [number, number]; outer: [number, number] }> = {
  Instagram: { ideal: [5, 8], outer: [2, 12] },
  Threads: { ideal: [4, 7], outer: [2, 10] },
  Telegram: { ideal: [4, 9], outer: [2, 14] },
  X: { ideal: [2, 4], outer: [1, 8] },
};

const TEXT_BANDS: Record<InsightPlatform, { ideal: [number, number]; outer: [number, number] }> = {
  Instagram: { ideal: [40, 110], outer: [12, 220] },
  Threads: { ideal: [60, 160], outer: [20, 280] },
  Telegram: { ideal: [90, 260], outer: [30, 420] },
  X: { ideal: [30, 120], outer: [10, 200] },
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function fitZone(zone: AttentionZone, ratio: RatioKey): AttentionZone {
  if (ratio === "9:16") {
    return { ...zone, y: clamp(0.16 + zone.y * 0.62, 0.12, 0.9) };
  }
  if (ratio === "16:9") {
    return {
      ...zone,
      x: clamp(0.06 + zone.x * 0.72, 0.08, 0.92),
      y: clamp(0.5 + (zone.y - 0.5) * 0.55, 0.12, 0.88),
    };
  }
  return zone;
}

/** Typical first-look zones for a platform, nudged for the slide shape. */
export function attentionZones(platform: InsightPlatform, ratio: RatioKey): AttentionZone[] {
  return ZONES[platform].map((zone) => fitZone(zone, ratio));
}

function bandScore(value: number, ideal: [number, number], outer: [number, number]) {
  const [idealMin, idealMax] = ideal;
  const [outerMin, outerMax] = outer;
  if (value >= idealMin && value <= idealMax) return 100;
  if (value >= outerMin && value < idealMin) {
    return 40 + ((value - outerMin) / (idealMin - outerMin)) * 60;
  }
  if (value > idealMax && value <= outerMax) {
    return 100 - ((value - idealMax) / (outerMax - idealMax)) * 60;
  }
  return 22;
}

function parseColor(value: string): [number, number, number] | null {
  const raw = value.trim();
  const rgb = raw.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  let hex = raw.startsWith("#") ? raw.slice(1) : "";
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const n = Number.parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number]) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

/** WCAG contrast ratio, or null when a color cannot be read. */
export function contrastRatio(a: string, b: string): number | null {
  const left = parseColor(a);
  const right = parseColor(b);
  if (!left || !right) return null;
  const lighter = Math.max(luminance(left), luminance(right));
  const darker = Math.min(luminance(left), luminance(right));
  return (lighter + 0.05) / (darker + 0.05);
}

function pushColors(value: unknown, into: string[]) {
  if (typeof value === "string") {
    into.push(value);
    return;
  }
  if (!value || typeof value !== "object" || !("colorStops" in value)) return;
  const stops = (value as { colorStops?: { color?: unknown }[] }).colorStops ?? [];
  for (const stop of stops) {
    if (typeof stop?.color === "string") into.push(stop.color);
  }
}

function backgroundOf(background: unknown, backgroundImage: unknown) {
  const colors: string[] = [];
  let patterned = false;

  const take = (value: unknown) => {
    if (value == null) return;
    if (typeof value === "string") {
      if (/^(data:|https?:|blob:)/i.test(value)) patterned = true;
      else colors.push(value);
      return;
    }
    if (typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.colorStops) || (record.fill && typeof record.fill === "object" && "colorStops" in (record.fill as object))) {
      pushColors(record.colorStops ? record : record.fill, colors);
      return;
    }
    if (typeof record.fill === "string") {
      colors.push(record.fill);
      return;
    }
    if ("source" in record || record.type === "pattern" || record.type === "image") patterned = true;
  };

  take(background);
  take(backgroundImage);
  return { colors, patterned };
}

function childObjects(obj: ReadableObject): ReadableObject[] {
  if (typeof obj.getObjects === "function") return obj.getObjects();
  return Array.isArray(obj.objects) ? obj.objects : [];
}

function collectText(objects: ReadableObject[], texts: string[], colors: string[]) {
  for (const obj of objects) {
    const type = String(obj.type ?? "").toLowerCase();
    if (TEXT_TYPES.has(type) && typeof obj.text === "string" && !skipsInsightText(obj.swibpRole)) {
      const text = obj.text.trim();
      if (text) texts.push(text);
      pushColors(obj.fill, colors);
    }
    collectText(childObjects(obj), texts, colors);
  }
}

function asReadable(value: unknown): ReadableObject | null {
  if (!value || typeof value !== "object") return null;
  return value as ReadableObject;
}

/** Text length and colors from a slide, skipping numbers, handles, and swipe labels. */
export function signalsFromSlide(input: {
  objects: unknown[];
  background?: unknown;
  backgroundImage?: unknown;
}): SlideSignals {
  const texts: string[] = [];
  const textColors: string[] = [];
  collectText(
    input.objects.flatMap((object) => {
      const readable = asReadable(object);
      return readable ? [readable] : [];
    }),
    texts,
    textColors,
  );
  const { colors, patterned } = backgroundOf(input.background, input.backgroundImage);
  return {
    characters: texts.reduce((sum, text) => sum + text.length, 0),
    textColors,
    backgrounds: colors.length > 0 ? colors : patterned ? [] : ["#ffffff"],
    patterned,
  };
}

function slideNote(platform: InsightPlatform, count: number) {
  const [min, max] = SLIDE_BANDS[platform].ideal;
  const noun = count === 1 ? "1 slide" : `${count} slides`;
  if (count < min) return `${noun} · short`;
  if (count > max) return `${noun} · long`;
  return noun;
}

export function textLengthStatus(platform: InsightPlatform, characters: number): {
  characters: number;
  limit: number;
  tooLong: boolean;
} {
  const limit = TEXT_BANDS[platform].ideal[1];
  return { characters, limit, tooLong: characters > limit };
}

/** Inspector copy: the count, and which block to shorten when it is past the format. */
export function textLengthNote(platform: InsightPlatform, characters: number): string {
  const { limit, tooLong } = textLengthStatus(platform, characters);
  if (tooLong) return `${characters} characters · shorten this block to ${limit}`;
  return `${characters} / ${limit}`;
}

export type LongTextBlock = {
  preview: string;
  characters: number;
  limit: number;
};

function previewText(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= 48) return flat;
  return `${flat.slice(0, 47)}…`;
}

/** Body blocks that are past the platform's readable length. Skips numbers, handles, and swipe labels. */
export function longTextBlocks(objects: unknown[], platform: InsightPlatform): LongTextBlock[] {
  const limit = TEXT_BANDS[platform].ideal[1];
  const blocks: LongTextBlock[] = [];
  const walk = (list: unknown[]) => {
    for (const value of list) {
      const obj = asReadable(value);
      if (!obj) continue;
      const type = String(obj.type ?? "").toLowerCase();
      if (TEXT_TYPES.has(type) && typeof obj.text === "string" && !skipsInsightText(obj.swibpRole)) {
        const characters = obj.text.trim().length;
        if (characters > limit) {
          blocks.push({ preview: previewText(obj.text), characters, limit });
        }
      }
      walk(childObjects(obj));
    }
  };
  walk(objects);
  return blocks;
}

function textNote(platform: InsightPlatform, average: number) {
  const [min, max] = TEXT_BANDS[platform].ideal;
  const shown = Math.round(average);
  if (average < min) return `${shown} chars · short`;
  if (average > max) return `${shown} chars · long`;
  return `${shown} chars`;
}

function contrastNote(signals: SlideSignals[]) {
  const ratios: number[] = [];
  let patterned = false;
  for (const slide of signals) {
    if (slide.patterned && slide.backgrounds.length === 0) patterned = true;
    for (const ink of slide.textColors) {
      const options = slide.backgrounds
        .map((ground) => contrastRatio(ink, ground))
        .filter((ratio): ratio is number => ratio != null);
      if (options.length > 0) ratios.push(Math.min(...options));
    }
  }
  if (ratios.length === 0) {
    return { score: 50, note: patterned ? "Pattern" : "No text" };
  }
  const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  if (average >= 7) return { score: 100, note: "Clear" };
  if (average >= 4.5) return { score: 85, note: "Clear" };
  if (average >= 3) return { score: 55, note: "Soft" };
  return { score: 20, note: "Low contrast" };
}

/** Estimate before publishing, from slide count, text length, and contrast. */
export function scoreEngagement(platform: InsightPlatform, slides: SlideSignals[]): EngagementReport {
  const count = Math.max(slides.length, 1);
  const averageChars = slides.reduce((sum, slide) => sum + slide.characters, 0) / count;
  const slidesScore = bandScore(count, SLIDE_BANDS[platform].ideal, SLIDE_BANDS[platform].outer);
  const textScore = bandScore(averageChars, TEXT_BANDS[platform].ideal, TEXT_BANDS[platform].outer);
  const contrast = contrastNote(slides);
  const score = Math.round((slidesScore + textScore + contrast.score) / 3);
  const label = score >= 75 ? "Strong" : score >= 50 ? "Steady" : "Low";
  return {
    score,
    label,
    notes: [slideNote(platform, count), textNote(platform, averageChars), contrast.note],
  };
}
