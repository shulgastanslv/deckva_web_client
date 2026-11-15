"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslations } from "next-intl";

import { BrandIcon, type BrandKey } from "@/components/studio/brand-icon";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

const MODELS = [
  { brand: "openai" as const, id: "openai" },
  { brand: "claude" as const, id: "claude" },
  { brand: "gemini" as const, id: "gemini" },
  { brand: "deepseek" as const, id: "deepseek" },
  { brand: "mistral" as const, id: "mistral" },
  { brand: "meta" as const, id: "meta" },
  { brand: "xai" as const, id: "xai" },
  { brand: "perplexity" as const, id: "perplexity" },
] satisfies { brand: BrandKey; id: string }[];

function ModelCard({
  brand,
  name,
  blurb,
  index,
  progress,
  reduceMotion,
}: {
  brand: BrandKey;
  name: string;
  blurb: string;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = 0.08 + index * 0.06;
  const mid = start + 0.18;
  const end = Math.min(0.92, mid + 0.2);

  const opacity = useTransform(
    progress,
    [start, mid, 0.95],
    reduceMotion ? [1, 1, 1] : [0, 1, 1],
  );
  const y = useTransform(
    progress,
    [start, mid, end],
    reduceMotion ? [0, 0, 0] : [48, 0, -6],
  );
  const scale = useTransform(
    progress,
    [start, mid, end],
    reduceMotion ? [1, 1, 1] : [0.86, 1.02, 1],
  );
  const rotate = useTransform(
    progress,
    [start, mid],
    reduceMotion ? [0, 0] : [index % 2 === 0 ? -4 : 4, 0],
  );

  return (
    <motion.article
      style={{ opacity, y, scale, rotate }}
      className={cn(
        "flex flex-col items-start gap-4 rounded-[1.25rem] p-5 sm:rounded-[1.5rem] sm:p-6",
        "bg-[#F5F4F0] dark:bg-[#1c1d24]",
      )}
    >
      <span
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-md",
          "bg-white dark:bg-white/10",
        )}
      >
        <BrandIcon brand={brand} className="size-7" />
      </span>
      <div>
        <h3 className="text-[15px] font-medium text-[#050038] dark:text-land-ink">
          {name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#050038]/55 dark:text-land-ink/55">
          {blurb}
        </p>
      </div>
    </motion.article>
  );
}

/** Scroll-driven grid of available generation models with brand logos. */
export function ModelsSection() {
  const t = useTranslations("landing.models");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.35],
    reduceMotion ? [1, 1, 1] : [1, 1, 0.45],
  );
  const titleY = useTransform(
    scrollYProgress,
    [0, 0.4],
    reduceMotion ? [0, 0] : [0, -16],
  );

  const stage = (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col px-1">
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="max-w-xl"
      >
        <h2
          className={cn(
            landSerif,
            "text-[2.35rem] leading-[1.05] sm:text-5xl",
          )}
        >
          {t("title")}
        </h2>
        <p className={cn(landMuted, "mt-4 max-w-md")}>{t("sub")}</p>
      </motion.div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {MODELS.map((model, index) => (
          <ModelCard
            key={model.id}
            brand={model.brand}
            name={t(`items.${model.id}.name`)}
            blurb={t(`items.${model.id}.blurb`)}
            index={index}
            progress={scrollYProgress}
            reduceMotion={Boolean(reduceMotion)}
          />
        ))}
      </div>
    </div>
  );

  if (reduceMotion) {
    return (
      <section
        id="models"
        className="scroll-mt-28 px-3 py-3 sm:px-5 sm:py-5"
      >
        <div className="mx-auto max-w-[1200px] rounded-[2rem] bg-white px-6 py-14 sm:rounded-[2.5rem] sm:px-10 sm:py-16 dark:bg-[#14151c]">
          {stage}
        </div>
      </section>
    );
  }

  return (
    <section
      id="models"
      ref={sectionRef}
      className="relative scroll-mt-28"
      style={{ height: "170vh" }}
    >
      <div className="sticky top-0 flex min-h-svh items-center px-3 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto w-full max-w-[1200px] overflow-visible rounded-[2rem] bg-white px-6 py-12 sm:rounded-[2.5rem] sm:px-10 sm:py-14 dark:bg-[#14151c]">
          {stage}
        </div>
      </div>
    </section>
  );
}
