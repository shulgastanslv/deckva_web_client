"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslations } from "next-intl";

import { landSectionPad, landSerif } from "@/components/landing/landing-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EXAMPLE_IDS = [
  "launch",
  "howto",
  "checklist",
  "offer",
  "tips",
  "myths",
  "story",
  "compare",
  "mistakes",
] as const;

const EXAMPLE_IMAGES = [
  "/landing/examples/1.png",
  "/landing/examples/2.png",
  "/landing/examples/3.png",
  "/landing/examples/4.png",
  "/landing/examples/5.png",
  "/landing/examples/6.png",
  "/landing/examples/7.png",
  "/landing/examples/8.png",
  "/landing/examples/9.png",
] as const;

const INTRO_VH = 140;
const CARD_VH = 100;

type ExampleItem = {
  id: (typeof EXAMPLE_IDS)[number];
  title: string;
  text: string;
  src: string;
  href: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

function ExampleBlock({
  item,
  active,
  index,
  cta,
}: {
  item: ExampleItem;
  active: boolean;
  index: number;
  cta: string;
}) {
  return (
    <motion.article
      aria-hidden={!active}
      className={cn(
        "absolute inset-0 overflow-hidden",
        active ? "pointer-events-auto" : "pointer-events-none",
      )}
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? 1 : 1.04,
        y: active ? 0 : 22,
      }}
      transition={{ duration: 0.6, ease }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading={index === 0 ? "eager" : "lazy"}
        draggable={false}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pt-28 pb-8">
        <motion.div
          key={active ? item.id : `${item.id}-idle`}
          initial={false}
          animate={
            active
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 14 }
          }
          transition={{ duration: 0.45, ease, delay: active ? 0.08 : 0 }}
          className="relative mx-auto flex max-w-sm flex-col items-center px-5 text-center text-white"
        >
          <p className="text-sm font-medium text-white/80 sm:text-[15px]">
            {item.text}
          </p>
          <Button
            asChild
            className="mt-5 h-11 rounded-full bg-white px-6 text-[15px] font-medium text-foreground hover:bg-white/90 dark:text-background"
          >
            <a href={item.href} tabIndex={active ? 0 : -1}>
              {cta}
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.article>
  );
}

function ExamplesIntro({
  intro,
  lead,
  title,
}: {
  /** 0→1 across the intro scroll only */
  intro: MotionValue<number>;
  lead: string;
  title: string;
}) {
  // Lead: rises in, holds, then drifts up and fades
  const leadOpacity = useTransform(intro, [0, 0.16, 0.38, 0.58], [0, 1, 1, 0]);
  const leadY = useTransform(intro, [0, 0.16, 0.38, 0.58], [28, 0, -6, -40]);

  // Title: follows lead, then exits as the card arrives
  const titleOpacity = useTransform(
    intro,
    [0.22, 0.4, 0.68, 0.9],
    [0, 1, 1, 0],
  );
  const titleY = useTransform(
    intro,
    [0.22, 0.4, 0.68, 0.9],
    [44, 0, -10, -56],
  );
  const titleScale = useTransform(intro, [0.22, 0.4, 0.9], [0.94, 1, 0.98]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.p
          style={{ opacity: leadOpacity, y: leadY }}
          className={cn(
            landSerif,
            "text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.05] tracking-tight text-muted-foreground",
          )}
        >
          {lead}
        </motion.p>
        <motion.h2
          style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
          className={cn(
            landSerif,
            "mt-2 text-[clamp(3.5rem,14vw,7.5rem)] leading-[0.9] tracking-tight",
          )}
        >
          {title}
        </motion.h2>
      </div>
    </div>
  );
}

function StaticExamples({
  items,
  cta,
  lead,
  title,
}: {
  items: ExampleItem[];
  cta: string;
  lead: string;
  title: string;
}) {
  return (
    <section id="examples" className={cn("scroll-mt-28", landSectionPad)}>
      <div className="mx-auto mb-8 max-w-[36rem] text-center sm:mb-10 sm:max-w-[40rem]">
        <p
          className={cn(
            landSerif,
            "text-[clamp(1.75rem,5vw,2.75rem)] text-muted-foreground",
          )}
        >
          {lead}
        </p>
        <h2
          className={cn(
            landSerif,
            "mt-2 text-[clamp(3rem,12vw,5.5rem)] leading-[0.95]",
          )}
        >
          {title}
        </h2>
      </div>
      <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-3 sm:max-w-[40rem]">
        {items.map((item) => (
          <article
            key={item.id}
            className="relative aspect-[3/4] overflow-hidden rounded-4xl bg-muted/50 backdrop-blur-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pt-24 pb-6">
              <div className="relative mx-auto flex max-w-sm flex-col items-center px-5 text-center text-white">
                <p className="text-sm font-medium text-white/80">{item.text}</p>
                <Button
                  asChild
                  className="mt-4 h-11 rounded-full bg-white px-6 text-[15px] font-medium text-foreground hover:bg-white/90 dark:text-background"
                >
                  <a href={item.href}>{cta}</a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ExampleCarousels() {
  const t = useTranslations("landing.examples");
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const items = useMemo<ExampleItem[]>(
    () =>
      EXAMPLE_IDS.map((id, index) => ({
        id,
        title: t(`items.${id}.title`),
        text: t(`items.${id}.text`),
        src: EXAMPLE_IMAGES[index],
        href: `/studio?topic=${encodeURIComponent(t(`items.${id}.topic`))}`,
      })),
    [t],
  );

  const count = items.length;
  const cta = t("openInStudio");
  const lead = t("lead");
  const title = t("title");
  const totalVh = INTRO_VH + count * CARD_VH;
  const introShare = INTRO_VH / totalVh;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.35,
    restDelta: 0.001,
  });
  const intro = useTransform(progress, [0, introShare], [0, 1]);

  // Remap total progress → carousel index after the intro finishes
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < introShare) {
      setActive(0);
      return;
    }
    const local = (value - introShare) / (1 - introShare);
    const next = Math.min(
      count - 1,
      Math.max(0, Math.round(local * (count - 1))),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  // Card: waits through intro text, then rises from below into place
  const cardOpacity = useTransform(intro, [0.55, 0.82], [0, 1]);
  const cardY = useTransform(intro, [0.55, 0.92], [80, 0]);
  const cardScale = useTransform(intro, [0.55, 0.92], [0.9, 1]);

  if (reduce) {
    return (
      <StaticExamples items={items} cta={cta} lead={lead} title={title} />
    );
  }

  return (
    <section
      id="examples"
      ref={containerRef}
      className="relative scroll-mt-28"
      style={{ height: `${totalVh}vh` }}
      aria-label={t("aria")}
    >
      <div
        className={cn(
          "sticky top-0 flex h-svh items-center justify-center overflow-hidden",
          landSectionPad,
        )}
      >
        <ExamplesIntro intro={intro} lead={lead} title={title} />

        <motion.div
          style={{ opacity: cardOpacity, y: cardY, scale: cardScale }}
          className="relative aspect-[3/4] h-[min(90svh,52rem)] w-auto max-w-full overflow-hidden rounded-4xl bg-muted/50 backdrop-blur-xl"
        >
          {items.map((item, index) => (
            <ExampleBlock
              key={item.id}
              item={item}
              index={index}
              active={active === index}
              cta={cta}
            />
          ))}

          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2 sm:bottom-7">
            {items.map((item, index) => (
              <span
                key={item.id}
                aria-hidden
                className={cn(
                  "size-2 rounded-full transition-colors duration-300",
                  active === index ? "bg-white" : "bg-white/35",
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
