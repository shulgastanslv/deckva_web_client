"use client";

import { useEffect, useState } from "react";
import { Infinity as InfinityIcon } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { getGenerationStatus } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

type PlanState = {
  remaining: number;
  used: number;
  limit: number;
  unlimited: boolean;
};

export function PlanDropdown() {
  const t = useTranslations("studio.upgrade");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [plan, setPlan] = useState<PlanState>({
    remaining: DAILY_GENERATION_LIMIT,
    used: 0,
    limit: DAILY_GENERATION_LIMIT,
    unlimited: false,
  });

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    void (async () => {
      try {
        const row = await getGenerationStatus();
        if (cancelled) return;
        const unlimited = Boolean(row.entitlement.unlimited);
        const remaining = Number.isFinite(row.entitlement.remaining)
          ? row.entitlement.remaining
          : DAILY_GENERATION_LIMIT;
        setPlan({
          remaining,
          used: row.entitlement.used,
          limit: unlimited
            ? 0
            : row.entitlement.limit || DAILY_GENERATION_LIMIT,
          unlimited,
        });
      } catch {
        // keep last known / optimistic limit
      }
    })();

    const onChanged = (event: Event) => {
      const entitlement = (
        event as CustomEvent<{
          entitlement?: {
            remaining?: number;
            used?: number;
            limit?: number;
            unlimited?: boolean;
          };
        }>
      ).detail?.entitlement;
      if (!entitlement) return;
      setPlan((prev) => {
        const unlimited =
          typeof entitlement.unlimited === "boolean"
            ? entitlement.unlimited
            : prev.unlimited;
        return {
          remaining:
            typeof entitlement.remaining === "number" &&
            Number.isFinite(entitlement.remaining)
              ? entitlement.remaining
              : prev.remaining,
          used:
            typeof entitlement.used === "number" &&
            Number.isFinite(entitlement.used)
              ? entitlement.used
              : prev.used,
          limit:
            typeof entitlement.limit === "number" &&
            Number.isFinite(entitlement.limit)
              ? entitlement.limit
              : prev.limit,
          unlimited,
        };
      });
    };
    window.addEventListener("studio:generations-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:generations-changed", onChanged);
    };
  }, [signedIn]);

  const label = plan.unlimited ? (
    <InfinityIcon className="size-4" weight="regular" aria-hidden />
  ) : (
    `${plan.remaining}/${plan.limit}`
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "gap-1.5 rounded-md border-none bg-muted/40 px-2.5 text-[12px] font-normal text-foreground shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60 sm:px-3.5 sm:text-[13px]",
          )}
        >
          <span className="inline-flex items-center tabular-nums">{label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-[280px] rounded-2xl p-5"
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              {t("dailyLimit")}
            </h3>
            <p className="inline-flex items-center text-[13px] font-medium tabular-nums text-foreground">
              {label}
            </p>
          </div>
          <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground">
            {plan.unlimited
              ? t("unlimitedDaily")
              : t("remainingDaily", {
                  remaining: plan.remaining,
                  limit: plan.limit,
                })}
          </p>
          {plan.unlimited ? null : (
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              {t("resetsHint")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
