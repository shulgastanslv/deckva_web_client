import { parseAiPalette, type AiPalette } from "@/lib/ai/generate-palette";
import { normalizeFabricSlide } from "@/lib/ai/normalize-fabric";
import type { GenerateCarouselResult } from "@/lib/ai/types";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import { isRatioKey } from "@/lib/templates/parse";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isFabricSlide(value: unknown): value is FabricCanvasJSON {
  return isRecord(value) && Array.isArray(value.objects);
}

function captionFromSlides(slides: FabricCanvasJSON[]): string {
  const lines: string[] = [];
  for (const slide of slides) {
    for (const raw of slide.objects ?? []) {
      if (!isRecord(raw)) continue;
      const text = typeof raw.text === "string" ? raw.text.trim() : "";
      if (!text) continue;
      const role = typeof raw.swibpRole === "string" ? raw.swibpRole : "";
      if (role === "handle" || role === "counter") continue;
      const style = typeof raw.swibpStyle === "string" ? raw.swibpStyle : "";
      if (style === "heading" || style === "body" || style === "subtitle") {
        lines.push(text);
        break;
      }
    }
    if (lines.length >= 8) break;
  }
  return lines.join("\n\n");
}

/** Parse `POST /cora/run` (or saved CORA JSON) into canvas-ready slides. */
export function parseCoraCarouselPayload(
  payload: unknown,
  fallbacks?: { topic?: string; aspectRatio?: RatioKey },
): Omit<GenerateCarouselResult, "entitlement"> {
  if (!isRecord(payload)) throw new Error("AI returned an empty response");

  if (payload.status === "failed") {
    throw new Error(
      typeof payload.error === "string" && payload.error.trim()
        ? payload.error
        : "Generation failed",
    );
  }

  const carousel = isRecord(payload.carousel) ? payload.carousel : payload;
  const fallbackTopic = fallbacks?.topic?.trim() || "Carousel";
  const fallbackRatio = fallbacks?.aspectRatio ?? "4:5";

  const title =
    (typeof payload.title === "string" && payload.title.trim()) ||
    (typeof carousel.title === "string" && carousel.title.trim()) ||
    fallbackTopic.slice(0, 80);

  const ratioRaw =
    (typeof payload.aspectRatio === "string" && payload.aspectRatio) ||
    (typeof carousel.aspectRatio === "string" && carousel.aspectRatio) ||
    fallbackRatio;
  const aspectRatio: RatioKey = isRatioKey(ratioRaw) ? ratioRaw : fallbackRatio;

  const slidesRaw = Array.isArray(carousel.slides) ? carousel.slides : [];
  const slides = slidesRaw
    .filter(isFabricSlide)
    .map((slide) => normalizeFabricSlide(slide));
  if (slides.length === 0) throw new Error("AI returned no slides");

  const width =
    typeof payload.width === "number"
      ? payload.width
      : typeof carousel.width === "number"
        ? carousel.width
        : 1080;
  const height =
    typeof payload.height === "number"
      ? payload.height
      : typeof carousel.height === "number"
        ? carousel.height
        : 1350;

  let palette: AiPalette | undefined;
  try {
    if (payload.palette) palette = parseAiPalette(payload.palette);
  } catch {
    palette = undefined;
  }

  const caption = captionFromSlides(slides);

  return {
    coraRunId:
      typeof payload.coraRunId === "string" ? payload.coraRunId : "cor_unknown",
    title,
    aspectRatio,
    width,
    height,
    slides,
    palette,
    caption: caption || undefined,
    modelId:
      typeof payload.modelId === "string" ? payload.modelId : "unknown",
  };
}
