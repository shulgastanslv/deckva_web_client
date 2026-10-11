export type RewriteMode = "improve" | "shorter" | "clearer" | "fix";

const MODE_HINT: Record<RewriteMode, string> = {
  improve: "Improve clarity and punch. Keep the same meaning and language.",
  shorter: "Make it shorter. Keep the key idea. Same language.",
  clearer: "Make it clearer and simpler. Same language.",
  fix: "Fix grammar, spelling, and awkward phrasing. Keep meaning. Same language.",
};

export function rewriteSystemPrompt(mode: RewriteMode): string {
  return [
    "You rewrite carousel text blocks for Swibp.",
    'JSON only: {"texts":["..."]}',
    "Return exactly one rewritten string per input, same order.",
    MODE_HINT[mode],
    "No markdown, no quotes around the whole answer, no hashtags, no emoji.",
  ].join("\n");
}

export function rewriteUserPrompt(
  texts: string[],
  mode: RewriteMode,
  note?: string,
): string {
  const lines = [
    `Mode: ${mode}`,
    `Count: ${texts.length}`,
    ...texts.map((text, index) => `[${index + 1}] ${text}`),
  ];
  const extra = note?.trim();
  if (extra) lines.push(`Extra instruction: ${extra}`);
  return lines.join("\n");
}

export function parseRewriteResult(raw: unknown, expected: number): string[] {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid rewrite JSON");
  }
  const rows = Array.isArray((raw as { texts?: unknown }).texts)
    ? (raw as { texts: unknown[] }).texts
    : [];
  const out: string[] = [];
  for (const item of rows) {
    if (typeof item !== "string" || !item.trim()) continue;
    out.push(item.trim());
    if (out.length >= expected) break;
  }
  if (out.length === 0) throw new Error("No rewritten text returned");
  while (out.length < expected) out.push(out[out.length - 1]!);
  return out.slice(0, expected);
}

export function rewriteNumPredict(textCount: number): number {
  return Math.min(900, 48 + textCount * 72);
}
