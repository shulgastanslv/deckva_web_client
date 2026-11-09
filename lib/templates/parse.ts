import { normalizeFabricSlide } from "@/lib/ai/normalize-fabric";
import { withRemoteImageCors } from "@/lib/canvas/image-cors";
import type { FabricCanvasJSON, RatioKey, SlideItem } from "@/lib/types";
import { CANVAS_RATIOS } from "@/lib/types";

export interface TemplateCarouselPayload {
  slides: FabricCanvasJSON[];
  thumbnails: Array<string | null>;
  aspectRatio?: RatioKey;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isFabricJSON(value: unknown): value is FabricCanvasJSON {
  return isRecord(value) && Array.isArray(value.objects);
}

export function isRatioKey(value: string): value is RatioKey {
  return value in CANVAS_RATIOS;
}

function emptySlide(): FabricCanvasJSON {
  return { version: "6.0.0", objects: [], background: "#ffffff" };
}

function thumbnailAt(raw: unknown, index: number): string | null {
  if (!Array.isArray(raw)) return null;
  const value = raw[index];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Supports published `{ slides, thumbnails }` and legacy single-canvas Fabric JSON. */
export function parseTemplateCanvasJSON(raw: unknown): TemplateCarouselPayload {
  if (isRecord(raw) && Array.isArray(raw.slides)) {
    const slides: FabricCanvasJSON[] = [];
    const thumbnails: Array<string | null> = [];
    raw.slides.forEach((slide, index) => {
      if (!isFabricJSON(slide)) return;
      slides.push(slide);
      thumbnails.push(thumbnailAt(raw.thumbnails, index));
    });
    const aspectRatio =
      typeof raw.aspectRatio === "string" && isRatioKey(raw.aspectRatio)
        ? raw.aspectRatio
        : undefined;
    if (slides.length === 0) {
      return { slides: [emptySlide()], thumbnails: [null], aspectRatio };
    }
    return { slides, thumbnails, aspectRatio };
  }

  if (typeof raw === "string") {
    try {
      return parseTemplateCanvasJSON(JSON.parse(raw));
    } catch {
      return { slides: [emptySlide()], thumbnails: [null] };
    }
  }

  if (isFabricJSON(raw)) {
    return { slides: [raw], thumbnails: [null] };
  }

  return { slides: [emptySlide()], thumbnails: [null] };
}

export interface ImportedTemplate {
  title?: string;
  aspectRatio?: RatioKey;
  slides: FabricCanvasJSON[];
  thumbnails: Array<string | null>;
  previewUrl?: string | null;
}

export type ImportedTemplateResult =
  | { ok: true; template: ImportedTemplate }
  | { ok: false; error: string };

function readText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readRatio(...values: unknown[]): RatioKey | undefined {
  for (const value of values) {
    if (typeof value === "string" && isRatioKey(value)) return value;
  }
  return undefined;
}

function slideThumbnail(value: unknown): string | null {
  if (!isRecord(value)) return null;
  const thumb = value.thumbnail ?? value.previewUrl;
  return typeof thumb === "string" && thumb.length > 0 ? thumb : null;
}

function asFabric(value: unknown): FabricCanvasJSON | null {
  if (isFabricJSON(value)) return value;
  if (isRecord(value) && isFabricJSON(value.canvasJSON)) return value.canvasJSON;
  return null;
}

type CollectedSlides =
  | { ok: true; slides: FabricCanvasJSON[]; thumbnails: Array<string | null> }
  | { ok: false; error: string };

function collectSlides(list: unknown[], parentThumbs?: unknown): CollectedSlides {
  if (list.length === 0) return { ok: false, error: "Template has no slides" };

  const slides: FabricCanvasJSON[] = [];
  const thumbnails: Array<string | null> = [];
  for (let index = 0; index < list.length; index += 1) {
    const fabric = asFabric(list[index]);
    if (!fabric) return { ok: false, error: `Slide ${index + 1} is not canvas JSON` };
    slides.push(fabric);
    thumbnails.push(slideThumbnail(list[index]) ?? thumbnailAt(parentThumbs, index));
  }

  return { ok: true, slides, thumbnails };
}

function templateBody(raw: Record<string, unknown>): Record<string, unknown> | null {
  if (Array.isArray(raw.slides) || isFabricJSON(raw)) return raw;
  // CORA `/cora/run` response or saved run export.
  if (isRecord(raw.carousel) && Array.isArray(raw.carousel.slides)) {
    return raw.carousel;
  }
  const nested = isRecord(raw.canvasJSON)
    ? raw.canvasJSON
    : isRecord(raw.template)
      ? raw.template
      : null;
  if (nested && (Array.isArray(nested.slides) || isFabricJSON(nested))) return nested;
  return null;
}

/** Read a template file: a carousel, one Fabric canvas, or a list of slides. */
export function parseImportedTemplate(raw: unknown): ImportedTemplateResult {
  if (typeof raw === "string") {
    try {
      return parseImportedTemplate(JSON.parse(raw));
    } catch {
      return { ok: false, error: "That file is not valid JSON" };
    }
  }

  if (Array.isArray(raw)) {
    const collected = collectSlides(raw);
    if (collected.ok === false) return { ok: false, error: collected.error };
    return {
      ok: true,
      template: {
        slides: collected.slides.map((slide) => withRemoteImageCors(slide)),
        thumbnails: collected.thumbnails,
      },
    };
  }

  if (!isRecord(raw)) {
    return { ok: false, error: "Template JSON must be an object or an array of slides" };
  }

  const nested = isRecord(raw.canvasJSON)
    ? raw.canvasJSON
    : isRecord(raw.template)
      ? raw.template
      : null;
  const body = templateBody(raw);
  if (!body) {
    return { ok: false, error: "This JSON isn't a template. Use a slides array or a canvas object." };
  }

  const collected = Array.isArray(body.slides)
    ? collectSlides(body.slides, body.thumbnails ?? raw.thumbnails)
    : { ok: true as const, slides: [body as FabricCanvasJSON], thumbnails: [thumbnailAt(raw.thumbnails, 0)] };

  if (collected.ok === false) return { ok: false, error: collected.error };

  const previewUrl = readText(raw.previewUrl) ?? (nested ? readText(nested.previewUrl) : undefined);
  const carousel = isRecord(raw.carousel) ? raw.carousel : null;
  const title =
    readText(raw.title) ??
    readText(raw.name) ??
    (carousel ? readText(carousel.title) : undefined) ??
    (nested ? readText(nested.title) ?? readText(nested.name) : undefined);

  return {
    ok: true,
    template: {
      title,
      aspectRatio: readRatio(
        raw.aspectRatio,
        carousel?.aspectRatio,
        nested?.aspectRatio,
        body.aspectRatio,
      ),
      slides: collected.slides.map((slide) =>
        withRemoteImageCors(normalizeFabricSlide(slide)),
      ),
      thumbnails: collected.thumbnails,
      previewUrl: previewUrl ?? null,
    },
  };
}

export function templateSlidesToItems(
  slides: FabricCanvasJSON[],
  thumbnails?: Array<string | null> | null,
  previewUrl?: string | null,
): SlideItem[] {
  return slides.map((canvasJSON, index) => {
    const stored = thumbnails?.[index];
    const thumbnail =
      typeof stored === "string" && stored.length > 0
        ? stored
        : index === 0 && previewUrl
          ? previewUrl
          : null;
    return { id: index + 1, canvasJSON, thumbnail };
  });
}
