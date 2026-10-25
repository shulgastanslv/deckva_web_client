"use client";

import { useCallback, useState } from "react";
import type { FabricImage } from "fabric";

import { useCanvasManager } from "@/context/canvas-manager";
import {
  applyMagicLayers,
  getActiveImageSource,
  replaceImageSource,
} from "@/lib/image/apply-deckva-tools";
import {
  magicLayerImage,
  removeImageBackground,
  upscaleImage,
  type UpscaleScale,
} from "@/lib/image/deckva-tools";
import { useCanvasStore } from "@/store/useCanvasStore";

export type ImageToolId = "remove-bg" | "upscale" | "magic-layer";

function isEditableImage(obj: unknown): obj is FabricImage {
  return Boolean(
    obj &&
      typeof obj === "object" &&
      (obj as { type?: string }).type === "image" &&
      typeof (obj as FabricImage).setSrc === "function",
  );
}

export function useImageTools() {
  const manager = useCanvasManager();
  const selectedObject = useCanvasStore((s) => s.selectedObject);
  const [busy, setBusy] = useState<ImageToolId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<UpscaleScale>(2);

  const image = isEditableImage(selectedObject) ? selectedObject : null;
  const canRun = Boolean(manager && image && !busy);

  const run = useCallback(
    async (id: ImageToolId, action: (img: FabricImage, src: string) => Promise<void>) => {
      if (!manager || !image || busy) return;
      setBusy(id);
      setError(null);
      try {
        const src = getActiveImageSource(image);
        await action(image, src);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Couldn't run the image tool");
      } finally {
        setBusy(null);
      }
    },
    [busy, image, manager],
  );

  const removeBackground = useCallback(() => {
    return run("remove-bg", async (img, src) => {
      const result = await removeImageBackground(src);
      await replaceImageSource(manager!, img, result);
    });
  }, [manager, run]);

  const upscale = useCallback(
    (nextScale: UpscaleScale = scale) => {
      return run("upscale", async (img, src) => {
        const result = await upscaleImage(src, nextScale);
        await replaceImageSource(manager!, img, result, { keepVisualSize: true });
      });
    },
    [manager, run, scale],
  );

  const magicLayer = useCallback(() => {
    return run("magic-layer", async (img, src) => {
      const result = await magicLayerImage(src);
      await applyMagicLayers(manager!, img, result);
    });
  }, [manager, run]);

  return {
    manager,
    image,
    canRun,
    busy,
    error,
    scale,
    setScale,
    removeBackground,
    upscale,
    magicLayer,
    clearError: () => setError(null),
  };
}
