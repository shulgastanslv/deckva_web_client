export type HeadingPosition = "top" | "center" | "bottom";

export interface CarouselGenerateOptions {
  /** Where the heading + body stack sits (ignored when a template is selected) */
  headingPosition: HeadingPosition;
  /** Exact sentence count for each slide body */
  sentences: number;
  /** How many short labels sit on the slide edges (0–4) */
  edgeCount: number;
  /** Bottom-right swipe cue on non-final slides */
  swipeHint: boolean;
  /** Swipe label, e.g. "листай →" */
  swipeText: string;
  /** Last slide is a CTA */
  includeCta: boolean;
  /** Fill AI copy into this template instead of the default layout */
  templateId: string | null;
}

export const DEFAULT_GENERATE_OPTIONS: CarouselGenerateOptions = {
  headingPosition: "center",
  sentences: 2,
  edgeCount: 2,
  swipeHint: false,
  swipeText: "листай →",
  includeCta: false,
  templateId: null,
};

export const SWIPE_PRESETS = [
  "листай →",
  "дальше →",
  "ещё →",
  "swipe →",
  "next →",
] as const;

export function normalizeGenerateOptions(
  raw: Partial<CarouselGenerateOptions> | null | undefined,
): CarouselGenerateOptions {
  const base = DEFAULT_GENERATE_OPTIONS;
  const sentences = Math.min(8, Math.max(1, Math.round(Number(raw?.sentences) || base.sentences)));
  const edgeCount = Math.min(4, Math.max(0, Math.round(Number(raw?.edgeCount) || 0)));
  const heading =
    raw?.headingPosition === "top" ||
    raw?.headingPosition === "center" ||
    raw?.headingPosition === "bottom"
      ? raw.headingPosition
      : base.headingPosition;
  const swipeText =
    typeof raw?.swipeText === "string" && raw.swipeText.trim()
      ? raw.swipeText.trim().slice(0, 24)
      : base.swipeText;

  const templateId =
    typeof raw?.templateId === "string" && raw.templateId.trim()
      ? raw.templateId.trim()
      : null;

  return {
    headingPosition: heading,
    sentences,
    edgeCount,
    swipeHint: Boolean(raw?.swipeHint ?? base.swipeHint),
    swipeText,
    includeCta: Boolean(raw?.includeCta ?? base.includeCta),
    templateId,
  };
}

/** Edge chrome labels — local, no extra model tokens. */
export function edgeLabelsForSlide(input: {
  edgeCount: number;
  handle: string;
  slideIndex: number;
  slideCount: number;
  heading: string;
  includeCta: boolean;
  isLast: boolean;
}): string[] {
  const handle = input.handle.replace(/^@/, "");
  const pool = [
    `@${handle}`,
    `${input.slideIndex + 1} / ${input.slideCount}`,
    input.isLast && input.includeCta ? "cta" : "tip",
    cleanEdgeBit(input.heading),
  ];
  return pool.slice(0, input.edgeCount).filter(Boolean);
}

function cleanEdgeBit(heading: string): string {
  const word = heading.trim().split(/\s+/)[0] || "note";
  return word.slice(0, 14).toLowerCase();
}
