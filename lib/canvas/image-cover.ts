import { Rect, type FabricImage, type FabricObject, type TCrossOrigin } from "fabric";
import { largestWindow, placeWindow, windowAtZoom } from "./crop";
import { maskKind, refreshMask } from "./object-appearance";

export type CoverFit = {
  cropX: number;
  cropY: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
};

export type SourceFocus = { x: number; y: number };

type CropFields = {
  cropX?: number;
  cropY?: number;
  rx?: number;
  getOriginalSize?: () => { width: number; height: number };
};

function asCrop(img: FabricObject): FabricObject & CropFields {
  return img as FabricObject & CropFields;
}

/** Display size of an object on the canvas (ignores flip sign). */
export function frameSizeOf(obj: FabricObject): { w: number; h: number } {
  return {
    w: Math.max(1, Math.abs((obj.width || 1) * (obj.scaleX || 1))),
    h: Math.max(1, Math.abs((obj.height || 1) * (obj.scaleY || 1))),
  };
}

/** Natural bitmap size for a Fabric image. */
export function naturalSizeOf(img: FabricObject): { w: number; h: number } {
  const cropped = asCrop(img);
  const original = cropped.getOriginalSize?.();
  const w = original?.width || img.width || 1;
  const h = original?.height || img.height || 1;
  return { w: Math.max(1, w), h: Math.max(1, h) };
}

/** Center of the current crop window in source pixels. */
export function cropFocusOf(img: FabricObject): SourceFocus {
  const cropped = asCrop(img);
  const natural = naturalSizeOf(img);
  const cropX = cropped.cropX || 0;
  const cropY = cropped.cropY || 0;
  const width = img.width || natural.w;
  const height = img.height || natural.h;
  return {
    x: cropX + width / 2,
    y: cropY + height / 2,
  };
}

/**
 * How far the user has zoomed past object-fit:cover (1 = exact cover).
 * Used so resizing a frame keeps the same crop zoom.
 */
export function coverZoomOf(img: FabricObject): number {
  const natural = naturalSizeOf(img);
  const frame = frameSizeOf(img);
  const cover = largestWindow(natural.w, natural.h, frame.w / frame.h);
  const cropW = Math.max(1, img.width || cover.width);
  return Math.max(1, cover.width / cropW);
}

/**
 * Figma-style Fill: largest source window that covers `frame`, placed on `focus`.
 * `zoom > 1` zooms in (smaller window) while staying cover-clamped.
 */
export function coverFit(
  naturalW: number,
  naturalH: number,
  frameW: number,
  frameH: number,
  options?: { focus?: SourceFocus; zoom?: number },
): CoverFit {
  const fw = Math.max(1, frameW);
  const fh = Math.max(1, frameH);
  const nw = Math.max(1, naturalW);
  const nh = Math.max(1, naturalH);
  const cover = largestWindow(nw, nh, fw / fh);
  const zoom = Math.max(1, options?.zoom ?? 1);
  const window = windowAtZoom(cover, zoom);
  const focus = options?.focus ?? { x: nw / 2, y: nh / 2 };
  const placed = placeWindow(focus.x, focus.y, window.width, window.height, nw, nh);
  const scale = fw / placed.width;
  return {
    cropX: placed.cropX,
    cropY: placed.cropY,
    width: placed.width,
    height: placed.height,
    scaleX: scale,
    scaleY: scale,
  };
}

/** Apply cover-fit props onto a Fabric image; keeps center / angle / flips. */
export function applyCoverFit(
  img: FabricObject,
  frameW: number,
  frameH: number,
  options?: { focus?: SourceFocus; zoom?: number },
): CoverFit {
  const prevW = Math.max(1, img.width || 1);
  const prevH = Math.max(1, img.height || 1);
  const natural = naturalSizeOf(img);
  const fit = coverFit(natural.w, natural.h, frameW, frameH, options);
  const signX = Math.sign(img.scaleX || 1) || 1;
  const signY = Math.sign(img.scaleY || 1) || 1;

  img.set({
    cropX: fit.cropX,
    cropY: fit.cropY,
    width: fit.width,
    height: fit.height,
    scaleX: fit.scaleX * signX,
    scaleY: fit.scaleY * signY,
    dirty: true,
  });
  syncImageClip(img, prevW, prevH);
  img.setCoords();
  return fit;
}

