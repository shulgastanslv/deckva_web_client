"use client";

import type { FabricCanvasJSON } from "@/lib/types";

type ImageNode = Record<string, unknown> & {
  type?: string;
  src?: string;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  cropX?: number;
  cropY?: number;
  swibpRole?: string;
  objects?: unknown[];
};

function isImageNode(node: Record<string, unknown>): node is ImageNode {
  return String(node.type ?? "").toLowerCase() === "image";
}

/** Skip device frames / icons — only photo slots from CORA. */
function shouldCoverFit(node: ImageNode): boolean {
  if (typeof node.src !== "string" || !node.src.trim()) return false;
  const role = String(node.swibpRole ?? "");
  if (role === "frame" || role === "handle" || role === "swipe") return false;
  return true;
}

function probeImageSize(
  src: string,
): Promise<{ width: number; height: number } | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new window.Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      const width = img.naturalWidth || img.width || 0;
      const height = img.naturalHeight || img.height || 0;
      resolve(width > 0 && height > 0 ? { width, height } : null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Object-fit: cover for a Fabric Image JSON node.
 * Keeps the authored display frame (width×scaleX × height×scaleY) and
 * recenters the crop window over the natural photo.
 */
export function applyCoverFitToImageNode(
  node: ImageNode,
  naturalW: number,
  naturalH: number,
): void {
  if (naturalW <= 0 || naturalH <= 0) return;

  const scaleX = Number(node.scaleX) || 1;
  const scaleY = Number(node.scaleY) || 1;
  const frameW = Math.max(1, Math.abs(Number(node.width) * scaleX) || 1);
  const frameH = Math.max(1, Math.abs(Number(node.height) * scaleY) || 1);

  const coverScale = Math.max(frameW / naturalW, frameH / naturalH);
  if (!Number.isFinite(coverScale) || coverScale <= 0) return;

  const cropW = frameW / coverScale;
  const cropH = frameH / coverScale;

  node.cropX = Math.max(0, (naturalW - cropW) / 2);
  node.cropY = Math.max(0, (naturalH - cropH) / 2);
  node.width = cropW;
  node.height = cropH;
  node.scaleX = coverScale * Math.sign(scaleX || 1);
  node.scaleY = coverScale * Math.sign(scaleY || 1);
}

async function visitObjects(objects: unknown[]): Promise<void> {
  await Promise.all(
    objects.map(async (item) => {
      if (!item || typeof item !== "object") return;
      const node = item as Record<string, unknown>;
      if (Array.isArray(node.objects)) {
        await visitObjects(node.objects);
      }
      if (!isImageNode(node) || !shouldCoverFit(node)) return;
      const size = await probeImageSize(node.src!);
      if (!size) return;
      applyCoverFitToImageNode(node, size.width, size.height);
    }),
  );
}

/** Mutates a copy of each slide so CORA photos use object-fit: cover. */
export async function normalizeCoverImages(
  slides: FabricCanvasJSON[],
): Promise<FabricCanvasJSON[]> {
  if (typeof window === "undefined") return slides;

  const next = slides.map(
    (slide) =>
      structuredClone(slide) as FabricCanvasJSON,
  );

  await Promise.all(
    next.map(async (slide) => {
      if (!Array.isArray(slide.objects)) return;
      await visitObjects(slide.objects);
    }),
  );

  return next;
}
