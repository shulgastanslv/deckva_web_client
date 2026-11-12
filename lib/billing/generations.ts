import { userHasPro } from "@/lib/billing/entitlements";
import {
  getCreditBalance,
  refundCredits,
  spendCredits,
  type CreditBalance,
} from "@/lib/billing/credits";
import type { CreditBucket } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  FREE_GENERATION_LIMIT,
  GENERATION_CREDIT_COST,
  PRO_MONTHLY_CREDITS,
  creditsExhaustedMessage,
  freeGenerationLimitMessage,
} from "@/lib/studio/plans";

export type GenerationEntitlement = {
  isPro: boolean;
  used: number;
  limit: number;
  remaining: number;
  canGenerate: boolean;
  /** Pro wallet breakdown; null on free plan. */
  credits: CreditBalance | null;
};

export async function getGenerationEntitlement(
  userId: string,
): Promise<GenerationEntitlement> {
  const isPro = await userHasPro(userId);
  if (isPro) {
    const credits = await getCreditBalance(userId);
    return {
      isPro: true,
      used: Math.max(0, PRO_MONTHLY_CREDITS - credits.plan),
      limit: PRO_MONTHLY_CREDITS,
      remaining: credits.total,
      canGenerate: credits.total >= GENERATION_CREDIT_COST,
      credits,
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
    credits: null,
  };
}

export type ConsumeGenerationResult = {
  entitlement: GenerationEntitlement;
  /** Present when Pro credits were debited (for refund). */
  creditTakes?: Array<{ bucket: CreditBucket; take: number }>;
};

/**
 * Reserve one generation: free quota or Pro credits.
 * Throws when the quota / wallet is exhausted.
 */
export async function consumeGeneration(
  userId: string,
  opts?: { modelId?: string; projectId?: string },
): Promise<ConsumeGenerationResult> {
  if (await userHasPro(userId)) {
    const { balance, takes } = await spendCredits({
      userId,
      amount: GENERATION_CREDIT_COST,
      modelId: opts?.modelId,
      projectId: opts?.projectId,
    });
    return {
      entitlement: {
        isPro: true,
        used: Math.max(0, PRO_MONTHLY_CREDITS - balance.plan),
        limit: PRO_MONTHLY_CREDITS,
        remaining: balance.total,
        canGenerate: balance.total >= GENERATION_CREDIT_COST,
        credits: balance,
      },
      creditTakes: takes,
    };
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
    entitlement: {
      isPro: false,
      used,
      limit: FREE_GENERATION_LIMIT,
      remaining: Math.max(0, FREE_GENERATION_LIMIT - used),
      canGenerate: used < FREE_GENERATION_LIMIT,
      credits: null,
    },
  };
}

/** @deprecated Use consumeGeneration */
export async function consumeFreeGeneration(
  userId: string,
): Promise<GenerationEntitlement> {
  const result = await consumeGeneration(userId);
  return result.entitlement;
}

/** Undo a consume when CORA fails. */
export async function refundGeneration(
  userId: string,
  creditTakes?: Array<{ bucket: CreditBucket; take: number }>,
): Promise<GenerationEntitlement> {
  if (creditTakes && creditTakes.length > 0) {
    await refundCredits({ userId, takes: creditTakes });
    return getGenerationEntitlement(userId);
  }

  if (await userHasPro(userId)) {
    return getGenerationEntitlement(userId);
  }

  await prisma.user.updateMany({
    where: { id: userId, freeGenerationsUsed: { gt: 0 } },
    data: { freeGenerationsUsed: { decrement: 1 } },
  });
  return getGenerationEntitlement(userId);
}

/** @deprecated Use refundGeneration */
export async function refundFreeGeneration(
  userId: string,
): Promise<GenerationEntitlement> {
  return refundGeneration(userId);
}

export function generationBlockedMessage(entitlement: GenerationEntitlement) {
  return entitlement.isPro
    ? creditsExhaustedMessage()
    : freeGenerationLimitMessage();
}
