"use client";

import { useMemo } from "react";
import { Infinity as InfinityIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";

import type {
  GenerationDayPoint,
  GenerationUsageStats,
} from "@/lib/studio/generations";
import { cn } from "@/lib/utils";

const LEVELS = 5;

function levelForCount(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.7) return 3;
  return 4;
}

function parseUtc(dayKey: string) {
  return new Date(`${dayKey}T12:00:00.000Z`);
}

function monthLabel(dayKey: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(
    parseUtc(dayKey),
  );
}

function dayLabel(dayKey: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseUtc(dayKey));
}

function monthName(ym: string | null, locale: string) {
  if (!ym) return "—";
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return "—";
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

function streakLabel(n: number, t: ReturnType<typeof useTranslations>) {
  return t("streakDays", { count: n });
}

type Props = {
  days: GenerationDayPoint[];
  stats: GenerationUsageStats;
  remaining: number;
  limit: number;
  unlimited?: boolean;
  className?: string;
};

export function GenerationHeatmap({
  days,
  stats,
  remaining,
  limit,
  unlimited = false,
  className,
}: Props) {
  const t = useTranslations("dialogs.settings");
  const locale = useLocale();

  const { weeks, monthMarks, maxCount } = useMemo(() => {
    const max = Math.max(0, ...days.map((d) => d.count));
    const first = days[0];
    if (!first) {
      return {
        weeks: [] as Array<Array<GenerationDayPoint | null>>,
        monthMarks: [] as Array<{ col: number; label: string }>,
        maxCount: 0,
      };
    }

    const startDow = parseUtc(first.dayKey).getUTCDay(); // 0 Sun
    // Align columns to Monday-first (Mon=0 … Sun=6)
    const mondayOffset = (startDow + 6) % 7;
    const padded: Array<GenerationDayPoint | null> = [
      ...Array.from({ length: mondayOffset }, () => null),
      ...days,
    ];
    while (padded.length % 7 !== 0) padded.push(null);

    const cols: Array<Array<GenerationDayPoint | null>> = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }

    const marks: Array<{ col: number; label: string }> = [];
    let prevMonth = "";
    cols.forEach((col, colIndex) => {
      const firstDay = col.find((d) => d)?.dayKey;
      if (!firstDay) return;
      const label = monthLabel(firstDay, locale);
      if (label !== prevMonth) {
        marks.push({ col: colIndex, label });
        prevMonth = label;
      }
    });

    return { weeks: cols, monthMarks: marks, maxCount: max };
  }, [days, locale]);

  const cellClass = (level: number) =>
    cn(
      "size-2.5 rounded-[3px] sm:size-3",
      level === 0 && "bg-muted/50",
      level === 1 && "bg-primary/25",
      level === 2 && "bg-primary/45",
      level === 3 && "bg-primary/70",
      level === 4 && "bg-primary",
    );

  return (
    <div className={cn("rounded-2xl bg-muted/25 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-muted-foreground">{t("generationsTitle")}</p>
          <p className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums text-foreground">
            {stats.total.toLocaleString(locale)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-muted-foreground">{t("dailyLimit")}</p>
          <p className="mt-0.5 inline-flex items-center justify-end text-[15px] font-medium tabular-nums text-foreground">
            {unlimited ? (
              <InfinityIcon className="size-4" weight="regular" aria-hidden />
            ) : (
              `${remaining}/${limit}`
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          <div
            className="mb-1.5 grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${Math.max(weeks.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map((_, colIndex) => {
              const mark = monthMarks.find((m) => m.col === colIndex);
              return (
                <span
                  key={`m-${colIndex}`}
                  className="h-3 text-[9px] leading-none text-muted-foreground"
                >
                  {mark?.label ?? ""}
                </span>
              );
            })}
          </div>

          <div className="flex gap-1">
            {weeks.map((col, colIndex) => (
              <div key={`w-${colIndex}`} className="flex flex-col gap-1">
                {col.map((day, rowIndex) => {
                  if (!day) {
                    return (
                      <span
                        key={`empty-${colIndex}-${rowIndex}`}
                        className="size-2.5 sm:size-3"
                      />
                    );
                  }
                  const level = levelForCount(day.count, maxCount);
                  return (
                    <span
                      key={day.dayKey}
                      title={`${dayLabel(day.dayKey, locale)} · ${day.count}`}
                      className={cellClass(level)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{t("less")}</span>
          {Array.from({ length: LEVELS }, (_, i) => (
            <span key={i} className={cellClass(i)} />
          ))}
          <span>{t("more")}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("resetsHint")}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/40 pt-3 sm:grid-cols-4">
        <Stat
          label={t("mostActiveMonth")}
          value={monthName(stats.mostActiveMonth, locale)}
        />
        <Stat
          label={t("mostActiveDay")}
          value={
            stats.mostActiveDay
              ? dayLabel(stats.mostActiveDay, locale)
              : "—"
          }
        />
        <Stat
          label={t("longestStreak")}
          value={streakLabel(stats.longestStreak, t)}
        />
        <Stat
          label={t("currentStreak")}
          value={streakLabel(stats.currentStreak, t)}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}
