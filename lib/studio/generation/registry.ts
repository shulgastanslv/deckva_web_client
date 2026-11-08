import type { LucideIcon } from "lucide-react";
import { FileText, LayoutTemplate, Palette } from "lucide-react";

import type { GenerationKind } from "@/lib/studio/generation/types";

export type GenerationBrowseTab = "texts" | "palettes" | "carousels";

export type GenerationTypeDef = {
  kind: GenerationKind;
  label: string;
  placeholder: string;
  browseSection: GenerationBrowseTab;
  browseTab: GenerationBrowseTab;
  /** Preferred next step toward a carousel (or empty when already there). */
  nextSteps: GenerationKind[];
  /** Secondary prep steps — shown quieter in the UI. */
  helperSteps?: GenerationKind[];
  icon: LucideIcon;
  /** One-line job description for the create UI. */
  job: string;
};

export const GENERATION_REGISTRY: Record<GenerationKind, GenerationTypeDef> = {
  carousel: {
    kind: "carousel",
    label: "Carousel",
    placeholder: "What should this carousel be about?",
    browseSection: "carousels",
    browseTab: "carousels",
    nextSteps: [],
    helperSteps: ["text", "palette"],
    icon: LayoutTemplate,
    job: "The main output — slides ready to edit and export",
  },
  text: {
    kind: "text",
    label: "Caption",
    placeholder: "Draft the post caption or talking points…",
    browseSection: "texts",
    browseTab: "texts",
    nextSteps: ["carousel"],
    helperSteps: ["palette"],
    icon: FileText,
    job: "Optional prep — caption that feeds the carousel",
  },
  palette: {
    kind: "palette",
    label: "Palette",
    placeholder: "Describe the mood or brand colors…",
    browseSection: "palettes",
    browseTab: "palettes",
    nextSteps: ["carousel"],
    helperSteps: ["text"],
    icon: Palette,
    job: "Optional prep — colors locked into the carousel",
  },
};

/** Create UI order: carousel first, helpers after. */
export const GENERATION_TYPES: GenerationTypeDef[] = [
  GENERATION_REGISTRY.carousel,
  GENERATION_REGISTRY.text,
  GENERATION_REGISTRY.palette,
];

export function getGenerationType(kind: GenerationKind): GenerationTypeDef {
  return GENERATION_REGISTRY[kind];
}

export function isGenerationKind(value: string): value is GenerationKind {
  return value === "text" || value === "palette" || value === "carousel";
}
