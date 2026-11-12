"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CaretDown as ChevronDown,
  Coins,
  Crown,
} from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { purchaseCredits } from "@/actions/billing";
import { getGenerationStatus } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CREDIT_PACK_CREDITS,
  CREDIT_PACK_PRICE,
  FREE_GENERATION_LIMIT,
  PRO_MONTHLY_CREDITS,
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE_LABEL,
} from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

type PlanState = {
  isPro: boolean;
  remaining: number;
  planCredits: number;
  topupCredits: number;
};

const FEATURE_KEYS = [
  "unlimitedAi",
  "hiResExports",
  "foldersBrand",
  "prioritySupport",
] as const;

export function PlanDropdown({
  isUpgrade,
  openUpgrade,
  variant = "usage",
}: {
  /** Initial hint from org; live status comes from getGenerationStatus. */
  isUpgrade: boolean;
  openUpgrade: () => void;
  /** `usage` = remaining count; `upgrade` = Upgrade to Pro / Pro ▾ */
  variant?: "usage" | "upgrade";
}) {
  const t = useTranslations("studio.upgrade");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [plan, setPlan] = useState<PlanState>({
    isPro: isUpgrade,
    remaining: FREE_GENERATION_LIMIT,
    planCredits: 0,
    topupCredits: 0,
  });
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    setPlan((prev) => ({ ...prev, isPro: isUpgrade }));
  }, [isUpgrade]);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    void (async () => {
      try {
        const row = await getGenerationStatus();
        if (cancelled) return;
        const remaining = Number.isFinite(row.entitlement.remaining)
          ? row.entitlement.remaining
          : row.entitlement.isPro
            ? 0
            : FREE_GENERATION_LIMIT;
        setPlan({
          isPro: row.entitlement.isPro,
          remaining,
          planCredits: row.entitlement.credits?.plan ?? 0,
          topupCredits: row.entitlement.credits?.topup ?? 0,
        });
      } catch {
        // keep last known / optimistic free limit
      }
    })();

    const onChanged = (event: Event) => {
      const entitlement = (
        event as CustomEvent<{
          entitlement?: {
            remaining?: number;
            isPro?: boolean;
            credits?: { plan?: number; topup?: number; total?: number };
          };
        }>
      ).detail?.entitlement;
      if (!entitlement) return;
      setPlan((prev) => ({
        isPro:
          typeof entitlement.isPro === "boolean"
            ? entitlement.isPro
            : prev.isPro,
        remaining:
          typeof entitlement.remaining === "number" &&
          Number.isFinite(entitlement.remaining)
            ? entitlement.remaining
            : prev.remaining,
        planCredits:
          typeof entitlement.credits?.plan === "number"
            ? entitlement.credits.plan
            : prev.planCredits,
        topupCredits:
          typeof entitlement.credits?.topup === "number"
            ? entitlement.credits.topup
            : prev.topupCredits,
      }));
    };
    window.addEventListener("studio:generations-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:generations-changed", onChanged);
    };
  }, [signedIn]);

  const creditsLabel = plan.isPro
    ? String(plan.remaining)
    : `${plan.remaining}/${FREE_GENERATION_LIMIT}`;

  const buyMore = async () => {
    if (buying) return;
    setBuying(true);
    try {
      const res = await purchaseCredits();
      if (res.success) {
        setPlan((prev) => ({
          ...prev,
          isPro: true,
          remaining: res.billing.creditsTotal,
          planCredits: res.billing.creditsPlan,
          topupCredits: res.billing.creditsTopup,
        }));
        window.dispatchEvent(
          new CustomEvent("studio:generations-changed", {
            detail: {
              entitlement: {
                isPro: true,
                remaining: res.billing.creditsTotal,
                canGenerate: res.billing.creditsTotal > 0,
                credits: {
                  plan: res.billing.creditsPlan,
                  topup: res.billing.creditsTopup,
                  total: res.billing.creditsTotal,
                },
              },
            },
          }),
        );
      }
    } finally {
      setBuying(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "h-9 gap-1.5 rounded-full border-none bg-muted/40 px-3.5 text-[13px] font-medium text-foreground shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60",
            plan.isPro &&
              "bg-muted/40 text-foreground hover:bg-muted/20",
          )}
        >
          {variant === "upgrade" && !plan.isPro ? (
            <>
              <Crown className="size-3.5" />
              <span>{t("upgradeToPro")}</span>
            </>
          ) : (
            <>
              <Coins className="size-5 opacity-80" weight="duotone" />
              <span className="tabular-nums">{creditsLabel}</span>
              {variant === "upgrade" && plan.isPro ? (
                <ChevronDown className="size-3.5 opacity-70" />
              ) : null}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={variant === "upgrade" ? "end" : "start"}
        sideOffset={10}
        className="w-[300px] rounded-2xl p-5"
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              {plan.isPro ? t("planPro") : t("freePlan")}
            </h3>
            <p className="flex items-center gap-1 text-[13px] font-medium tabular-nums text-foreground">
              <Coins className="size-3.5 text-muted-foreground" weight="duotone" />
              {creditsLabel}
            </p>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {plan.isPro
              ? t("unlimitedOnSub", {
                  remaining: plan.remaining,
                  plan: plan.planCredits,
                  topup: plan.topupCredits,
                })
              : t("remainingFree", {
                  remaining: plan.remaining,
                  limit: FREE_GENERATION_LIMIT,
                })}
          </p>

          <div className="my-4 h-px w-full bg-muted/50" />

          <p className="mb-3 text-[13px] font-medium text-foreground">
            {t("proIncludes")}
          </p>

          <ul className="flex flex-col gap-2.5">
            {FEATURE_KEYS.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </div>
                <p className="text-[13px] leading-snug text-muted-foreground">
                  {feature === "unlimitedAi"
                    ? t(`features.${feature}`, { count: PRO_MONTHLY_CREDITS })
                    : t(`features.${feature}`)}
                </p>
              </li>
            ))}
          </ul>

          {!plan.isPro ? (
            <Button
              onClick={openUpgrade}
              className="mt-5 h-10 w-full rounded-md font-medium shadow-none"
            >
              {t("upgrade")} · {STUDIO_PRO_PRICE_LABEL}/mo
            </Button>
          ) : (
            <Button
              onClick={() => void buyMore()}
              disabled={buying}
              variant="secondary"
              className="mt-5 h-10 w-full rounded-md font-medium shadow-none"
            >
              {t("buyCreditsPack", {
                credits: CREDIT_PACK_CREDITS,
                price: CREDIT_PACK_PRICE,
                currency: STUDIO_PRO_CURRENCY,
              })}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
