import { fetchAiJson } from "@/lib/ai/client";
import { inferPromptLanguage } from "@/lib/ai/prompt";
import type { ProjectPalette } from "@/lib/canvas/document";

/** Palette shape returned by deckva_ai `POST /palette`. */
export type AiPalette = {
  name: string;
  bg: string;
  text: string;
  muted: string;
  accent: string;
  accent_text: string;
  grid: string;
  photo: string;
};

export type GeneratePaletteInput = {
  topic: string;
  language?: string;
};

export type GeneratePaletteResult = AiPalette;

const HEX = /^#[0-9A-Fa-f]{6}$/;

function requireHex(value: unknown, field: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!HEX.test(text)) {
    throw new Error(`Palette field ${field} must be #RRGGBB`);
  }
  return text.toUpperCase();
}

export function parseAiPalette(raw: unknown): AiPalette {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI returned an empty palette");
  }
  const row = raw as Record<string, unknown>;
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!name) throw new Error("AI returned palette without a name");

  return {
    name: name.slice(0, 48),
    bg: requireHex(row.bg, "bg"),
    text: requireHex(row.text, "text"),
    muted: requireHex(row.muted, "muted"),
    accent: requireHex(row.accent, "accent"),
    accent_text: requireHex(row.accent_text, "accent_text"),
    grid: requireHex(row.grid, "grid"),
    photo: requireHex(row.photo, "photo"),
  };
}

/** Map AI carousel palette → editor/brand-kit ProjectPalette slots. */
export function aiPaletteToProjectPalette(palette: AiPalette): ProjectPalette {
  return {
    background: palette.bg,
    text: palette.text,
    accent: palette.accent,
    card: palette.photo,
  };
}

export async function generatePaletteUpstream(
  input: GeneratePaletteInput,
): Promise<GeneratePaletteResult> {
  const topic = input.topic.trim();
  if (topic.length < 2) {
    throw new Error("Describe the mood or brand for palette generation");
  }

  const language = input.language?.trim() || inferPromptLanguage(topic);
  const payload = await fetchAiJson(
    "/palette",
    { topic, language },
    { timeoutMs: 120_000, label: "Palette generation" },
  );

  return parseAiPalette(payload);
}
