/** Guess response language from the prompt script. */
export function inferPromptLanguage(topic: string): string {
  const sample = topic.replace(/\s+/g, "");
  if (!sample) return "en";
  const cyrillic = (sample.match(/[\u0400-\u04FF]/g) ?? []).length;
  return cyrillic / sample.length >= 0.3 ? "ru" : "en";
}

export function normalizeHandle(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim().replace(/\s+/g, "");
  if (!trimmed) return "@deckva";
  const base = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  const cleaned = base.replace(/[^\w.-]/g, "").slice(0, 48);
  return `@${cleaned || "deckva"}`;
}
