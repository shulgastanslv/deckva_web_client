import type { LucideIcon } from "lucide-react";
import { FileText, LayoutTemplate, Palette } from "lucide-react";

import { GenerationKind } from "@/lib/studio/generation/types";

export type GenerationBrowseTab = "texts" | "palettes" | "carousels";

export type GenerationTypeDef = {
  kind: GenerationKind;
  label: string;
  placeholder: string;
  browseSection: GenerationBrowseTab;
  browseTab: GenerationBrowseTab;
  nextSteps: GenerationKind[];
  /** Secondary prep steps — shown quieter in the UI. */
  helperSteps?: GenerationKind[];
  icon: LucideIcon;
  /** One-line job description for the create UI. */
  job: string;
};

export const GENERATION_REGISTRY: Record<GenerationKind, GenerationTypeDef> = {
  [GenerationKind.carousel]: {
    kind: GenerationKind.carousel,
    label: "Carousel",
    placeholder: "What should this carousel be about?",
    browseSection: "carousels",
    browseTab: "carousels",
    nextSteps: [],
    helperSteps: [GenerationKind.text, GenerationKind.palette],
    icon: LayoutTemplate,
    job: "The main output — slides ready to edit and export",
  },
  [GenerationKind.text]: {
    kind: GenerationKind.text,
    label: "Caption",
    placeholder: "Draft the post caption or talking points…",
    browseSection: "texts",
    browseTab: "texts",
    nextSteps: [GenerationKind.carousel],
    helperSteps: [GenerationKind.palette],
    icon: FileText,
    job: "Optional prep — caption that feeds the carousel",
  },
  [GenerationKind.palette]: {
    kind: GenerationKind.palette,
    label: "Palette",
    placeholder: "Describe the mood or brand colors…",
    browseSection: "palettes",
    browseTab: "palettes",
    nextSteps: [GenerationKind.carousel],
    helperSteps: [GenerationKind.text],
    icon: Palette,
    job: "Optional prep — colors locked into the carousel",
  },
};

/** Create UI order: carousel first, helpers after. */
export const GENERATION_TYPES: GenerationTypeDef[] = [
  GENERATION_REGISTRY[GenerationKind.carousel],
  GENERATION_REGISTRY[GenerationKind.text],
  GENERATION_REGISTRY[GenerationKind.palette],
];

export function getGenerationType(kind: GenerationKind): GenerationTypeDef {
  return GENERATION_REGISTRY[kind];
}

export function isGenerationKind(value: string): value is GenerationKind {
  return (
    value === GenerationKind.text ||
    value === GenerationKind.palette ||
    value === GenerationKind.carousel
  );
}
