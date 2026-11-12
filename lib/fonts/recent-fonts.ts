const KEY = "deckva.recent-fonts";
const MAX = 10;

export const RECENT_FONTS_CHANGED = "deckva:recent-fonts";

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function readRecentFonts(): string[] {
  return readRaw();
}

/** Remember a font after the user picks it. Newest first, unique. */
export function rememberRecentFont(family: string): string[] {
  const trimmed = family.trim();
  if (!trimmed) return readRaw();
  const next = [trimmed, ...readRaw().filter((item) => item !== trimmed)].slice(
    0,
    MAX,
  );
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_FONTS_CHANGED));
  } catch {
    /* quota / private mode */
  }
  return next;
}
