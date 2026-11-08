export { GenerationKind } from "@/lib/domain/artifacts";

import type { GenerationKind } from "@/lib/domain/artifacts";

export type StudioPromptSubmit = {
  topic: string;
  type: GenerationKind;
  /** Optional lineage when continuing a pipeline step. */
  parentArtifactId?: string | null;
};
