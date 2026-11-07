/** Client-side helpers that hit Next.js `/api/ai/*` proxies. */

async function postApiAi<T>(
  path: string,
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      typeof (payload as { error?: unknown }).error === "string"
        ? (payload as { error: string }).error
        : fallbackError;
    throw new Error(message);
  }
  return payload as T;
}

/** Proxies to deckva_ai `POST /text` with `{ post_text }`. */
export function apiGenerateText(postText: string) {
  return postApiAi<{ text: string }>(
    "/api/ai/text",
    { post_text: postText },
    "Text generation failed",
  );
}

export function apiGeneratePalette(topic: string, language?: string) {
  return postApiAi<import("@/lib/ai/generate-palette").AiPalette>(
    "/api/ai/palette",
    { topic, ...(language ? { language } : {}) },
    "Palette generation failed",
  );
}
