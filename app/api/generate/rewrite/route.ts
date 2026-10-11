import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { completeOllamaRewrite, ollamaModel } from "@/lib/ai/ollama";
import { parseRewriteResult, type RewriteMode } from "@/lib/ai/rewrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODES: RewriteMode[] = ["improve", "shorter", "clearer", "fix"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { texts?: unknown; mode?: unknown; note?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const texts = Array.isArray(body.texts)
    ? body.texts
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];
  if (texts.length === 0) {
    return Response.json({ error: "Select text to rewrite" }, { status: 400 });
  }

  const mode = MODES.includes(body.mode as RewriteMode)
    ? (body.mode as RewriteMode)
    : "improve";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : undefined;

  try {
    const raw = await completeOllamaRewrite({
      texts,
      mode,
      note,
      signal: request.signal,
    });
    const next = parseRewriteResult(raw, texts.length);
    return Response.json({ texts: next });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rewrite failed";
    return Response.json(
      { error: `${message}. Is Ollama running with model ${ollamaModel()}?` },
      { status: 502 },
    );
  }
}
