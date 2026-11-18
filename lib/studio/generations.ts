import { prisma } from "@/lib/prisma";
import { UserRole, isPlatformAdmin } from "@/lib/roles";
import { resolveUnlimitedGenerations } from "@/lib/studio/admin-unlimited";
import {
  DAILY_GENERATION_LIMIT,
  dailyGenerationLimitMessage,
} from "@/lib/studio/plans";

export type GenerationEntitlement = {
  used: number;
  limit: number;
  remaining: number;
  canGenerate: boolean;
  /** DB flag `User.unlimitedGenerations` (admins). */
  unlimited: boolean;
  /** UTC calendar day key (YYYY-MM-DD). */
  dayKey: string;
};

export type GenerationDayPoint = {
  dayKey: string;
  count: number;
};

export type GenerationUsageStats = {
  total: number;
  mostActiveMonth: string | null;
  mostActiveDay: string | null;
  longestStreak: number;
  currentStreak: number;
};

export type GenerationUsageOverview = {
  entitlement: GenerationEntitlement;
  days: GenerationDayPoint[];
  stats: GenerationUsageStats;
};

/** UTC calendar day as YYYY-MM-DD. */
export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function toEntitlement(
  used: number,
  dayKey: string,
  unlimited = false,
): GenerationEntitlement {
  const capped = Math.max(0, used);
  if (unlimited) {
    return {
      used: capped,
      limit: 0,
      remaining: 0,
      canGenerate: true,
      unlimited: true,
      dayKey,
    };
  }
  const remaining = Math.max(0, DAILY_GENERATION_LIMIT - capped);
  return {
    used: capped,
    limit: DAILY_GENERATION_LIMIT,
    remaining,
    canGenerate: remaining > 0,
    unlimited: false,
    dayKey,
  };
}

async function readDailyUsage(userId: string): Promise<{
  used: number;
  dayKey: string;
  unlimited: boolean;
}> {
  const today = utcDayKey();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      generationsUsedToday: true,
      generationDayKey: true,
      role: true,
      unlimitedGenerations: true,
    },
  });
  if (!user) {
    return { used: 0, dayKey: today, unlimited: false };
  }
  const unlimited = await resolveUnlimitedGenerations(user);
  if (user.generationDayKey !== today) {
    return { used: 0, dayKey: today, unlimited };
  }
  return { used: user.generationsUsedToday, dayKey: today, unlimited };
}

export async function getGenerationEntitlement(
  userId: string,
): Promise<GenerationEntitlement> {
  const { used, dayKey, unlimited } = await readDailyUsage(userId);
  return toEntitlement(used, dayKey, unlimited);
}

function shiftUtcDay(dayKey: string, delta: number): string {
  const d = new Date(`${dayKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function computeUsageStats(days: GenerationDayPoint[]): GenerationUsageStats {
  const total = days.reduce((sum, d) => sum + d.count, 0);

  let mostActiveDay: string | null = null;
  let mostActiveCount = 0;
  const monthTotals = new Map<string, number>();

  for (const day of days) {
    if (day.count > mostActiveCount) {
      mostActiveCount = day.count;
      mostActiveDay = day.dayKey;
    }
    if (day.count > 0) {
      const month = day.dayKey.slice(0, 7);
      monthTotals.set(month, (monthTotals.get(month) ?? 0) + day.count);
    }
  }

  let mostActiveMonth: string | null = null;
  let monthMax = 0;
  for (const [month, count] of monthTotals) {
    if (count > monthMax) {
      monthMax = count;
      mostActiveMonth = month;
    }
  }

  let longestStreak = 0;
  let run = 0;
  for (const day of days) {
    if (day.count > 0) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i]!;
    if (day.count > 0) {
      currentStreak += 1;
      continue;
    }
    // Allow today to be empty without breaking streak ending yesterday.
    if (i === days.length - 1) continue;
    break;
  }

  return {
    total,
    mostActiveMonth,
    mostActiveDay: mostActiveCount > 0 ? mostActiveDay : null,
    longestStreak,
    currentStreak,
  };
}

/** Last N UTC days inclusive of today, filled with zeros when missing. */
export async function getGenerationHistory(
  userId: string,
  daysBack = 182,
): Promise<GenerationDayPoint[]> {
  const today = utcDayKey();
  const start = shiftUtcDay(today, -(daysBack - 1));

  const rows = await prisma.generationDay.findMany({
    where: {
      userId,
      dayKey: { gte: start, lte: today },
    },
    select: { dayKey: true, count: true },
  });

  const byDay = new Map(rows.map((r) => [r.dayKey, Math.max(0, r.count)]));

  // Keep User.today counter as source of truth if history row lags.
  const { used, dayKey } = await readDailyUsage(userId);
  if (dayKey === today && used > 0) {
    byDay.set(today, used);
  }

  const out: GenerationDayPoint[] = [];
  for (let i = 0; i < daysBack; i += 1) {
    const key = shiftUtcDay(start, i);
    out.push({ dayKey: key, count: byDay.get(key) ?? 0 });
  }
  return out;
}

export async function getGenerationUsageOverview(
  userId: string,
  daysBack = 182,
): Promise<GenerationUsageOverview> {
  const [entitlement, days] = await Promise.all([
    getGenerationEntitlement(userId),
    getGenerationHistory(userId, daysBack),
  ]);
  return {
    entitlement,
    days,
    stats: computeUsageStats(days),
  };
}

export type ConsumeGenerationResult = {
  entitlement: GenerationEntitlement;
};

type DbClient = Pick<typeof prisma, "generationDay">;

async function bumpGenerationDay(
  tx: DbClient,
  userId: string,
  dayKey: string,
  delta: number,
) {
  if (delta === 0) return;
  if (delta > 0) {
    await tx.generationDay.upsert({
      where: { userId_dayKey: { userId, dayKey } },
      create: { userId, dayKey, count: delta },
      update: { count: { increment: delta } },
    });
    return;
  }

  const existing = await tx.generationDay.findUnique({
    where: { userId_dayKey: { userId, dayKey } },
    select: { count: true },
  });
  if (!existing) return;
  const next = Math.max(0, existing.count + delta);
  if (next === 0) {
    await tx.generationDay.delete({
      where: { userId_dayKey: { userId, dayKey } },
    });
    return;
  }
  await tx.generationDay.update({
    where: { userId_dayKey: { userId, dayKey } },
    data: { count: next },
  });
}

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
        id: true,
        generationsUsedToday: true,
        generationDayKey: true,
        role: true,
        unlimitedGenerations: true,
      },
    });
    if (!user) throw new Error("User not found");

    let unlimited = user.unlimitedGenerations;
    if (!unlimited && isPlatformAdmin(user.role)) {
      await tx.user.update({
        where: { id: userId },
        data: {
          unlimitedGenerations: true,
          role: UserRole.ADMIN,
        },
      });
      unlimited = true;
    }

    const usedToday =
      user.generationDayKey === today ? user.generationsUsedToday : 0;

    if (!unlimited && usedToday >= DAILY_GENERATION_LIMIT) {
      throw new Error(dailyGenerationLimitMessage());
    }

    const row = await tx.user.update({
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

    await bumpGenerationDay(tx, userId, today, 1);
    return { row, unlimited };
  });

  return {
    entitlement: toEntitlement(
      updated.row.generationsUsedToday,
      updated.row.generationDayKey ?? today,
      updated.unlimited,
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
    await bumpGenerationDay(tx, userId, today, -1);
  });

  return getGenerationEntitlement(userId);
}

export function generationBlockedMessage() {
  return dailyGenerationLimitMessage();
}
