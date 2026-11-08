"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
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
import { messages } from "@/lib/messages";

async function requireSignedIn() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error(messages.errors.signIn);
  }
  return session.user.id;
}

/** Generate post caption / text via Deckva AI. */
export async function generateText(postText: string): Promise<{ text: string }> {
  await requireSignedIn();
  return generateTextUpstream({ post_text: postText });
}

/** Generate a color palette via Deckva AI. */
export async function generatePalette(
  topic: string,
  language?: string,
): Promise<AiPalette> {
  await requireSignedIn();
  return generatePaletteUpstream({
    topic,
    ...(language ? { language } : {}),
  });
}

/** Generate a full carousel via Deckva AI. */
export async function generateCarousel(
  input: GenerateCarouselInput,
): Promise<GenerateCarouselResult> {
  await requireSignedIn();
  return generateCarouselUpstream(input);
}
