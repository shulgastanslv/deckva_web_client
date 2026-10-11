import { suggestedSetById } from "./carousel-style";
import { SUGGESTED_SETS } from "@/lib/presets/backgrounds";

export interface CarouselThemeIdea {
  title: string;
  prompt: string;
  setId: string;
  slides: number;
}

export interface CarouselPaletteIdea {
  setId: string;
  reason: string;
}

export interface CarouselIdeasResult {
  themes: CarouselThemeIdea[];
  palettes: CarouselPaletteIdea[];
}

const SET_IDS = SUGGESTED_SETS.map((set) => set.id).join(", ");

export function ideasSystemPrompt(): string {
  return [
    'JSON only: {"themes":[{"title":"...","prompt":"...","setId":"black","slides":5}],"palettes":[{"setId":"butter","reason":"..."}]}',
    "4 themes, 3 palettes. setId from:",
    SET_IDS,
    "Match seed language. title ≤5 words. prompt 1 short sentence.",
  ].join("\n");
}

export function ideasUserPrompt(seed: string): string {
  const trimmed = seed.trim();
  if (!trimmed) return "Seed: creators / lifestyle tips";
  return `Seed: ${trimmed}`;
}

function asSetId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return suggestedSetById(value)?.id ?? null;
}

export function parseIdeasPayload(raw: unknown): CarouselIdeasResult {
  const fallbackPalettes = SUGGESTED_SETS.slice(0, 3).map((set) => ({
    setId: set.id,
    reason: set.label,
  }));

  if (!raw || typeof raw !== "object") {
    return { themes: [], palettes: fallbackPalettes };
  }

  const obj = raw as Record<string, unknown>;
  const themesRaw = Array.isArray(obj.themes) ? obj.themes : [];
  const palettesRaw = Array.isArray(obj.palettes) ? obj.palettes : [];

  const themes: CarouselThemeIdea[] = [];
  for (const item of themesRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const prompt = typeof row.prompt === "string" ? row.prompt.trim() : "";
    const setId = asSetId(row.setId) ?? "black";
    const slides = Math.min(8, Math.max(4, Math.round(Number(row.slides) || 5)));
    if (title.length < 2 || prompt.length < 4) continue;
    themes.push({ title, prompt, setId, slides });
    if (themes.length >= 4) break;
  }

  const palettes: CarouselPaletteIdea[] = [];
  const seen = new Set<string>();
  for (const item of palettesRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const setId = asSetId(row.setId);
    if (!setId || seen.has(setId)) continue;
    seen.add(setId);
    const reason =
      typeof row.reason === "string" && row.reason.trim()
        ? row.reason.trim()
        : suggestedSetById(setId)?.label || setId;
    palettes.push({ setId, reason });
    if (palettes.length >= 3) break;
  }

  return {
    themes,
    palettes: palettes.length > 0 ? palettes : fallbackPalettes,
  };
}

/** Pull JSON object from model text that may wrap it in fences. */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continue
    }
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error("Model did not return JSON");
}
