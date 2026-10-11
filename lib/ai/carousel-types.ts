import type { ProjectPalette } from "@/lib/canvas/document";

export type CarouselSlideRole = "cover" | "point" | "cta";
export type CarouselSlideLayout = "editorial" | "center" | "top" | "split";

export interface CarouselSlideSpec {
  index: number;
  role: CarouselSlideRole;
  heading: string;
  body?: string;
  background?: string;
  layout?: CarouselSlideLayout;
}

export type CarouselPalette = ProjectPalette;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function normalizeHex(value: string): string {
  const raw = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return raw.toLowerCase();
}
