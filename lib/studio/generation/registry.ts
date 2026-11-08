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
  icon: LucideIcon;
};

export const GENERATION_REGISTRY: Record<GenerationKind, GenerationTypeDef> = {
  [GenerationKind.text]: {
    kind: GenerationKind.text,
    label: "Text",
    placeholder: "Describe the topic or draft for a post caption…",
    browseSection: "texts",
    browseTab: "texts",
    nextSteps: [GenerationKind.palette, GenerationKind.carousel],
    icon: FileText,
  },
  [GenerationKind.palette]: {
    kind: GenerationKind.palette,
    label: "Palette",
    placeholder: "Describe the mood or brand for palette generation…",
    browseSection: "palettes",
    browseTab: "palettes",
    nextSteps: [GenerationKind.carousel, GenerationKind.text],
    icon: Palette,
  },
  [GenerationKind.carousel]: {
    kind: GenerationKind.carousel,
    label: "Carousel Design",
    placeholder: "Describe the content and style for carousel design…",
    browseSection: "carousels",
    browseTab: "carousels",
    nextSteps: [GenerationKind.text, GenerationKind.palette],
    icon: LayoutTemplate,
  },
};

export const GENERATION_TYPES: GenerationTypeDef[] = [
  GENERATION_REGISTRY[GenerationKind.text],
  GENERATION_REGISTRY[GenerationKind.palette],
  GENERATION_REGISTRY[GenerationKind.carousel],
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
