"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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

export function PlanDropdown({
  isUpgrade,
  openUpgrade,
}: {
  isUpgrade: boolean;
  openUpgrade: () => void;
}) {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!signedIn || isUpgrade) {
      setRemaining(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const row = await getGenerationStatus();
        if (!cancelled) setRemaining(row.entitlement.remaining);
      } catch {
        // ignore
      }
    })();

    const onChanged = (event: Event) => {
      const next = (
        event as CustomEvent<{ entitlement?: { remaining?: number } }>
      ).detail?.entitlement?.remaining;
      if (typeof next === "number") setRemaining(next);
    };
    window.addEventListener("studio:generations-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:generations-changed", onChanged);
    };
  }, [signedIn, isUpgrade]);

  const label = isUpgrade
    ? "Pro"
    : remaining == null
      ? "Free"
      : `${remaining} left`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "h-9 rounded-full border-none bg-muted/40 px-3.5 text-[13px] font-medium text-foreground shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60",
            isUpgrade &&
              "bg-primary/15 text-primary hover:bg-primary/25 data-[state=open]:bg-primary/25",
          )}
        >
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-[300px] rounded-2xl p-5"
      >
        <div className="flex flex-col">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
            {isUpgrade ? "Pro" : "Free plan"}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {isUpgrade
              ? "Unlimited AI generations on your subscription."
              : remaining != null
                ? `${remaining} of ${FREE_GENERATION_LIMIT} free generations left.`
                : `${FREE_GENERATION_LIMIT} free AI generations, then Pro.`}
          </p>

          <div className="my-4 h-px w-full bg-muted/50" />

          <p className="mb-3 text-[13px] font-medium text-foreground">
            Pro includes
          </p>

          <ul className="flex flex-col gap-2.5">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted/50 text-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </div>
                <p className="text-[13px] leading-snug text-muted-foreground">
                  {feature}
                </p>
              </li>
            ))}
          </ul>

          {!isUpgrade ? (
            <Button
              onClick={openUpgrade}
              className="mt-5 h-10 w-full rounded-full font-medium shadow-none"
            >
              Upgrade · {STUDIO_PRO_PRICE_LABEL}/mo
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
