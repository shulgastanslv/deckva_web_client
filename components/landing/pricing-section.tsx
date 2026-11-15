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

/**
 * Sticky pricing runway: Free slides in, Pro scales up and takes focus
 * while scrolling through the section.
 */
export function PricingSection() {
  const t = useTranslations("landing");
  const tp = useTranslations("landing.pricing");
  const { pro } = useDisplayCurrency();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const headingOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35],
    reduceMotion ? [1, 1, 1] : [1, 1, 0.4],
  );

  const freeX = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7],
    reduceMotion ? [0, 0, 0] : [-40, 0, -8],
  );
  const freeY = useTransform(
    scrollYProgress,
    [0, 0.4],
    reduceMotion ? [0, 0] : [56, 0],
  );
  const freeScale = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    reduceMotion ? [1, 1, 1] : [0.9, 1, 0.96],
  );
  const freeOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.55],
    reduceMotion ? [1, 1, 1] : [0.25, 1, 1],
  );

  const proX = useTransform(
    scrollYProgress,
    [0, 0.35, 0.75],
    reduceMotion ? [0, 0, 0] : [48, 0, 10],
  );
  const proY = useTransform(
    scrollYProgress,
    [0, 0.5],
    reduceMotion ? [0, 0] : [72, 0],
  );
  const proScale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.86, 1.04, 1.06, 1],
  );
  const proOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.4],
    reduceMotion ? [1, 1, 1] : [0.15, 0.75, 1],
  );
  const proGlow = useTransform(
    scrollYProgress,
    [0.2, 0.55, 0.9],
    reduceMotion ? [0, 0, 0] : [0, 0.55, 0.2],
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

  const cards = (
    <div className="relative mx-auto grid w-full max-w-[960px] gap-4 sm:grid-cols-2 sm:gap-5 sm:items-stretch">
      <motion.div
        style={{ x: freeX, y: freeY, scale: freeScale, opacity: freeOpacity }}
        className="relative z-[1] flex h-full flex-col rounded-[1.5rem] bg-[#F5F4F0] p-7 text-[#050038] sm:rounded-[1.75rem] dark:bg-[#1c1d24] dark:text-land-ink"
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
        style={{ x: proX, y: proY, scale: proScale, opacity: proOpacity }}
        className="relative z-[2] flex h-full flex-col rounded-[1.5rem] bg-[#050038] p-7 text-white sm:rounded-[1.75rem] dark:bg-[#0a0b10]"
      >
        <motion.div
          aria-hidden
          style={{ opacity: proGlow }}
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[#FFD02F]/25 blur-2xl"
        />
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
  );

  const heading = (
    <motion.div style={{ opacity: headingOpacity }} className="text-center">
      <h2
        className={cn(landSerif, "text-[2.5rem] leading-[1.05] sm:text-5xl")}
      >
        {tp("title")}
      </h2>
      <p className={cn(landMuted, "mx-auto mt-4 max-w-md")}>{tp("sub")}</p>
    </motion.div>
  );

  if (reduceMotion) {
    return (
      <section id="pricing" className="scroll-mt-28 px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-[1200px] rounded-[2rem] bg-white px-6 py-14 sm:rounded-[2.5rem] sm:px-10 sm:py-16 dark:bg-[#14151c]">
          {heading}
          <div className="mt-12">{cards}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative scroll-mt-28"
      style={{ height: "180vh" }}
    >
      <div className="sticky top-0 flex min-h-svh items-center px-3 py-6 sm:px-5 sm:py-8">
        <div className="mx-auto w-full max-w-[1200px] overflow-visible rounded-[2rem] bg-white px-6 py-12 sm:rounded-[2.5rem] sm:px-10 sm:py-14 dark:bg-[#14151c]">
          {heading}
          <div className="mt-10 sm:mt-12">{cards}</div>
        </div>
      </div>
    </section>
  );
}
