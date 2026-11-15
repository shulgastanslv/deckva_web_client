"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Check } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
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
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const freeY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [28, 0],
  );
  const freeOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    reduceMotion ? [1, 1, 1] : [0.45, 0.85, 1],
  );
  const freeScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [0.96, 1],
  );

  const proY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [48, 0],
  );
  const proScale = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    reduceMotion ? [1, 1, 1] : [0.92, 1.02, 1],
  );
  const proOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 1],
    reduceMotion ? [1, 1, 1] : [0.35, 0.9, 1],
  );

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
    <div ref={sectionRef} className="mx-auto w-full max-w-[960px]">
      <div className="text-center">
        <h2
          className={cn(
            landSerif,
            "text-[2.5rem] leading-[1.05] sm:text-5xl",
          )}
        >
          {tp("title")}
        </h2>
        <p className={cn(landMuted, "mx-auto mt-4 max-w-md")}>{tp("sub")}</p>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 sm:items-stretch">
        <motion.div
          style={{ y: freeY, opacity: freeOpacity, scale: freeScale }}
          className="flex h-full flex-col rounded-[1.5rem] bg-[#F5F4F0] p-7 text-[#050038] sm:rounded-[1.75rem] dark:bg-[#1c1d24] dark:text-land-ink"
        >
          <p className="text-sm font-medium text-[#050038]/45 dark:text-land-ink/45">
            {tp("free")}
          </p>
          <p className="mt-4 flex items-baseline gap-2">
            <span className={cn(landSerif, "text-5xl")}>0</span>
            <span className="text-sm text-[#050038]/45 dark:text-land-ink/45">
              BYN
            </span>
          </p>
          <ul className="mt-8 flex-1 space-y-3 text-[15px] text-[#050038]/70 dark:text-land-ink/70">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" weight="bold" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-10 h-11 rounded-full bg-[#050038] px-5 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-land-ink dark:text-land-mist"
          >
            <a href="/studio">{tp("startFree")}</a>
          </Button>
        </motion.div>

        <motion.div
          style={{ y: proY, opacity: proOpacity, scale: proScale }}
          className="flex h-full flex-col rounded-[1.5rem] bg-[#050038] p-7 text-white sm:rounded-[1.75rem] dark:bg-[#0a0b10] dark:ring-1 dark:ring-white/10"
        >
          <p className="text-sm font-medium text-white/50">{tp("pro")}</p>
          <p className="mt-4 flex items-baseline gap-2">
            <span className={cn(landSerif, "text-5xl text-white")}>
              {pro.amount}
            </span>
            <span className="text-sm text-white/50">
              {pro.currency} {tp("perMonth")}
            </span>
          </p>
          <ul className="mt-8 flex-1 space-y-3 text-[15px] text-white/75">
            {proFeatures.map((feature) => (
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
        </motion.div>
      </div>
    </div>
  );
}
