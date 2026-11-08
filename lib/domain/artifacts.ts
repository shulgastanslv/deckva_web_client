/**
 * Artifact / generation kinds — DB enums (UPPER) and UI generation kinds (lower).
 */
import {
  ArtifactKind,
  ArtifactStatus,
} from "@/lib/generated/prisma/enums";

export { ArtifactKind, ArtifactStatus };

export const GenerationKind = {
  text: "text",
  palette: "palette",
  carousel: "carousel",
} as const;

export type GenerationKind =
  (typeof GenerationKind)[keyof typeof GenerationKind];

const GENERATION_TO_ARTIFACT: Record<GenerationKind, ArtifactKind> = {
  [GenerationKind.text]: ArtifactKind.TEXT,
  [GenerationKind.palette]: ArtifactKind.PALETTE,
  [GenerationKind.carousel]: ArtifactKind.CAROUSEL,
};

const ARTIFACT_TO_GENERATION: Record<ArtifactKind, GenerationKind> = {
  [ArtifactKind.TEXT]: GenerationKind.text,
  [ArtifactKind.PALETTE]: GenerationKind.palette,
  [ArtifactKind.CAROUSEL]: GenerationKind.carousel,
};

export function artifactKindFromGeneration(kind: GenerationKind): ArtifactKind {
  return GENERATION_TO_ARTIFACT[kind];
}

export function generationKindFromArtifact(kind: ArtifactKind): GenerationKind {
  return ARTIFACT_TO_GENERATION[kind];
}

export function isArtifactKind(value: unknown): value is ArtifactKind {
  return (
    value === ArtifactKind.TEXT ||
    value === ArtifactKind.PALETTE ||
    value === ArtifactKind.CAROUSEL
  );
}
