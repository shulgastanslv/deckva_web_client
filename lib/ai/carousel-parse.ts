import type { CarouselSlideLayout, CarouselSlideRole, CarouselSlideSpec } from "./carousel-types";

export interface CarouselGenerateResult {
  title: string;
  slides: CarouselSlideSpec[];
}

function roleForIndex(index: number, total: number): CarouselSlideRole {
  if (index <= 0) return "cover";
  if (index >= total - 1) return "cta";
  return "point";
}

function layoutForIndex(index: number): CarouselSlideLayout {
  return index === 0 ? "center" : "editorial";
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

  const rows = Array.isArray(obj.slides) ? obj.slides : [];
  const slides: CarouselSlideSpec[] = [];

  for (const item of rows) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const heading =
      typeof row.heading === "string"
        ? row.heading.trim()
        : typeof row.h === "string"
          ? row.h.trim()
          : "";
    if (!heading) continue;
    const body =
      typeof row.body === "string"
        ? row.body.trim()
        : typeof row.b === "string"
          ? row.b.trim()
          : "";
    const index = slides.length;
    slides.push({
      index,
      role: roleForIndex(index, expected),
      layout: layoutForIndex(index),
      heading,
      body: body || undefined,
    });
    if (slides.length >= expected) break;
  }

  // Fix roles/layouts with final count.
  const total = slides.length;
  for (let i = 0; i < total; i += 1) {
    slides[i] = {
      ...slides[i]!,
      index: i,
      role: roleForIndex(i, total),
      layout: layoutForIndex(i),
    };
  }

  if (slides.length === 0) {
    throw new Error("Ollama returned no slides");
  }

  return { title, slides };
}
