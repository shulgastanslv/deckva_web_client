import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { parseCarouselResult } from "@/lib/ai/carousel-parse";
import { resolvePaletteFromSet, suggestedSetById } from "@/lib/ai/carousel-style";
import { completeOllamaCarousel, ollamaModel } from "@/lib/ai/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { theme?: unknown; slides?: unknown; setId?: unknown };
  try {
    body = (await request.json()) as { theme?: unknown; slides?: unknown; setId?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const theme = typeof body.theme === "string" ? body.theme.trim() : "";
  const slides = Math.min(20, Math.max(1, Math.round(Number(body.slides) || 6)));
  const setId = typeof body.setId === "string" ? body.setId.trim() : undefined;
  if (theme.length < 2) {
    return Response.json({ error: "Theme is required" }, { status: 400 });
  }

  const set = suggestedSetById(setId) ?? suggestedSetById("black")!;
  const palette = resolvePaletteFromSet(set);

  try {
    const raw = await completeOllamaCarousel({
      theme,
      slides,
      signal: request.signal,
    });
    const result = parseCarouselResult(raw, slides);
    return Response.json({
      theme,
      setId: set.id,
      palette,
      tagline: theme.slice(0, 42),
      handle: "@swibp",
      title: result.title,
      slides: result.slides,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ollama request failed";
    return Response.json(
      {
        error: `${message}. Is Ollama running with model ${ollamaModel()}?`,
      },
      { status: 502 },
    );
  }
}
