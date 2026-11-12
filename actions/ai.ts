"use server";

import { requireUserId } from "@/lib/auth/session";
import {
  consumeGeneration,
  generationBlockedMessage,
  getGenerationEntitlement,
  refundGeneration,
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

async function aiPlan(userId: string): Promise<AiPlanId> {
  return (await userHasPro(userId)) ? "pro" : "free";
}

export async function listAiModels() {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);
  const plan = await aiPlan(userId);
  return listAiModelsUpstream(plan);
}

/** Free generations left / Pro credits for UI chips. */
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
 * Gate on Pro credits or free quota, then run CORA.
 * Refunds the consume if CORA fails.
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
    throw new Error(generationBlockedMessage(before));
  }

  const modelId = input.modelId?.trim() || "gemini-flash";
  const slidesCount = input.slidesCount ?? 7;

  const consumed = await consumeGeneration(userId, {
    modelId,
    projectId: input.projectId,
  });

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
    await refundGeneration(userId, consumed.creditTakes);
    throw error;
  }
}
