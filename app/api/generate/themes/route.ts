import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { completeOllamaThemes, ollamaModel } from "@/lib/ai/ollama";
import { parseThemesResult } from "@/lib/ai/themes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { seed?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const seed = typeof body.seed === "string" ? body.seed.trim() : "";

  try {
    const raw = await completeOllamaThemes({ seed, signal: request.signal });
    const themes = parseThemesResult(raw);
    if (themes.length === 0) {
      return Response.json({ error: "No themes returned. Try another seed." }, { status: 502 });
    }
    return Response.json({ themes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Themes request failed";
    return Response.json(
      { error: `${message}. Is Ollama running with model ${ollamaModel()}?` },
      { status: 502 },
    );
  }
}
