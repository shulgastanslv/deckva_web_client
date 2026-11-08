/**
 * Carousel-first creation pipeline.
 *
 * Product rule: the primary outcome is a carousel. Text and palette are
 * optional prep steps that feed content and colors into carousel generation.
 */
import type { AiPalette } from "@/lib/ai/generate-palette";
import { GenerationKind } from "@/lib/studio/generation/types";
import type { RatioKey } from "@/lib/types";

export type PipelinePalette = AiPalette;

/** Everything the carousel generator should inherit from earlier steps. */
export type CarouselPipelineContext = {
  /** Short topic / title for the project and AI. */
  topic: string;
  /** Full post caption from a TEXT artifact, when available. */
  seedText?: string;
  /** Locked colors from a PALETTE artifact, when available. */
  palette?: PipelinePalette;
  /** Immediate parent artifact id (text or palette). */
  parentArtifactId?: string | null;
  cover?: string;
  aspectRatio?: RatioKey;
  slidesCount?: number;
  language?: string;
  handle?: string;
};

export const PIPELINE_PRIMARY: GenerationKind = GenerationKind.carousel;

/** Optional prep steps that should feel secondary to carousel. */
export const PIPELINE_HELPERS: GenerationKind[] = [
  GenerationKind.text,
  GenerationKind.palette,
];

export function pipelineHeadline(): string {
  return "Make a carousel";
}

export function pipelineSubhead(): string {
  return "Describe the topic. Optionally draft caption or colors first — then generate the slides.";
}

export function draftTopicFromText(
  text: string,
  fallback = "Untitled carousel",
): string {
  const line =
    text
      .split(/\n+/)
      .map((part) => part.trim())
      .find(Boolean) || fallback;
  return line.length > 80 ? `${line.slice(0, 77).trimEnd()}…` : line;
}

/** Enrich the AI topic when we already have a full caption. */
export function topicForCarouselGeneration(
  ctx: CarouselPipelineContext,
): string {
  const seed = ctx.seedText?.trim();
  if (!seed) return ctx.topic.trim();
  const topic = ctx.topic.trim();
  if (!topic || seed.startsWith(topic)) return seed;
  return `${topic}\n\n${seed}`;
}
