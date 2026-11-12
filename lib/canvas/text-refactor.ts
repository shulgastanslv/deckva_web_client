import type { FabricObject } from "fabric";
import {
  getSceneBoundingRect,
  isObjectOutOfBounds,
  PLACE_PADDING,
} from "@/lib/canvas/auto-flow";
import { relayoutText } from "@/lib/canvas/paint-live";
import { bakeTextboxScale, isTextbox, setTextResizeMode } from "@/lib/canvas/text-fit";

/** Soft+hard cap for slide text blocks in the editor. */
export const TEXT_CONTENT_MAX = 800;

export type TextRefactorKind =
  | "clean"
  | "sentence"
  | "title"
  | "lower"
  | "upper"
  | "tighten"
  | "paragraphs";

export const TEXT_REFACTOR_KINDS: { id: TextRefactorKind; labelKey: string }[] = [
  { id: "paragraphs", labelKey: "refactorParagraphs" },
  { id: "clean", labelKey: "refactorClean" },
  { id: "sentence", labelKey: "refactorSentence" },
  { id: "title", labelKey: "refactorTitle" },
  { id: "lower", labelKey: "refactorLower" },
  { id: "upper", labelKey: "refactorUpper" },
  { id: "tighten", labelKey: "refactorTighten" },
];

export function clampTextContent(text: string, max = TEXT_CONTENT_MAX): string {
  if (text.length <= max) return text;
  return text.slice(0, max);
}

function sentenceCase(value: string): string {
  const lower = value.toLocaleLowerCase();
  return lower.replace(/(^\s*\p{L})|([.!?…]\s+\p{L})/gu, (chunk) => chunk.toLocaleUpperCase());
}

