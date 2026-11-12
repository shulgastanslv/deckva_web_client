import {
  CreditBucket,
  CreditLedgerKind,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  CREDIT_PACK_CREDITS,
  GENERATION_CREDIT_COST,
  PRO_MONTHLY_CREDITS,
  creditsExhaustedMessage,
} from "@/lib/studio/plans";

export type CreditBalance = {
  plan: number;
  topup: number;
  total: number;
};

function toBalance(user: {
  creditPlanBalance: number;
  creditTopupBalance: number;
}): CreditBalance {
  const plan = user.creditPlanBalance;
  const topup = user.creditTopupBalance;
  return { plan, topup, total: plan + topup };
}

export async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditPlanBalance: true, creditTopupBalance: true },
  });
  if (!user) return { plan: 0, topup: 0, total: 0 };
  return toBalance(user);
}

/**
 * Grant (or top up) monthly plan credits. Replaces plan balance with the
 * monthly allotment so unused plan credits do not stack forever; top-ups stay.
 */
export async function grantPlanCredits(
  userId: string,
  amount = PRO_MONTHLY_CREDITS,
  meta?: Record<string, unknown>,
): Promise<CreditBalance> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { creditPlanBalance: amount },
      select: { creditPlanBalance: true, creditTopupBalance: true },
    });
    await tx.creditLedgerEntry.create({
      data: {
        userId,
        kind: CreditLedgerKind.GRANT,
        bucket: CreditBucket.PLAN,
        amount,
        balanceAfter: user.creditPlanBalance + user.creditTopupBalance,
        meta: { reason: "plan_grant", ...meta },
      },
    });
    return toBalance(user);
  });
}

/** Add purchased top-up credits. */
export async function grantTopupCredits(
  userId: string,
  amount = CREDIT_PACK_CREDITS,
  meta?: Record<string, unknown>,
): Promise<CreditBalance> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { creditTopupBalance: { increment: amount } },
      select: { creditPlanBalance: true, creditTopupBalance: true },
    });
    await tx.creditLedgerEntry.create({
      data: {
        userId,
        kind: CreditLedgerKind.GRANT,
        bucket: CreditBucket.TOPUP,
        amount,
        balanceAfter: user.creditPlanBalance + user.creditTopupBalance,
        meta: { reason: "topup_purchase", ...meta },
      },
    });
    return toBalance(user);
  });
}

/**
 * Debit credits plan → topup. Throws when balance is insufficient.
 */
export async function spendCredits(input: {
  userId: string;
  amount?: number;
  modelId?: string;
  coraRunId?: string;
  projectId?: string;
}): Promise<{
  balance: CreditBalance;
  spent: number;
  takes: Array<{ bucket: CreditBucket; take: number }>;
}> {
  const amount = input.amount ?? GENERATION_CREDIT_COST;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: input.userId },
      select: { creditPlanBalance: true, creditTopupBalance: true },
    });
    if (!user) throw new Error("User not found");

    const takes: Array<{ bucket: CreditBucket; take: number }> = [];
    let need = amount;
    for (const [bucket, available] of [
      [CreditBucket.PLAN, user.creditPlanBalance],
      [CreditBucket.TOPUP, user.creditTopupBalance],
    ] as const) {
      if (need <= 0) break;
      const take = Math.min(available, need);
      if (take > 0) {
        takes.push({ bucket, take });
        need -= take;
      }
    }
    if (need > 0) throw new Error(creditsExhaustedMessage());

    let nextPlan = user.creditPlanBalance;
    let nextTopup = user.creditTopupBalance;
    for (const { bucket, take } of takes) {
      if (bucket === CreditBucket.PLAN) nextPlan -= take;
      if (bucket === CreditBucket.TOPUP) nextTopup -= take;
    }

    await tx.user.update({
      where: { id: input.userId },
      data: {
        creditPlanBalance: nextPlan,
        creditTopupBalance: nextTopup,
      },
    });

    let runningTotal = nextPlan + nextTopup + amount;
    for (const { bucket, take } of takes) {
      runningTotal -= take;
      await tx.creditLedgerEntry.create({
        data: {
          userId: input.userId,
          kind: CreditLedgerKind.SPEND,
          bucket,
          amount: take,
          balanceAfter: runningTotal,
          modelId: input.modelId,
          coraRunId: input.coraRunId,
          projectId: input.projectId,
        },
      });
    }

    return {
      balance: { plan: nextPlan, topup: nextTopup, total: nextPlan + nextTopup },
      spent: amount,
      takes,
    };
  });
}

/** Undo a spend (failed generation). Restores the same buckets. */
export async function refundCredits(input: {
  userId: string;
  takes: Array<{ bucket: CreditBucket; take: number }>;
  modelId?: string;
  coraRunId?: string;
  projectId?: string;
}): Promise<CreditBalance> {
  if (input.takes.length === 0) return getCreditBalance(input.userId);

  return prisma.$transaction(async (tx) => {
    let planInc = 0;
    let topupInc = 0;
    for (const { bucket, take } of input.takes) {
      if (bucket === CreditBucket.PLAN) planInc += take;
      if (bucket === CreditBucket.TOPUP) topupInc += take;
    }

    const user = await tx.user.update({
      where: { id: input.userId },
      data: {
        creditPlanBalance: planInc ? { increment: planInc } : undefined,
        creditTopupBalance: topupInc ? { increment: topupInc } : undefined,
      },
      select: { creditPlanBalance: true, creditTopupBalance: true },
    });

    let running = user.creditPlanBalance + user.creditTopupBalance;
    // Ledger entries were written spend-first; reverse in reverse order conceptually.
    for (const { bucket, take } of input.takes) {
      await tx.creditLedgerEntry.create({
        data: {
          userId: input.userId,
          kind: CreditLedgerKind.REFUND,
          bucket,
          amount: take,
          balanceAfter: running,
          modelId: input.modelId,
          coraRunId: input.coraRunId,
          projectId: input.projectId,
          meta: { reason: "generation_failed" },
        },
      });
    }

    return toBalance(user);
  });
}
