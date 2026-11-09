import type { AiPalette } from "@/lib/ai/generate-palette";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import type { GenerationEntitlement } from "@/lib/billing/generations";

export type AiPlanId = "free" | "pro";
export type AiCoraMode = "fast" | "thinking";

export type AiModelInfo = {
  modelId: string;
  displayName: string;
  tier: "economy" | "standard" | "premium";
  openRouterSlug: string;
  enabled: boolean;
  /** OpenRouter $0 model (`:free`). */
  isFree: boolean;
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
  /** Post caption assembled from slide copy (heading lines). */
  caption?: string;
  modelId: string;
  entitlement: GenerationEntitlement;
};
