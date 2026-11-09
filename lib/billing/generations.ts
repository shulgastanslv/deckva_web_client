import { userHasPro } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";
import {
  FREE_GENERATION_LIMIT,
  freeGenerationLimitMessage,
} from "@/lib/studio/plans";

export type GenerationEntitlement = {
  isPro: boolean;
  used: number;
  limit: number;
  remaining: number;
  canGenerate: boolean;
};

export async function getGenerationEntitlement(
  userId: string,
): Promise<GenerationEntitlement> {
  const isPro = await userHasPro(userId);
  if (isPro) {
    return {
      isPro: true,
      used: 0,
      limit: FREE_GENERATION_LIMIT,
      remaining: Number.POSITIVE_INFINITY,
      canGenerate: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeGenerationsUsed: true },
  });
  const used = user?.freeGenerationsUsed ?? 0;
  const remaining = Math.max(0, FREE_GENERATION_LIMIT - used);
  return {
    isPro: false,
    used,
    limit: FREE_GENERATION_LIMIT,
    remaining,
    canGenerate: remaining > 0,
  };
}

/**
 * Reserve one free generation. Pro users are no-ops.
 * Throws if the free quota is exhausted.
 */
export async function consumeFreeGeneration(
  userId: string,
): Promise<GenerationEntitlement> {
  if (await userHasPro(userId)) {
    return getGenerationEntitlement(userId);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { freeGenerationsUsed: true },
    });
    if (!user) throw new Error("User not found");
    if (user.freeGenerationsUsed >= FREE_GENERATION_LIMIT) {
      throw new Error(freeGenerationLimitMessage());
    }
    return tx.user.update({
      where: { id: userId },
      data: { freeGenerationsUsed: { increment: 1 } },
      select: { freeGenerationsUsed: true },
    });
  });

  const used = updated.freeGenerationsUsed;
  return {
    isPro: false,
    used,
    limit: FREE_GENERATION_LIMIT,
    remaining: Math.max(0, FREE_GENERATION_LIMIT - used),
    canGenerate: used < FREE_GENERATION_LIMIT,
  };
}

/** Undo a free-generation consume when CORA fails. */
export async function refundFreeGeneration(
  userId: string,
): Promise<GenerationEntitlement> {
  if (await userHasPro(userId)) {
    return getGenerationEntitlement(userId);
  }

  await prisma.user.updateMany({
    where: { id: userId, freeGenerationsUsed: { gt: 0 } },
    data: { freeGenerationsUsed: { decrement: 1 } },
  });
  return getGenerationEntitlement(userId);
}
