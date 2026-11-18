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
  const start = 0.08 + index * 0.14;
  const mid = start + 0.1;
  const settle = Math.min(0.94, mid + 0.12);

  const opacity = useTransform(
    progress,
    [start, mid, 0.97],
    reduceMotion ? [1, 1, 1] : [0, 1, 1],
  );
  const y = useTransform(
    progress,
    [start, mid, settle],
    reduceMotion ? [0, 0, 0] : [36, 0, 0],
  );
  const scale = useTransform(
    progress,
    [start, mid, settle],
    reduceMotion ? [1, 1, 1] : [0.94, 1.02, 1],
  );

  return (
    <motion.article
      style={{ opacity, y, scale }}
      className={cn(
        "flex w-full items-center gap-4 rounded-[1.15rem] px-4 py-3.5 sm:gap-5 sm:rounded-[1.35rem] sm:px-5 sm:py-4",
        "bg-white/70 backdrop-blur-xl dark:bg-muted/50",
      )}
    >
      <span
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-md sm:size-14",
          "bg-white/80 dark:bg-muted/60",
        )}
      >
        <BrandIcon brand={brand} className="size-7 sm:size-8" />
      </span>
      <h3 className="text-[15px] font-medium text-[#050038] sm:text-base dark:text-foreground">
        {name}
      </h3>
    </motion.article>
  );
}

/** Scroll-driven vertical stack of available generation models. */
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
    [0, 0.1, 0.28],
    reduceMotion ? [1, 1, 1] : [1, 1, 0.55],
  );
  const titleY = useTransform(
    scrollYProgress,
    [0, 0.35],
    reduceMotion ? [0, 0] : [0, -10],
  );

  const stage = (
    <div className="mx-auto flex w-full max-w-[420px] flex-col px-1">
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="max-w-sm"
      >
        <h2
          className={cn(
            landSerif,
            "text-[2rem] leading-[1.08] sm:text-[2.35rem]",
          )}
        >
          {t("title")}
        </h2>
        <p className={cn(landMuted, "mt-2.5 max-w-sm text-[14px] sm:text-[15px]")}>
          {t("sub")}
        </p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-2.5 sm:mt-10 sm:gap-3">
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
        <div className="mx-auto max-w-[560px] px-6 py-12 sm:px-8 sm:py-14">
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
      style={{ height: "180vh" }}
    >
      <div
        className={cn(
          "sticky top-0 flex min-h-svh items-center",
          landSectionPad,
        )}
      >
        <div className="mx-auto w-full max-w-[560px] overflow-visible px-6 py-10 sm:px-8 sm:py-12">
          {stage}
        </div>
      </div>
    </section>
  );
}
