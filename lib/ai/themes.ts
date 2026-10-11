import { SUGGESTED_SETS } from "@/lib/presets/backgrounds";

export interface ThemeIdea {
  title: string;
  prompt: string;
  setId: string;
  slides: number;
}

/** Fast path: model only invents title+prompt; palette/slides are local. */
export const THEMES_COUNT = 3;
const DEFAULT_SLIDES = 5;

const FAST_SET_IDS = SUGGESTED_SETS.slice(0, 8).map((set) => set.id);

export function themesSystemPrompt(): string {
  return [
    `JSON only: {"themes":[{"title":"...","prompt":"..."}]}`,
    `Return exactly ${THEMES_COUNT} themes.`,
    "title ≤4 words. prompt = one short sentence.",
    "Same language as the seed. No markdown.",
  ].join("\n");
}

export function themesUserPrompt(seed: string): string {
  const trimmed = seed.trim();
  return trimmed ? `Seed: ${trimmed}` : "Seed: creators / lifestyle tips";
}

export function parseThemesResult(raw: unknown): ThemeIdea[] {
  if (!raw || typeof raw !== "object") return [];
  const rows = Array.isArray((raw as { themes?: unknown }).themes)
    ? (raw as { themes: unknown[] }).themes
    : [];

  const themes: ThemeIdea[] = [];
  for (const item of rows) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const prompt = typeof row.prompt === "string" ? row.prompt.trim() : "";
    if (title.length < 2 || prompt.length < 4) continue;
    themes.push({
      title,
      prompt,
      setId: FAST_SET_IDS[themes.length % FAST_SET_IDS.length] ?? "butter",
      slides: DEFAULT_SLIDES,
    });
    if (themes.length >= THEMES_COUNT) break;
  }
  return themes;
}
