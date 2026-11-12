import { applyFontToSlide, TEXT_STYLES } from "@/lib/canvas/document";
import { applyFontOnCanvas } from "@/lib/canvas/paint-live";
import { chromeTemplatesFrom } from "@/lib/canvas/chrome";
import type { CanvasManager } from "@/lib/canvas/manager";
import { scheduleSlideThumbnailHydration } from "@/lib/canvas/thumbnail";
import { normalizeFontFamily } from "@/lib/fonts/google-fonts";
import { useCanvasStore } from "@/store/useCanvasStore";

/** Sets one typeface on text. Without `slideIds`, every slide and the text styles change. */
export function applyCarouselFont(
  family: string,
  manager: CanvasManager | null,
  slideIds?: number[],
) {
  const fontFamily = normalizeFontFamily(family);
  const store = useCanvasStore.getState();
  const ids = slideIds ? new Set(slideIds) : null;
  if (ids && ids.size === 0) return;

  if (!ids) {
    for (const style of TEXT_STYLES) {
      const current = useCanvasStore.getState().textStyles[style.id];
      useCanvasStore.getState().setTextStyle(style.id, { ...current, fontFamily });
    }
  }

  const touched = store.slides
    .filter((slide) => !ids || ids.has(slide.id))
    .map((slide) => slide.id);

  store.setSlides(
    store.slides.map((slide) =>
      !ids || ids.has(slide.id)
        ? {
            ...slide,
            canvasJSON: applyFontToSlide(slide.canvasJSON, fontFamily),
            thumbnail: slide.id === store.currentSlideId ? slide.thumbnail : null,
          }
        : slide,
    ),
  );

  const currentId = useCanvasStore.getState().currentSlideId;
  if (manager && (!ids || ids.has(currentId))) {
    applyFontOnCanvas(manager.canvas, fontFamily);
    if (!ids) useCanvasStore.getState().setChrome(chromeTemplatesFrom(manager.getState()));
    manager.commit();
  }

  useCanvasStore.getState().setDirty(true);
  scheduleSlideThumbnailHydration(touched);
}
