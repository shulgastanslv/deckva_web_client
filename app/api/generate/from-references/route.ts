import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { parseCarouselResult } from "@/lib/ai/carousel-parse";
import { resolvePaletteFromSet, suggestedSetById } from "@/lib/ai/carousel-style";
import { normalizeGenerateOptions } from "@/lib/ai/generate-options";
import {
  completeOllamaFromReferences,
  ollamaVisionModel,
} from "@/lib/ai/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    images?: unknown;
    slides?: unknown;
    setId?: unknown;
    options?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const images = Array.isArray(body.images)
    ? body.images.filter((item): item is string => typeof item === "string" && item.length > 32)
    : [];
  if (images.length === 0) {
    return Response.json({ error: "At least one reference image is required" }, { status: 400 });
  }

  const slides = Math.min(20, Math.max(1, Math.round(Number(body.slides) || images.length || 6)));
  const setId = typeof body.setId === "string" ? body.setId.trim() : undefined;
  const options = normalizeGenerateOptions(
    body.options && typeof body.options === "object"
      ? (body.options as Parameters<typeof normalizeGenerateOptions>[0])
      : undefined,
  );

  const set = suggestedSetById(setId) ?? suggestedSetById("butter")!;
  const palette = resolvePaletteFromSet(set);

  try {
    const raw = await completeOllamaFromReferences({
      images: images.slice(0, 8),
      slides,
      options,
      signal: request.signal,
    });
    const result = parseCarouselResult(raw, slides);
    return Response.json({
      setId: set.id,
      palette,
      handle: "@deckva",
      title: result.title,
      slides: result.slides,
      options,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ollama request failed";
    return Response.json(
      {
        error: `${message}. Is Ollama running with vision model ${ollamaVisionModel()}?`,
      },
      { status: 502 },
    );
  }
}
