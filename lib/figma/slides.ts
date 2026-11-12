import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";

import { withRemoteImageCors } from "@/lib/canvas/image-cors";
import {
  CANVAS_RATIOS,
  type FabricCanvasJSON,
  type RatioKey,
} from "@/lib/types";

/** Pick the canvas ratio closest to the Figma frame aspect. */
export function closestRatio(width: number, height: number): RatioKey {
  const target = width / Math.max(height, 1);
  let best: RatioKey = "1:1";
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const [key, size] of Object.entries(CANVAS_RATIOS) as Array<
    [RatioKey, { width: number; height: number }]
  >) {
    const ratio = size.width / size.height;
    const delta = Math.abs(ratio - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = key;
    }
  }
  return best;
}

/**
 * Build a Fabric slide JSON with the Figma export covering the canvas
 * (object-cover). Runs in the browser.
 */
export async function buildSlideFromImageDataUrl(
  dataUrl: string,
  size: { width: number; height: number },
): Promise<FabricCanvasJSON> {
  const el = document.createElement("canvas");
  el.width = size.width;
  el.height = size.height;

  const canvas = new FabricCanvas(el, {
    width: size.width,
    height: size.height,
    renderOnAddRemove: false,
    enableRetinaScaling: false,
  });

  try {
    const img = await FabricImage.fromURL(dataUrl);
    const iw = img.width || 1;
    const ih = img.height || 1;
    const scale = Math.max(size.width / iw, size.height / ih);
    img.set({
      left: (size.width - iw * scale) / 2,
      top: (size.height - ih * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      originX: "left",
      originY: "top",
      selectable: true,
      evented: true,
    });
    canvas.backgroundColor = "#ffffff";
    canvas.add(img);
    canvas.requestRenderAll();
    return withRemoteImageCors(canvas.toJSON() as FabricCanvasJSON);
  } finally {
    canvas.dispose();
  }
}

export function majorityRatio(
  frames: Array<{ width: number; height: number }>,
): RatioKey {
  if (frames.length === 0) return "1:1";
  const counts = new Map<RatioKey, number>();
  for (const frame of frames) {
    const key = closestRatio(frame.width, frame.height);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: RatioKey = "1:1";
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}
