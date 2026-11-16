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
import {
  landIsland,
  landMuted,
  landSectionPad,
  landSerif,
} from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

const MODELS = [
  { brand: "claude" as const, id: "claude" },
  { brand: "deepseek" as const, id: "deepseek" },
  { brand: "openai" as const, id: "openai" },
  { brand: "gemini" as const, id: "gemini" },
  { brand: "qwen" as const, id: "qwen" },
] satisfies { brand: BrandKey; id: string }[];

function ModelCard({
  brand,
  name,
  index,
  progress,
  reduceMotion,
}: {
  brand: BrandKey;
  name: string;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = 0.1 + index * 0.08;
  const mid = start + 0.16;
  const end = Math.min(0.92, mid + 0.18);

  const opacity = useTransform(
    progress,
    [start, mid, 0.95],
    reduceMotion ? [1, 1, 1] : [0, 1, 1],
  );
  const y = useTransform(
    progress,
    [start, mid, end],
    reduceMotion ? [0, 0, 0] : [40, 0, -4],
  );
  const scale = useTransform(
    progress,
    [start, mid, end],
    reduceMotion ? [1, 1, 1] : [0.88, 1.04, 1],
  );
  const rotate = useTransform(
    progress,
    [start, mid],
    reduceMotion ? [0, 0] : [index % 2 === 0 ? -3 : 3, 0],
  );

  return (
    <motion.article
      style={{ opacity, y, scale, rotate }}
      className={cn(
        "flex flex-col items-center gap-4 rounded-[1.25rem] px-4 py-7 sm:rounded-[1.5rem] sm:px-5 sm:py-8",
        "bg-[#F5F4F0] dark:bg-muted/50 dark:backdrop-blur-md",
      )}
    >
      <span
        className={cn(
          "inline-flex size-16 items-center justify-center rounded-md sm:size-[4.5rem]",
          "bg-white dark:bg-muted/50",
        )}
      >
        <BrandIcon brand={brand} className="size-9 sm:size-11" />
      </span>
      <h3 className="text-center text-sm font-medium text-[#050038] sm:text-[15px] dark:text-foreground">
        {name}
      </h3>
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
        <p className={cn(landMuted, "mt-3 max-w-sm text-[15px]")}>{t("sub")}</p>
      </motion.div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {MODELS.map((model, index) => (
          <ModelCard
            key={model.id}
            brand={model.brand}
            name={t(`items.${model.id}.name`)}
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
      <section id="models" className={cn("scroll-mt-28", landSectionPad)}>
        <div
          className={cn(
            "mx-auto max-w-[1200px] px-6 py-14 sm:px-10 sm:py-16",
            landIsland,
          )}
        >
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
      style={{ height: "140vh" }}
    >
      <div
        className={cn(
          "sticky top-0 flex min-h-svh items-center",
          landSectionPad,
        )}
      >
        <div
          className={cn(
            "mx-auto w-full max-w-[1200px] overflow-visible px-6 py-12 sm:px-10 sm:py-14",
            landIsland,
          )}
        >
          {stage}
        </div>
      </div>
    </section>
  );
}
