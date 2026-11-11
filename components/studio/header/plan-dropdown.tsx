"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Crown } from "lucide-react";
import { useSession } from "next-auth/react";

import { getGenerationStatus } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FREE_GENERATION_LIMIT,
  PRO_FEATURES,
  STUDIO_PRO_PRICE_LABEL,
} from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

type PlanState = {
  isPro: boolean;
  remaining: number;
};

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
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [plan, setPlan] = useState<PlanState>({
    isPro: isUpgrade,
    remaining: FREE_GENERATION_LIMIT,
  });

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
        const remaining = row.entitlement.isPro
          ? FREE_GENERATION_LIMIT
          : Number.isFinite(row.entitlement.remaining)
            ? row.entitlement.remaining
            : FREE_GENERATION_LIMIT;
        setPlan({
          isPro: row.entitlement.isPro,
          remaining,
        });
      } catch {
        // keep last known / optimistic free limit
      }
    })();

    const onChanged = (event: Event) => {
      const entitlement = (
        event as CustomEvent<{
          entitlement?: { remaining?: number; isPro?: boolean };
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
      }));
    };
    window.addEventListener("studio:generations-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:generations-changed", onChanged);
    };
  }, [signedIn]);

  const usageLabel = plan.isPro
    ? "Pro"
    : `${plan.remaining}/${FREE_GENERATION_LIMIT}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "h-9 gap-1.5 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-medium text-foreground shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60",
            plan.isPro &&
              "bg-primary/15 text-primary hover:bg-primary/25 data-[state=open]:bg-primary/25",
          )}
        >
          {variant === "upgrade" && !plan.isPro ? (
            <>
              <Crown className="size-3.5" />
              <span>Upgrade to Pro</span>
            </>
          ) : variant === "upgrade" && plan.isPro ? (
            <>
              <span>Pro</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </>
          ) : (
            usageLabel
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={variant === "upgrade" ? "end" : "start"}
        sideOffset={10}
        className="w-[300px] rounded-2xl p-5"
      >
        <div className="flex flex-col">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
            {plan.isPro ? "Pro" : "Free plan"}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {plan.isPro
              ? "Unlimited AI generations on your subscription."
              : `${plan.remaining} of ${FREE_GENERATION_LIMIT} free generations left.`}
          </p>

          <div className="my-4 h-px w-full bg-muted/50" />

          <p className="mb-3 text-[13px] font-medium text-foreground">
            Pro includes
          </p>

          <ul className="flex flex-col gap-2.5">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </div>
                <p className="text-[13px] leading-snug text-muted-foreground">
                  {feature}
                </p>
              </li>
            ))}
          </ul>

          {!plan.isPro ? (
            <Button
              onClick={openUpgrade}
              className="mt-5 h-10 w-full rounded-md font-medium shadow-none"
            >
              Upgrade · {STUDIO_PRO_PRICE_LABEL}/mo
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
