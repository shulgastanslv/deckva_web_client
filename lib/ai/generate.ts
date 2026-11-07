import { fetchAiJson, aiBaseUrl } from "@/lib/ai/client";
import { parseAiPalette, type AiPalette } from "@/lib/ai/generate-palette";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import { isRatioKey } from "@/lib/templates/parse";

export { aiBaseUrl };

export type GenerateCarouselInput = {
  topic: string;
  aspectRatio?: RatioKey;
  slidesCount?: number;
  language?: string;
  handle?: string;
  cover?: string;
};

export type GenerateCarouselResult = {
  title: string;
  aspectRatio: RatioKey;
  width: number;
  height: number;
  slides: FabricCanvasJSON[];
  palette?: AiPalette;
};

const TIMEOUT_MS = 180_000;

function isFabricSlide(value: unknown): value is FabricCanvasJSON {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray((value as { objects?: unknown }).objects)
  );
}

export async function generateCarouselUpstream(
  input: GenerateCarouselInput,
): Promise<GenerateCarouselResult> {
  const topic = input.topic.trim();
  if (topic.length < 2) {
    throw new Error("Describe what the carousel should be about");
  }

  const aspectRatio = input.aspectRatio ?? "4:5";
  const slidesCount = Math.min(10, Math.max(4, input.slidesCount ?? 7));
  const language = input.language?.trim() || inferPromptLanguage(topic);
  const handle = normalizeHandle(input.handle);
  const cover = input.cover ?? "";

  const payload = (await fetchAiJson(
    "/generate",
    {
      topic,
      aspect_ratio: aspectRatio,
      slides_count: slidesCount,
      language,
      handle,
      cover,
      save: false,
    },
    { timeoutMs: TIMEOUT_MS, label: "Carousel generation" },
  )) as Record<string, unknown>;

  const carousel =
    payload.carousel && typeof payload.carousel === "object"
      ? (payload.carousel as Record<string, unknown>)
      : payload;

  const title =
    (typeof payload.title === "string" && payload.title.trim()) ||
    (typeof carousel.title === "string" && carousel.title.trim()) ||
    topic.slice(0, 80);

  const ratioRaw =
    (typeof payload.aspectRatio === "string" && payload.aspectRatio) ||
    (typeof carousel.aspectRatio === "string" && carousel.aspectRatio) ||
    aspectRatio;
  const ratio: RatioKey = isRatioKey(ratioRaw) ? ratioRaw : aspectRatio;

  const slidesRaw = Array.isArray(carousel.slides) ? carousel.slides : [];
  const slides = slidesRaw.filter(isFabricSlide);
  if (slides.length === 0) {
    throw new Error("AI returned no slides");
  }

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

  return { title, aspectRatio: ratio, width, height, slides, palette };
}
