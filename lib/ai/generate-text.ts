import { fetchAiJson } from "@/lib/ai/client";

export type GenerateTextInput = {
  /** Seed copy or topic for the post caption — maps to deckva_ai `post_text`. */
  post_text: string;
};

export type GenerateTextResult = {
  text: string;
};

export async function generateTextUpstream(
  input: GenerateTextInput,
): Promise<GenerateTextResult> {
  const post_text = input.post_text.trim();
  if (post_text.length < 2) {
    throw new Error("post_text is required (min 2 characters)");
  }

  const payload = (await fetchAiJson(
    "/text",
    { post_text },
    { timeoutMs: 120_000, label: "Text generation" },
  )) as Record<string, unknown>;

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    throw new Error("AI returned empty text");
  }

  return { text };
}
