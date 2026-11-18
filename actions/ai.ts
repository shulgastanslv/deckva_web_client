"use server";

import { requireUserId } from "@/lib/auth/session";
import {
  consumeGeneration,
  generationBlockedMessage,
  getGenerationEntitlement,
  getGenerationUsageOverview,
  refundGeneration,
} from "@/lib/studio/generations";
import {
  generateCarouselUpstream,
  type GenerateCarouselInput,
  type GenerateCarouselResult,
} from "@/lib/ai/generate";
import { listAiModelsUpstream } from "@/lib/ai/models";
import { messages } from "@/lib/messages";

/** Full model catalog — daily generation cap is enforced below. */
export async function listAiModels() {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);
  return listAiModelsUpstream();
}

/** Daily generations left for UI chips + heatmap history. */
export async function getGenerationStatus() {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);
  return getGenerationUsageOverview(userId);
}

/**
 * Gate on the daily generation cap, then run CORA.
 * Refunds the consume if CORA fails.
 */
export async function generateCarousel(
  input: Omit<GenerateCarouselInput, "userId"> & {
    projectId?: string;
  },
): Promise<GenerateCarouselResult> {
  const userId = await requireUserId();
  if (!userId) throw new Error(messages.errors.signIn);

  const before = await getGenerationEntitlement(userId);
  if (!before.canGenerate) {
    throw new Error(generationBlockedMessage());
  }

  const modelId = input.modelId?.trim() || "gemini-flash";
  const slidesCount = input.slidesCount ?? 7;

  await consumeGeneration(userId, {
    modelId,
    projectId: input.projectId,
  });

  try {
    const result = await generateCarouselUpstream({
      ...input,
      userId,
      modelId,
      slidesCount,
    });

    return {
      ...result,
      entitlement: await getGenerationEntitlement(userId),
    };
  } catch (error) {
    await refundGeneration(userId);
    throw error;
  }
}
