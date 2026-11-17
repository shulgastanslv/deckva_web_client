"use client";

import { Check } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
import { RevealItem, RevealStagger } from "@/components/landing/reveal";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const tp = useTranslations("landing.pricing");

  const freeFeatures = [
    tp("freeGenerations", { count: DAILY_GENERATION_LIMIT }),
    tp("fromTopic"),
    tp("editDownload"),
    tp("folders"),
    tp("hiRes"),
  ];

  return (
    <div className="mx-auto w-full max-w-[640px]">
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

      <RevealStagger stagger={0.12} className="mt-12">
        <RevealItem>
          <div className="flex h-full flex-col rounded-3xl bg-[#F5F4F0] p-7 text-[#050038] dark:bg-muted/50 dark:text-foreground dark:backdrop-blur-md">
            <p className="text-sm font-medium text-[#050038]/45 dark:text-muted-foreground">
              {tp("free")}
            </p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className={cn(landSerif, "text-5xl")}>{tp("priceFree")}</span>
            </p>
            <p className="mt-2 text-[15px] text-[#050038]/55 dark:text-muted-foreground">
              {tp("freeBadge")}
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
      </RevealStagger>
    </div>
  );
}
