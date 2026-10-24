const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Normalize `#rgb` / `#rrggbb` (optional leading #) to lowercase `#rrggbb`. */
export function normalizeHex(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;
  if (!value.startsWith("#")) value = `#${value}`;
  if (!HEX_RE.test(value)) return null;
  if (value.length === 4) {
    const [, r, g, b] = value;
    value = `#${r}${r}${g}${g}${b}${b}`;
  }
  return value.toLowerCase();
}

/** Safe hex for native / saturation pickers when value may be empty or invalid. */
export function toPickerHex(value: string, fallback = "#000000"): string {
  const normalized = normalizeHex(value.slice(0, 7));
  return normalized ?? fallback;
}
