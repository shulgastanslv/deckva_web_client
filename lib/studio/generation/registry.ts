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
  nextSteps: GenerationKind[];
  icon: LucideIcon;
};

export const GENERATION_REGISTRY: Record<GenerationKind, GenerationTypeDef> = {
  text: {
    kind: "text",
    label: "Text",
    placeholder: "Describe the topic or draft for a post caption…",
    browseSection: "texts",
    browseTab: "texts",
    nextSteps: ["palette", "carousel"],
    icon: FileText,
  },
  palette: {
    kind: "palette",
    label: "Palette",
    placeholder: "Describe the mood or brand for palette generation…",
    browseSection: "palettes",
    browseTab: "palettes",
    nextSteps: ["carousel", "text"],
    icon: Palette,
  },
  carousel: {
    kind: "carousel",
    label: "Carousel Design",
    placeholder: "Describe the content and style for carousel design…",
    browseSection: "carousels",
    browseTab: "carousels",
    nextSteps: ["text", "palette"],
    icon: LayoutTemplate,
  },
};

export const GENERATION_TYPES: GenerationTypeDef[] = [
  GENERATION_REGISTRY.text,
  GENERATION_REGISTRY.palette,
  GENERATION_REGISTRY.carousel,
];

export function getGenerationType(kind: GenerationKind): GenerationTypeDef {
  return GENERATION_REGISTRY[kind];
}

export function isGenerationKind(value: string): value is GenerationKind {
  return value === "text" || value === "palette" || value === "carousel";
}
