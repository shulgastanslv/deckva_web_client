import { cache, type Canvas, type FabricObject } from "fabric";
import type { PaletteSlot, TextStyleDef, TextStyleId } from "@/lib/canvas/document";
import { relayoutText } from "@/lib/canvas/text-fit";

export { relayoutText } from "@/lib/canvas/text-fit";

type Tagged = FabricObject & {
  swibpSlot?: string;
  swibpStyle?: string;
  fontFamily?: string;
};

function visit(obj: FabricObject, fn: (node: Tagged) => void): void {
  const node = obj as Tagged & { getObjects?: () => FabricObject[] };
  fn(node);
  if (typeof node.getObjects === "function") {
    for (const child of node.getObjects()) visit(child, fn);
  }
}

export function paintSlotOnCanvas(canvas: Canvas, slot: PaletteSlot, color: string): void {
  for (const obj of canvas.getObjects()) {
    visit(obj, (node) => {
      if (node.swibpSlot === slot) node.set({ fill: color });
    });
  }
  canvas.requestRenderAll();
}

const TEXT_TYPES = new Set(["text", "i-text", "textbox"]);

/**
 * Fabric caches char widths per fontFamily. If text was measured before the
 * real face loaded, that cache stays wrong forever — wrap thinks lines fit,
 * glyphs paint wider, objectCaching clips mid-character at the box edge.
 */
export function clearTextFontCache(fontFamily?: string): void {
  if (fontFamily) cache.clearFontCache(fontFamily);
  else cache.clearFontCache();
}

/** Drops Fabric's measured text cache and paints with the faces that are loaded now. */
export function refreshCanvasFonts(canvas: Canvas): void {
  const families = new Set<string>();
  for (const obj of canvas.getObjects()) {
    visit(obj, (node) => {
      const type = (node.type || "").toLowerCase();
      if (!TEXT_TYPES.has(type)) return;
      if (node.fontFamily) families.add(node.fontFamily);
    });
  }
  if (families.size === 0) {
    clearTextFontCache();
  } else {
    for (const family of families) clearTextFontCache(family);
  }
  for (const obj of canvas.getObjects()) {
    visit(obj, (node) => {
      const type = (node.type || "").toLowerCase();
      if (!TEXT_TYPES.has(type)) return;
      relayoutText(node);
    });
  }
  canvas.renderAll();
}

/** Repaints every text object on the open slide with one typeface. */
export function applyFontOnCanvas(canvas: Canvas, fontFamily: string): void {
  clearTextFontCache(fontFamily);
  for (const obj of canvas.getObjects()) {
    visit(obj, (node) => {
      const type = (node.type || "").toLowerCase();
      if (!TEXT_TYPES.has(type)) return;
      node.set({ fontFamily });
      relayoutText(node);
    });
  }
  canvas.renderAll();
}

export function applyStyleOnCanvas(
  canvas: Canvas,
  styleId: TextStyleId,
  style: TextStyleDef,
): void {
  clearTextFontCache(style.fontFamily);
  for (const obj of canvas.getObjects()) {
    visit(obj, (node) => {
      if (node.swibpStyle !== styleId) return;
      node.set({
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
      });
      relayoutText(node);
    });
  }
  canvas.renderAll();
}
