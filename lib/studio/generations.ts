import { prisma } from "@/lib/prisma";
import {
  DAILY_GENERATION_LIMIT,
  dailyGenerationLimitMessage,
} from "@/lib/studio/plans";

export type GenerationEntitlement = {
  used: number;
  limit: number;
  remaining: number;
  canGenerate: boolean;
  /** UTC calendar day key (YYYY-MM-DD). */
  dayKey: string;
};

/** UTC calendar day as YYYY-MM-DD. */
export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function toEntitlement(used: number, dayKey: string): GenerationEntitlement {
  const capped = Math.max(0, used);
  const remaining = Math.max(0, DAILY_GENERATION_LIMIT - capped);
  return {
    used: capped,
    limit: DAILY_GENERATION_LIMIT,
    remaining,
    canGenerate: remaining > 0,
    dayKey,
  };
}

async function readDailyUsage(userId: string): Promise<{
  used: number;
  dayKey: string;
}> {
  const today = utcDayKey();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      generationsUsedToday: true,
      generationDayKey: true,
    },
  });
  if (!user) {
    return { used: 0, dayKey: today };
  }
  if (user.generationDayKey !== today) {
    return { used: 0, dayKey: today };
  }
  return { used: user.generationsUsedToday, dayKey: today };
}

export async function getGenerationEntitlement(
  userId: string,
): Promise<GenerationEntitlement> {
  const { used, dayKey } = await readDailyUsage(userId);
  return toEntitlement(used, dayKey);
}

export type ConsumeGenerationResult = {
  entitlement: GenerationEntitlement;
};

/**
 * Reserve one generation against today's UTC daily cap.
 * Throws when the quota is exhausted.
 */
export async function consumeGeneration(
  userId: string,
  _opts?: { modelId?: string; projectId?: string },
): Promise<ConsumeGenerationResult> {
  const today = utcDayKey();

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        generationsUsedToday: true,
        generationDayKey: true,
      },
    });
    if (!user) throw new Error("User not found");

    const usedToday =
      user.generationDayKey === today ? user.generationsUsedToday : 0;

    if (usedToday >= DAILY_GENERATION_LIMIT) {
      throw new Error(dailyGenerationLimitMessage());
    }

    return tx.user.update({
      where: { id: userId },
      data: {
        generationDayKey: today,
        generationsUsedToday: usedToday + 1,
      },
      select: {
        generationsUsedToday: true,
        generationDayKey: true,
      },
    });
  });

  return {
    entitlement: toEntitlement(
      updated.generationsUsedToday,
      updated.generationDayKey ?? today,
    ),
  };
}

/** Undo a consume when CORA fails. */
export async function refundGeneration(
  userId: string,
): Promise<GenerationEntitlement> {
  const today = utcDayKey();

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        generationsUsedToday: true,
        generationDayKey: true,
      },
    });
    if (!user) return;
    if (user.generationDayKey !== today) return;
    if (user.generationsUsedToday <= 0) return;

    await tx.user.update({
      where: { id: userId },
      data: { generationsUsedToday: { decrement: 1 } },
    });
  });

  return getGenerationEntitlement(userId);
}

export function generationBlockedMessage() {
  return dailyGenerationLimitMessage();
}
