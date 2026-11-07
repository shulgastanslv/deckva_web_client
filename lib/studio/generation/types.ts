export type GenerationKind = "text" | "palette" | "carousel";

export type StudioPromptSubmit = {
  topic: string;
  type: GenerationKind;
  /** Optional lineage when continuing a pipeline step. */
  parentArtifactId?: string | null;
};
