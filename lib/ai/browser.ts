/** Client-side helpers that hit Next.js `/api/ai/*` proxies via Axios. */

import type { GenerateCarouselInput, GenerateCarouselResult } from "@/lib/ai/generate";
import { httpPostJson } from "@/lib/api/http";
import { messages } from "@/lib/messages";

/** Proxies to deckva_ai `POST /text` with `{ post_text }`. */
export function apiGenerateText(postText: string) {
  return httpPostJson<{ text: string }>(
    "/api/ai/text",
    { post_text: postText },
    { fallbackError: "Text generation failed" },
  );
}

export function apiGeneratePalette(topic: string, language?: string) {
  return httpPostJson<import("@/lib/ai/generate-palette").AiPalette>(
    "/api/ai/palette",
    { topic, ...(language ? { language } : {}) },
    { fallbackError: "Palette generation failed" },
  );
}

export function apiGenerateCarousel(input: GenerateCarouselInput) {
  return httpPostJson<GenerateCarouselResult>("/api/ai/generate", { ...input }, {
    fallbackError: messages.errors.generateCarousel,
    timeoutMs: 180_000,
  });
}