function titleCase(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/(^|[\s([{«"'])(\p{L})/gu, (_, edge: string, letter: string) =>
      `${edge}${letter.toLocaleUpperCase()}`,
    );
}

/**
 * Soft paragraph breaks only — Fabric Textbox wraps words inside `width`.
 * Avoid hard mid-line wraps that fight the box and crop glyphs.
 */
export function splitIntoParagraphs(text: string): string {
  const raw = text.replace(/\r\n/g, "\n").trim();
  if (!raw) return "";

  if (/\n/.test(raw)) {
    return clampTextContent(
      raw
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim(),
    );
  }

  const flat = raw.replace(/\s+/g, " ").trim();

  const sentences = flat
    .split(/(?<=[.!?…])\s+(?=\S)/u)
    .map((p) => p.trim())
    .filter(Boolean);
  if (sentences.length > 1) {
    return clampTextContent(sentences.join("\n\n"));
  }

  const clauses = flat
    .split(/(?<=[,;—–])\s+/u)
    .map((p) => p.trim())
    .filter(Boolean);
  if (clauses.length > 1) {
    // Soft paragraph gaps — Textbox still wraps each clause inside `width`.
    return clampTextContent(clauses.join("\n\n"));
  }

  // One long phrase — keep a single paragraph; width wrapping handles the rest.
  return clampTextContent(flat);
}

/** Local text cleanups — no network. */
export function refactorText(text: string, kind: TextRefactorKind): string {
  if (kind === "paragraphs") return splitIntoParagraphs(text);

  const base = text.replace(/\r\n/g, "\n");

  let next = base;
  switch (kind) {
    case "clean":
      next = base
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+$/gm, "")
        .trim();
      break;
    case "sentence":
      next = sentenceCase(
        base
          .replace(/[ \t]{2,}/g, " ")
          .replace(/\s+\n/g, "\n")
          .trim(),
      );
      break;
    case "title":
      next = titleCase(base.replace(/[ \t]{2,}/g, " ").trim());
      break;
    case "lower":
      next = base.toLocaleLowerCase();
      break;
    case "upper":
      next = base.toLocaleUpperCase();
      break;
    case "tighten":
      next = base
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+([,.;:!?…])/g, "$1")
        .replace(/([([{«])\s+/g, "$1")
        .replace(/\s+([)\]}»])/g, "$1")
        .replace(/\s+—\s+/g, " — ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      break;
  }

  return clampTextContent(next);
}

type TextNode = FabricObject & {
  text?: string;
  styles?: unknown;
  left?: number;
  top?: number;
  width?: number;
  textAlign?: string;
  originX?: string;
  originY?: string;
  scaleX?: number;
  scaleY?: number;
  dynamicMinWidth?: number;
  initDimensions?: () => void;
  setCoords?: () => void;
};

/** Pin origin to top-left using the current visual bounds (safe for center-origin CORA text). */
function pinOriginTopLeft(node: TextNode) {
  // Bake scale first so width matches the visual box before we read bounds.
  if (isTextbox(node)) bakeTextboxScale(node);

  const rect = getSceneBoundingRect(node);
  node.set({
    originX: "left",
    originY: "top",
    left: rect.left,
    top: rect.top,
  });
  // Keep scale at 1 — never reset scale without baking (that desyncs wrap width).
  if (Math.abs((Number(node.scaleX) || 1) - 1) > 1e-4 || Math.abs((Number(node.scaleY) || 1) - 1) > 1e-4) {
    bakeTextboxScale(node);
  }
  node.setCoords?.();
  return getSceneBoundingRect(node);
}

/** Keep the text frame fully inside the slide so the canvas edge cannot clip glyphs. */
function clampTextboxToSlide(node: TextNode, slideW: number, padding: number) {
  const maxRight = slideW - padding;
  const usable = Math.max(80, slideW - padding * 2);

  let left = Number(node.left) || padding;
  let width = Math.max(80, Number(node.width) || 80);

  if (left < padding) left = padding;
  if (left + width > maxRight) {
    width = Math.max(80, maxRight - left);
  }
  if (width > usable) width = usable;
  if (left + width > maxRight) {
    left = Math.max(padding, maxRight - width);
  }

  node.set({
    left,
    width,
    originX: "left",
    originY: "top",
    scaleX: 1,
    scaleY: 1,
  });
  relayoutText(node, { maxWidth: Math.max(80, maxRight - left) });

  // Longest unbreakable token may force Fabric past our width — shift left to keep on-slide.
  const after = getSceneBoundingRect(node);
  if (after.left + after.width > maxRight + 0.5) {
    const overflow = after.left + after.width - maxRight;
    const nextWidth = Math.max(80, (Number(node.width) || after.width) - overflow);
    const nextLeft = Math.max(padding, maxRight - nextWidth);
    node.set({ width: nextWidth, left: nextLeft, scaleX: 1, scaleY: 1 });
    relayoutText(node, { maxWidth: nextWidth });
  }

  const again = getSceneBoundingRect(node);
  if (again.left < padding - 0.5) {
    node.set({ left: (Number(node.left) || 0) + (padding - again.left) });
  }
  if (again.left + again.width > maxRight + 0.5) {
    node.set({
      left: (Number(node.left) || 0) - (again.left + again.width - maxRight),
    });
  }
  node.setCoords?.();
}

/**
 * Split overflowing / long text into paragraphs, align left, and shrink width
 * to the remaining slide space so the block fits without mid-glyph cropping.
 */
export function applyParagraphFit(
  obj: FabricObject,
  slideW: number,
  options?: { padding?: number; force?: boolean },
): boolean {
  const node = obj as TextNode;
  const text = node.text ?? "";
  if (!text.trim()) return false;

  const padding = options?.padding ?? PLACE_PADDING;
  const overflows = isObjectOutOfBounds(obj, slideW, Number.POSITIVE_INFINITY, 0);
  if (!options?.force && !overflows && !/\n/.test(text) && text.length < 48) {
    const rect = getSceneBoundingRect(obj);
    if (rect.left + rect.width <= slideW + 1) return false;
  }

  pinOriginTopLeft(node);

  const usable = Math.max(160, slideW - padding * 2);
  let left = Math.max(padding, Math.min(Number(node.left) || padding, slideW - padding - 160));
  let width = Math.max(160, slideW - padding - left);
  width = Math.min(width, usable);

  const nextText = splitIntoParagraphs(text);

  node.set({
    text: nextText,
    textAlign: "left",
    width,
    left,
    originX: "left",
    originY: "top",
    scaleX: 1,
    scaleY: 1,
  });

  if (isTextbox(node)) {
    setTextResizeMode(node, "auto-height");
  }

  relayoutText(node, { maxWidth: width });
  clampTextboxToSlide(node, slideW, padding);
  return true;
}
