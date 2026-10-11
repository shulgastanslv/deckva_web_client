import { SUGGESTED_SETS, type SuggestedSet } from "@/lib/presets/backgrounds";
import type { ProjectPalette } from "@/lib/canvas/document";
import { normalizeHex } from "./carousel-types";

const SET_BY_ID = new Map(SUGGESTED_SETS.map((set) => [set.id, set]));

export function suggestedSetById(id: string | undefined | null): SuggestedSet | null {
  if (!id) return null;
  return SET_BY_ID.get(id.trim().toLowerCase()) ?? null;
}

export function resolvePaletteFromSet(set: SuggestedSet): ProjectPalette {
  return {
    background: normalizeHex(set.background),
    text: normalizeHex(set.text),
    accent: normalizeHex(set.accent),
    card: normalizeHex(set.card),
  };
}

/** Cycle set colors across slides. */
export function backgroundsForSet(set: SuggestedSet, count: number): string[] {
  const colors = [set.background, set.card, set.accent].map(normalizeHex);
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]!);
}
