"use client";

import { Check } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
import { RevealItem, RevealStagger } from "@/components/landing/reveal";
import { useDisplayCurrency } from "@/hooks/use-display-currency";
import {
  FREE_GENERATION_LIMIT,
  PRO_MONTHLY_CREDITS,
} from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const t = useTranslations("landing");
  const tp = useTranslations("landing.pricing");
  const { pro } = useDisplayCurrency();

  const freeFeatures = [
    tp("freeGenerations", { count: FREE_GENERATION_LIMIT }),
    tp("fromTopic"),
    tp("editDownload"),
  ];

  const proFeatures = [
    tp("proGenerations", { count: PRO_MONTHLY_CREDITS }),
    tp("hiRes"),
    tp("folders"),
    tp("support"),
  ];

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <RevealStagger className="text-center">
        <RevealItem soft>
          <h2
            className={cn(
              landSerif,
              "text-[2.5rem] leading-[1.05] sm:text-5xl",
            )}
          >
            {tp("title")}
          </h2>
          <p className={cn(landMuted, "mx-auto mt-4 max-w-md")}>{tp("sub")}</p>
        </RevealItem>
      </RevealStagger>

      <RevealStagger
        stagger={0.12}
        className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4"
      >
        <RevealItem>
          <div className="flex h-full flex-col rounded-3xl bg-[#F5F4F0] p-7 text-[#050038] dark:bg-muted/50 dark:text-foreground dark:backdrop-blur-md">
            <p className="text-sm font-medium text-[#050038]/45 dark:text-muted-foreground">
              {tp("free")}
            </p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className={cn(landSerif, "text-5xl")}>0</span>
              <span className="text-sm text-[#050038]/45 dark:text-muted-foreground">
                BYN
              </span>
            </p>
            <ul className="mt-8 flex-1 space-y-3 text-[15px] text-[#050038]/70 dark:text-muted-foreground">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-10 h-11 rounded-full bg-[#050038] px-5 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-foreground dark:text-background"
            >
              <a href="/studio">{tp("startFree")}</a>
            </Button>
          </div>
        </RevealItem>

        <RevealItem>
          <div className="flex h-full flex-col rounded-3xl bg-[#050038] p-7 text-white dark:bg-foreground dark:text-background">
            <p className="text-sm font-medium text-white/50 dark:text-background/50">
              {tp("pro")}
            </p>
            <p className="mt-4 flex items-baseline gap-2">
              <span
                className={cn(
                  landSerif,
                  "text-5xl text-white dark:text-background",
                )}
              >
                {pro.amount}
              </span>
              <span className="text-sm text-white/50 dark:text-background/50">
                {pro.currency} {tp("perMonth")}
              </span>
            </p>
            <ul className="mt-8 flex-1 space-y-3 text-[15px] text-white/75 dark:text-background/75">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-10 h-11 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              <a href="/studio">{t("ctaStudio")}</a>
            </Button>
          </div>
        </RevealItem>
      </RevealStagger>
    </div>
  );
}