/**
 * After the user resizes an image frame: keep zoom + focus, recompute cover
 * so the photo never stretches (Figma Fill behavior).
 */
export function reflowImageCover(img: FabricObject): boolean {
  if (img.type !== "image") return false;
  if (typeof asCrop(img).getOriginalSize !== "function") return false;

  const frame = frameSizeOf(img);
  const focus = cropFocusOf(img);
  const zoom = coverZoomOf(img);
  const cropped = asCrop(img);
  const before = {
    cropX: cropped.cropX || 0,
    cropY: cropped.cropY || 0,
    width: img.width || 0,
    height: img.height || 0,
    scaleX: img.scaleX || 1,
    scaleY: img.scaleY || 1,
  };
  const fit = applyCoverFit(img, frame.w, frame.h, { focus, zoom });

  return (
    Math.abs(fit.cropX - before.cropX) > 0.05 ||
    Math.abs(fit.cropY - before.cropY) > 0.05 ||
    Math.abs(fit.width - before.width) > 0.05 ||
    Math.abs(fit.height - before.height) > 0.05 ||
    Math.abs(Math.abs(fit.scaleX) - Math.abs(before.scaleX)) > 0.0001 ||
    Math.abs(Math.abs(fit.scaleY) - Math.abs(before.scaleY)) > 0.0001
  );
}

/**
 * Replace pixels and cover-fit into the previous on-canvas frame
 * (Figma: drop a new image into the same frame).
 */
export async function replaceImageCover(
  img: FabricImage,
  source: string,
  options?: { crossOrigin?: TCrossOrigin },
): Promise<void> {
  const frame = frameSizeOf(img);
  const center = img.getCenterPoint();
  const angle = img.angle || 0;
  const flipX = Boolean(img.flipX);
  const flipY = Boolean(img.flipY);
  const originX = img.originX;
  const originY = img.originY;

  await img.setSrc(source, {
    crossOrigin: options?.crossOrigin ?? "anonymous",
  });

  img.set({
    originX: "center",
    originY: "center",
    left: center.x,
    top: center.y,
    angle,
    flipX,
    flipY,
    // Reset crop so naturalSizeOf / coverFit see the full bitmap.
    cropX: 0,
    cropY: 0,
  });

  applyCoverFit(img, frame.w, frame.h);

  // Restore caller's origin if it wasn't center (place still at same center).
  if (originX !== "center" || originY !== "center") {
    img.set({ originX, originY });
    img.setPositionByOrigin(center, "center", "center");
    img.setCoords();
  }
}

/**
 * Keep circle / rounded / corner-radius / shape clips matched to the crop window.
 * `prevW/H` are the crop-window size before the latest cover write.
 */
export function syncImageClip(
  img: FabricObject,
  prevW = Math.max(1, img.width || 1),
  prevH = Math.max(1, img.height || 1),
): void {
  const kind = maskKind(img as FabricObject & { swibpMask?: unknown });
  if (kind !== "none") {
    refreshMask(img);
    return;
  }

  const radius = Number(asCrop(img).rx) || 0;
  if (radius > 0) {
    img.clipPath = new Rect({
      width: Math.max(1, img.width || 1),
      height: Math.max(1, img.height || 1),
      rx: radius,
      ry: radius,
      originX: "center",
      originY: "center",
      left: 0,
      top: 0,
    });
    img.dirty = true;
    return;
  }

  const clip = img.clipPath as FabricObject | undefined;
  if (!clip || clip.absolutePositioned) return;

  const nextW = Math.max(1, img.width || 1);
  const nextH = Math.max(1, img.height || 1);
  if (Math.abs(nextW - prevW) < 0.01 && Math.abs(nextH - prevH) < 0.01) return;

  clip.set({
    scaleX: (clip.scaleX || 1) * (nextW / prevW),
    scaleY: (clip.scaleY || 1) * (nextH / prevH),
    dirty: true,
  });
  img.dirty = true;
}
