"use client";

import { useCallback } from "react";

import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { renderMissingThumbnails } from "@/lib/canvas/thumbnail";
import { templateSlidesToItems } from "@/lib/templates/parse";
import { withRemoteImageCors } from "@/lib/canvas/image-cors";
import type { FabricCanvasJSON, RatioKey, SlideItem } from "@/lib/types";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";

/** Apply slide payloads from CORA, JSON import, or similar (not the old Template catalogue). */
export function useApplyTemplate() {
  const slidesController = useSlidesController();

  const applyPayload = useCallback(
    async (payload: {
      title?: string;
      aspectRatio: RatioKey;
      slides: FabricCanvasJSON[];
      thumbnails?: Array<string | null> | null;
      previewUrl?: string | null;
    }) => {
      slidesController?.saveCurrent();

      const store = useCanvasStore.getState();
      store.setCurrentRatio(payload.aspectRatio);
      const size = useCanvasStore.getState().canvasDimensions;
      let items: SlideItem[] = templateSlidesToItems(
        payload.slides,
        payload.thumbnails,
        payload.previewUrl,
      );

      try {
        const rendered = await renderMissingThumbnails(items, size);
        if (rendered.length > 0) {
          const byId = new Map(rendered.map((shot) => [shot.id, shot.dataUrl]));
          items = items.map((slide) =>
            slide.thumbnail || !byId.has(slide.id)
              ? slide
              : { ...slide, thumbnail: byId.get(slide.id) ?? null },
          );
        }
      } catch (err) {
        reportError(err, messages.errors.thumbnails);
      }

      store.setSlides(items);
      store.setCurrentSlideId(items[0]?.id ?? 1);
      store.setDirty(true);

      await slidesController?.loadCurrent();
      return { success: true as const };
    },
    [slidesController],
  );

  const insertTemplateSlide = useCallback(
    async (canvasJSON: FabricCanvasJSON, thumbnail: string | null) => {
      if (!slidesController) return { success: false as const };
      await slidesController.insert(withRemoteImageCors(canvasJSON), thumbnail);
      return { success: true as const };
    },
    [slidesController],
  );

  return { applyPayload, insertTemplateSlide };
}
