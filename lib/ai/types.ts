import type { AiPalette } from "@/lib/ai/generate-palette";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import type { GenerationEntitlement } from "@/lib/studio/generations";

/** Upstream CORA catalog plan id (we always request full catalog). */
export type AiPlanId = "free" | "pro";
export type AiCoraMode = "fast" | "thinking";

export type AiModelInfo = {
  modelId: string;
  displayName: string;
  tier: "economy" | "standard" | "premium";
  openRouterSlug: string;
  enabled: boolean;
};

export type GenerateCarouselAttachment = {
  name: string;
  kind: "image" | "text";
  dataUrl?: string;
  text?: string;
  role?: "cover" | "slide";
};

export type GenerateCarouselInput = {
  userId: string;
  topic: string;
  /** Optional long caption / seed appended to the topic for the LLM. */
  seedText?: string;
  aspectRatio?: RatioKey;
  slidesCount?: number;
  language?: string;
  handle?: string;
  cover?: string;
  /** Prompt skill → server carousel structure. */
  skillId?: string;
  /** Extra images / notes for CORA (cover still via `cover`). */
  attachments?: GenerateCarouselAttachment[];
  modelId?: string;
  plan?: AiPlanId;
  mode?: AiCoraMode;
};

export type GenerateCarouselResult = {
  coraRunId: string;
  title: string;
  aspectRatio: RatioKey;
  width: number;
  height: number;
  slides: FabricCanvasJSON[];
  palette?: AiPalette;
  modelId: string;
  entitlement: GenerationEntitlement;
};
