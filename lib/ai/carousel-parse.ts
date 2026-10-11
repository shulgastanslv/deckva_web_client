import type { CarouselGenerateOptions } from "./generate-options";
import type { CarouselSlideLayout, CarouselSlideRole, CarouselSlideSpec } from "./carousel-types";

export interface CarouselGenerateResult {
  title: string;
  slides: CarouselSlideSpec[];
}

function roleForIndex(
  index: number,
  total: number,
  includeCta: boolean,
): CarouselSlideRole {
  if (index <= 0) return "cover";
  if (includeCta && index >= total - 1) return "cta";
  return "point";
}

export function parseCarouselResult(
  raw: unknown,
  expected: number,
  options?: Pick<CarouselGenerateOptions, "includeCta">,
): CarouselGenerateResult {
  const includeCta = options?.includeCta ?? true;
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
  const layout: CarouselSlideLayout = "center";

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
      role: roleForIndex(index, expected, includeCta),
      layout,
      heading,
      body: body || undefined,
    });
    if (slides.length >= expected) break;
  }

  const total = slides.length;
  for (let i = 0; i < total; i += 1) {
    slides[i] = {
      ...slides[i]!,
      index: i,
      role: roleForIndex(i, total, includeCta),
      layout,
    };
  }

  if (slides.length === 0) {
    throw new Error("Ollama returned no slides");
  }

  return { title, slides };
}
