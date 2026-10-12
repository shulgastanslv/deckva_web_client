export type HeadingPosition = "top" | "center" | "bottom";

export interface CarouselGenerateOptions {
  headingPosition: HeadingPosition;
  /** Exact sentence count for each slide body */
  sentences: number;
  /** How many short labels sit on the slide edges (0–4) */
  edgeCount: number;
  /** Fill AI copy into this template instead of the default layout */
  templateId: string | null;
}

export const DEFAULT_GENERATE_OPTIONS: CarouselGenerateOptions = {
  headingPosition: "center",
  sentences: 2,
  edgeCount: 2,
  templateId: null,
};

export function normalizeGenerateOptions(
  raw: Partial<CarouselGenerateOptions> | null | undefined,
): CarouselGenerateOptions {
  const base = DEFAULT_GENERATE_OPTIONS;
  const heading =
    raw?.headingPosition === "top" ||
    raw?.headingPosition === "center" ||
    raw?.headingPosition === "bottom"
      ? raw.headingPosition
      : base.headingPosition;

  return {
    headingPosition: heading,
    sentences: Math.min(8, Math.max(1, Math.round(Number(raw?.sentences) || base.sentences))),
    edgeCount: Math.min(4, Math.max(0, Math.round(Number(raw?.edgeCount) || 0))),
    templateId:
      typeof raw?.templateId === "string" && raw.templateId.trim()
        ? raw.templateId.trim()
        : null,
  };
}
/** Edge chrome labels — local, no extra model tokens. */
export function edgeLabelsForSlide(input: {
  edgeCount: number;
  handle: string;
  slideIndex: number;
  slideCount: number;
  heading: string;
}): string[] {
  const handle = input.handle.replace(/^@/, "");
  const word = input.heading.trim().split(/\s+/)[0]?.slice(0, 14).toLowerCase() || "note";
  return [`@${handle}`, `${input.slideIndex + 1} / ${input.slideCount}`, "tip", word]
    .slice(0, input.edgeCount)
    .filter(Boolean);
}

