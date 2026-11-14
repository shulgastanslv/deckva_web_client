import type { AiModelInfo } from "@/lib/ai/types";
import {
  CREDIT_PACK_CREDITS,
  CREDIT_PACK_PRICE,
  GENERATION_CREDIT_COST,
} from "@/lib/studio/plans";

/** Credits charged per successful generation by model tier (Pro wallet). */
export const MODEL_CREDIT_COST = {
  free: 0,
  economy: 1,
  standard: 2,
  premium: 3,
} as const;

export function creditCostForModel(
  model: Pick<AiModelInfo, "tier" | "isFree"> | null | undefined,
): number {
  if (!model) return GENERATION_CREDIT_COST;
  if (model.isFree) return MODEL_CREDIT_COST.free;
  if (model.tier === "premium") return MODEL_CREDIT_COST.premium;
  if (model.tier === "standard") return MODEL_CREDIT_COST.standard;
  return MODEL_CREDIT_COST.economy;
}

/** Resolve cost from catalog row when available. */
export function creditCostFromCatalog(
  modelId: string | null | undefined,
  models: AiModelInfo[],
): number {
  const model = models.find((m) => m.modelId === modelId);
  if (model) return creditCostForModel(model);
  return creditCostForModelId(modelId);
}

/**
 * Server-side / fallback pricing from modelId when the catalog row isn’t loaded.
 * Keep in sync with deckva_ai catalog tiers.
 */
export function creditCostForModelId(modelId: string | null | undefined): number {
  const id = (modelId || "").toLowerCase();
  if (!id) return GENERATION_CREDIT_COST;
  if (id.includes("free") || id.endsWith("-free")) return MODEL_CREDIT_COST.free;
  if (id.includes("opus")) return MODEL_CREDIT_COST.premium;
  if (
    id.includes("sonnet") ||
    id === "gemini-pro" ||
    id.includes("deepseek-v3") ||
    (id.includes("gpt-4.1") && !id.includes("mini"))
  ) {
    return MODEL_CREDIT_COST.standard;
  }
  return MODEL_CREDIT_COST.economy;
}

/** Approximate BYN price from the credit pack rate. */
export function approxBynForCredits(credits: number): number {
  if (credits <= 0 || CREDIT_PACK_CREDITS <= 0) return 0;
  return Math.round((CREDIT_PACK_PRICE / CREDIT_PACK_CREDITS) * credits * 100) / 100;
}

export function formatModelPriceLabel(
  model: Pick<AiModelInfo, "tier" | "isFree"> | null | undefined,
  opts?: { freeLabel?: string; creditsLabel?: (n: number) => string },
): string {
  const cost = creditCostForModel(model);
  if (cost <= 0) return opts?.freeLabel ?? "Free";
  if (opts?.creditsLabel) return opts.creditsLabel(cost);
  return `${cost} cr`;
}
