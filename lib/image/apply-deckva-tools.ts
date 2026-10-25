import { Image as FabricImage, Point, util, type FabricObject } from "fabric";

import type { CanvasManager } from "@/lib/canvas/manager";
import type { MagicLayer, MagicLayerResult } from "@/lib/image/deckva-tools";

function isFabricImage(obj: FabricObject | null | undefined): obj is FabricImage {
  return Boolean(obj && obj.type === "image" && typeof (obj as FabricImage).setSrc === "function");
}

function layerSrc(layer: MagicLayer): string {
  if (layer.data_url) return layer.data_url;
  if (layer.url) return layer.url;
  throw new Error(`Layer "${layer.name}" has no image data`);
}

function mapSourcePoint(img: FabricImage, x: number, y: number): Point {
  const local = new Point(x - (img.width || 0) / 2, y - (img.height || 0) / 2);
  return util.transformPoint(local, img.calcTransformMatrix());
}

export function getActiveImageSource(img: FabricImage): string {
  if (typeof img.getSrc === "function") {
    const src = img.getSrc();
    if (src) return src;
  }
  const element = img.getElement?.();
  if (element && "src" in element && typeof element.src === "string" && element.src) {
    return element.src;
  }
  throw new Error("No image source");
}

/** Replace pixels in place; optionally keep the on-canvas visual size after a resolution change. */
export async function replaceImageSource(
  manager: CanvasManager,
  img: FabricImage,
  newSrc: string,
  options?: { keepVisualSize?: boolean },
): Promise<void> {
  const prevW = (img.width || 1) * (img.scaleX || 1);
  const prevH = (img.height || 1) * (img.scaleY || 1);

  await manager.runBatched(async () => {
    await img.setSrc(newSrc, { crossOrigin: "anonymous" });
    if (options?.keepVisualSize) {
      img.set({
        scaleX: prevW / (img.width || 1),
        scaleY: prevH / (img.height || 1),
      });
    }
    img.setCoords();
  });
}

/** Replace the selected image with a punched background and add foreground elements as layers. */
export async function applyMagicLayers(
  manager: CanvasManager,
  img: FabricImage,
  result: MagicLayerResult,
): Promise<void> {
  const background = result.layers.find((layer) => layer.name === "background") ?? result.layers[0];
  const elements = result.layers.filter((layer) => layer !== background);

  await manager.runBatched(async () => {
    await img.setSrc(layerSrc(background), { crossOrigin: "anonymous" });
    img.set({ swibpName: "Background" } as Partial<FabricObject>);
    img.setCoords();

    for (const layer of elements) {
      const src = layerSrc(layer);
      const placed = await FabricImage.fromURL(
        src,
        /^https?:\/\//i.test(src) ? { crossOrigin: "anonymous" } : undefined,
      );
      const center = mapSourcePoint(
        img,
        layer.left + layer.width / 2,
        layer.top + layer.height / 2,
      );
      placed.set({
        left: center.x,
        top: center.y,
        originX: "center",
        originY: "center",
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        angle: img.angle,
        flipX: img.flipX,
        flipY: img.flipY,
        swibpName: layer.name.replace(/_/g, " "),
      } as Partial<FabricObject>);
      manager.canvas.add(placed);
    }

    manager.canvas.setActiveObject(img);
  });
}

export function requireActiveImage(manager: CanvasManager | null): FabricImage {
  const active = manager?.getActiveObject() ?? null;
  if (!isFabricImage(active)) throw new Error("Select an image first");
  return active;
}
