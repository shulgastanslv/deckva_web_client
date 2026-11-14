"use client";

import { Check } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
import { RevealItem, RevealStagger } from "@/components/landing/reveal";
import { useDisplayCurrency } from "@/hooks/use-display-currency";
import {
  FREE_GENERATION_LIMIT,
  PRO_FEATURES,
} from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const t = useTranslations("landing");
  const { pro } = useDisplayCurrency();

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
            Simple pricing
          </h2>
          <p className={cn(landMuted, "mx-auto mt-4 max-w-md")}>
            Start free. Move to Pro when you need more generations.
          </p>
        </RevealItem>
      </RevealStagger>

      <RevealStagger
        stagger={0.12}
        className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4"
      >
        <RevealItem>
          <div className="flex h-full flex-col rounded-[1.5rem] bg-[#F5F4F0] p-7 text-[#050038] sm:rounded-[1.75rem] dark:bg-[#1c1d24] dark:text-land-ink">
            <p className="text-sm font-medium text-[#050038]/45 dark:text-land-ink/45">
              Free
            </p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className={cn(landSerif, "text-5xl")}>0</span>
              <span className="text-sm text-[#050038]/45 dark:text-land-ink/45">
                BYN
              </span>
            </p>
            <ul className="mt-8 flex-1 space-y-3 text-[15px] text-[#050038]/70 dark:text-land-ink/70">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                {FREE_GENERATION_LIMIT} free AI generations
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                Generation from a topic
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                Edit and download
              </li>
            </ul>
            <Button
              asChild
              className="mt-10 h-11 rounded-full bg-[#050038] px-5 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-land-ink dark:text-land-mist"
            >
              <a href="/studio">Start free</a>
            </Button>
          </div>
        </RevealItem>

        <RevealItem>
          <div className="flex h-full flex-col rounded-[1.5rem] bg-[#050038] p-7 text-white sm:rounded-[1.75rem] dark:bg-[#0a0b10]">
            <p className="text-sm font-medium text-white/50">Pro</p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className={cn(landSerif, "text-5xl text-white")}>
                {pro.amount}
              </span>
              <span className="text-sm text-white/50">
                {pro.currency} / month
              </span>
            </p>
            <ul className="mt-8 flex-1 space-y-3 text-[15px] text-white/75">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-10 h-11 rounded-full bg-[#FFD02F] px-5 text-[15px] font-medium text-[#050038] hover:bg-[#FFD02F]/90"
            >
              <a href="/studio">{t("ctaStudio")}</a>
            </Button>
          </div>
        </RevealItem>
      </RevealStagger>
    </div>
  );
}
