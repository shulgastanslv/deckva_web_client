import type { CarouselSlideSpec } from "./carousel-types";

export interface CarouselGenerateResult {
  title: string;
  slides: CarouselSlideSpec[];
}

function textField(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function parseCarouselResult(raw: unknown, expected: number): CarouselGenerateResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Ollama returned invalid JSON");
  }

  const obj = raw as Record<string, unknown>;
  const title =
    typeof obj.title === "string" && obj.title.trim()
      ? obj.title.trim().slice(0, 48)
      : "Carousel";

  const slides: CarouselSlideSpec[] = [];
  for (const item of Array.isArray(obj.slides) ? obj.slides : []) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const heading = textField(row, ["heading", "h"]);
    if (!heading) continue;
    const body = textField(row, ["body", "b"]);
    slides.push({ heading, body: body || undefined });
    if (slides.length >= expected) break;
  }

  if (slides.length === 0) {
    throw new Error("Ollama returned no slides");
  }

  return { title, slides };
}
