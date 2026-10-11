export interface CarouselSlideSpec {
  heading: string;
  body?: string;
  background?: string;
}

export function normalizeHex(value: string): string {
  const raw = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return raw.toLowerCase();
}
