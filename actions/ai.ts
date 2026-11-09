"use server";

import { requireUserId } from "@/lib/auth/session";
import {
  consumeFreeGeneration,
  getGenerationEntitlement,
  refundFreeGeneration,
} from "@/lib/billing/generations";
import { userHasPro } from "@/lib/billing/entitlements";
import {
  generateCarouselUpstream,
  type GenerateCarouselInput,
  type GenerateCarouselResult,
} from "@/lib/ai/generate";
import { listAiModelsUpstream } from "@/lib/ai/models";
import type { AiPlanId } from "@/lib/ai/types";
import { messages } from "@/lib/messages";
import { freeGenerationLimitMessage } from "@/lib/studio/plans";

async function aiPlan(userId: string): Promise<AiPlanId> {
  return (await userHasPro(userId)) ? "pro" : "free";
}

export async function listAiModels() {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);
  const plan = await aiPlan(userId);
  return listAiModelsUpstream(plan);
}

/** Free generations left / Pro flag for UI chips. */
export async function getGenerationStatus() {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);
  const plan = await aiPlan(userId);
  const entitlement = await getGenerationEntitlement(userId);
  return { plan, entitlement };
}

/** @deprecated Use getGenerationStatus */
export async function getAiWallet() {
  return getGenerationStatus();
}

/**
 * Gate on Pro or free quota, then run CORA.
 * Refunds the free-generation consume if CORA fails.
 */
export async function generateCarousel(
  input: Omit<GenerateCarouselInput, "userId" | "plan"> & {
    projectId?: string;
  },
): Promise<GenerateCarouselResult> {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);
  const plan = await aiPlan(userId);

  const before = await getGenerationEntitlement(userId);
  if (!before.canGenerate) {
    throw new Error(freeGenerationLimitMessage());
  }

  let consumed = false;
  if (!before.isPro) {
    await consumeFreeGeneration(userId);
    consumed = true;
  }

  const modelId = input.modelId?.trim() || "gemini-flash";
  const slidesCount = input.slidesCount ?? 7;

  try {
    const result = await generateCarouselUpstream({
      ...input,
      userId,
      plan,
      modelId,
      slidesCount,
    });

    return {
      ...result,
      entitlement: await getGenerationEntitlement(userId),
    };
  } catch (error) {
    if (consumed) {
      await refundFreeGeneration(userId);
    }
    throw error;
  }
}
