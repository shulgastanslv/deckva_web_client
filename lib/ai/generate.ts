import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import { isRatioKey } from "@/lib/templates/parse";

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
};

const DEFAULT_AI_URL = "http://127.0.0.1:9000";
const TIMEOUT_MS = 180_000;

export function aiBaseUrl() {
  return (process.env.DECKVA_AI_URL?.trim() || DEFAULT_AI_URL).replace(/\/$/, "");
}

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

  const url = `${aiBaseUrl()}/generate`;
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        aspect_ratio: aspectRatio,
        slides_count: slidesCount,
        language,
        handle,
        cover,
        save: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    throw new Error(
      timedOut
        ? "Carousel generation timed out"
        : "Couldn't reach the Deckva AI server",
    );
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    const detail =
      payload &&
      typeof payload === "object" &&
      typeof (payload as { detail?: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : payload &&
            typeof payload === "object" &&
            typeof (payload as { error?: unknown }).error === "string"
          ? (payload as { error: string }).error
          : `Generation failed (${upstream.status})`;
    throw new Error(detail);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("AI returned an empty response");
  }

  const row = payload as Record<string, unknown>;
  const carousel =
    row.carousel && typeof row.carousel === "object"
      ? (row.carousel as Record<string, unknown>)
      : row;

  const title =
    (typeof row.title === "string" && row.title.trim()) ||
    (typeof carousel.title === "string" && carousel.title.trim()) ||
    topic.slice(0, 80);

  const ratioRaw =
    (typeof row.aspectRatio === "string" && row.aspectRatio) ||
    (typeof carousel.aspectRatio === "string" && carousel.aspectRatio) ||
    aspectRatio;
  const ratio: RatioKey = isRatioKey(ratioRaw) ? ratioRaw : aspectRatio;

  const slidesRaw = Array.isArray(carousel.slides) ? carousel.slides : [];
  const slides = slidesRaw.filter(isFabricSlide);
  if (slides.length === 0) {
    throw new Error("AI returned no slides");
  }

  const width =
    typeof row.width === "number"
      ? row.width
      : typeof carousel.width === "number"
        ? carousel.width
        : 1080;
  const height =
    typeof row.height === "number"
      ? row.height
      : typeof carousel.height === "number"
        ? carousel.height
        : 1350;

  return { title, aspectRatio: ratio, width, height, slides };
}
