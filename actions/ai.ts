"use server";

import {
  generateCarouselUpstream,
  type GenerateCarouselInput,
  type GenerateCarouselResult,
} from "@/lib/ai/generate";
import {
  generatePaletteUpstream,
  type AiPalette,
} from "@/lib/ai/generate-palette";
import { generateTextUpstream } from "@/lib/ai/generate-text";

/** Generate post caption / text via Deckva AI. Auth: proxy (studio). */
export async function generateText(postText: string): Promise<{ text: string }> {
  return generateTextUpstream({ post_text: postText });
}

/** Generate a color palette via Deckva AI. Auth: proxy (studio). */
export async function generatePalette(
  topic: string,
  language?: string,
): Promise<AiPalette> {
  return generatePaletteUpstream({
    topic,
    ...(language ? { language } : {}),
  });
}

/** Generate a full carousel via Deckva AI. Auth: proxy (studio). */
export async function generateCarousel(
  input: GenerateCarouselInput,
): Promise<GenerateCarouselResult> {
  return generateCarouselUpstream(input);
}
