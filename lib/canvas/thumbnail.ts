import { renderSlidesToImages } from "@/lib/export/carousel";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import type { FabricCanvasJSON } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

/** Wide enough for a retina sidebar card; the slide strip downscales this cleanly. */
export const THUMB_TARGET_WIDTH = 480;
const THUMB_QUALITY = 0.92;

let hydrateGen = 0;

interface ThumbnailCanvas {
  getZoom(): number;
  width?: number;
  lowerCanvasEl?: unknown;
  toDataURL(options: { format: "jpeg"; quality: number; multiplier: number }): string;
}

/** JPEG preview of the live canvas. Does not change zoom or dimensions. */
export function captureCanvasThumbnail(
  canvas: ThumbnailCanvas,
  disposed = false,
): string | null {
  try {
    if (disposed || !canvas.lowerCanvasEl) return null;
    const displayWidth = canvas.width || 1;
    const multiplier = Math.min(
      2,
      Math.max(0.05, THUMB_TARGET_WIDTH / Math.max(1, displayWidth)),
    );
    const url = canvas.toDataURL({
      format: "jpeg",
      quality: THUMB_QUALITY,
      multiplier,
    });
    return url || null;
  } catch {
    return null;
  }
}

export async function renderMissingThumbnails(
  slides: Array<{ id: number; canvasJSON: FabricCanvasJSON; thumbnail?: string | null }>,
  size: { width: number; height: number },
): Promise<Array<{ id: number; dataUrl: string }>> {
  const missing = slides.filter((slide) => !slide.thumbnail);
  if (missing.length === 0) return [];

  const rendered = await renderSlidesToImages(
    missing.map((slide) => ({ id: slide.id, canvasJSON: slide.canvasJSON })),
    size,
    {
      format: "jpeg",
      quality: THUMB_QUALITY,
      multiplier: Math.min(2, Math.max(0.05, THUMB_TARGET_WIDTH / Math.max(1, size.width))),
    },
  );

  return rendered.map((shot) => ({ id: shot.id, dataUrl: shot.dataUrl }));
}

/**
 * After store-only multi-slide edits (palette, bg sets, chrome, fonts…), clear
 * stale neighbor thumbs and re-render them offscreen so the strip updates
 * without waiting for a slide switch / selection.
 */
export function scheduleSlideThumbnailHydration(ids?: Iterable<number> | null) {
  const store = useCanvasStore.getState();
  const idSet = ids ? new Set(ids) : null;
  const projectId = store.currentProjectId;

  const next = store.slides.map((slide) => {
    if (idSet && !idSet.has(slide.id)) return slide;
    // Live canvas thumb is refreshed by slide-navigator on commit/change.
    if (slide.id === store.currentSlideId) return slide;
    return slide.thumbnail == null ? slide : { ...slide, thumbnail: null };
  });
  if (next.some((slide, i) => slide !== store.slides[i])) {
    store.setSlides(next);
  }

  const gen = ++hydrateGen;
  const snapshot = useCanvasStore.getState().slides.map((slide) => ({
    id: slide.id,
    canvasJSON: slide.canvasJSON,
    thumbnail: slide.thumbnail ?? null,
  }));
  if (!snapshot.some((slide) => !slide.thumbnail)) return;

  void (async () => {
    let rendered: Array<{ id: number; dataUrl: string }> = [];
    try {
      rendered = await renderMissingThumbnails(
        snapshot,
        useCanvasStore.getState().canvasDimensions,
      );
    } catch (err) {
      reportError(err, messages.errors.thumbnails);
      return;
    }
    if (gen !== hydrateGen || rendered.length === 0) return;

    const current = useCanvasStore.getState();
    if (current.currentProjectId !== projectId) return;

    const byId = new Map(rendered.map((shot) => [shot.id, shot.dataUrl]));
    for (const slide of snapshot) {
      const thumb = byId.get(slide.id);
      if (!thumb) continue;
      const now = current.slides.find((item) => item.id === slide.id);
      if (!now || now.thumbnail || now.canvasJSON !== slide.canvasJSON) continue;
      current.updateSlideThumbnail(slide.id, thumb);
    }
  })();
}
