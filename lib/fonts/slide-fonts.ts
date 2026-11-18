"use client";

import {
  loadGoogleFont,
  normalizeFontFamily,
} from "@/lib/fonts/google-fonts";
import type { FabricCanvasJSON } from "@/lib/types";

const TEXT_TYPES = new Set(["text", "i-text", "textbox"]);

function visit(
  value: unknown,
  onNode: (node: Record<string, unknown>) => void,
): void {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, onNode);
    return;
  }
  if (!value || typeof value !== "object") return;
  const node = value as Record<string, unknown>;
  onNode(node);
  if (Array.isArray(node.objects)) visit(node.objects, onNode);
}

/** Collect unique Google/system font families from Fabric slide JSON. */
export function collectSlideFontFamilies(
  slides: FabricCanvasJSON[],
): string[] {
  const families = new Set<string>();
  for (const slide of slides) {
    visit(slide.objects ?? [], (node) => {
      const type = String(node.type ?? "").toLowerCase();
      if (!TEXT_TYPES.has(type)) return;
      const family = normalizeFontFamily(
        typeof node.fontFamily === "string" ? node.fontFamily : null,
      );
      if (family) families.add(family);
    });
  }
  return Array.from(families);
}

/** Preload every face referenced by the slides before Fabric measures text. */
export async function preloadSlideFonts(
  slides: FabricCanvasJSON[],
): Promise<void> {
  if (typeof document === "undefined") return;
  const families = collectSlideFontFamilies(slides);
  if (families.length === 0) return;
  await Promise.all(
    families.map((family) => loadGoogleFont(family).catch(() => undefined)),
  );
}

/** Preload faces found on a live Fabric canvas (after loadFromJSON). */
export async function preloadCanvasFonts(canvas: {
  getObjects(): Array<{ type?: string; fontFamily?: string; getObjects?: () => unknown[] }>;
}): Promise<void> {
  if (typeof document === "undefined") return;
  const families = new Set<string>();
  const walk = (obj: {
    type?: string;
    fontFamily?: string;
    getObjects?: () => unknown[];
  }) => {
    const type = String(obj.type ?? "").toLowerCase();
    if (TEXT_TYPES.has(type) && obj.fontFamily) {
      families.add(normalizeFontFamily(obj.fontFamily));
    }
    if (typeof obj.getObjects === "function") {
      for (const child of obj.getObjects()) {
        walk(child as typeof obj);
      }
    }
  };
  for (const obj of canvas.getObjects()) walk(obj);
  if (families.size === 0) return;
  await Promise.all(
    Array.from(families).map((family) =>
      loadGoogleFont(family).catch(() => undefined),
    ),
  );
}
