"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useTranslations } from "next-intl";

import { landSectionPad } from "@/components/landing/landing-shell";
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
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
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

function StaticExamples({
  items,
  cta,
}: {
  items: ExampleItem[];
  cta: string;
}) {
  return (
    <section id="examples" className={cn("scroll-mt-28", landSectionPad)}>
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      count - 1,
      Math.max(0, Math.round(value * (count - 1))),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduce) return <StaticExamples items={items} cta={cta} />;

  return (
    <section
      id="examples"
      ref={containerRef}
      className="relative scroll-mt-28"
      style={{ height: `${count * 100}vh` }}
      aria-label={t("aria")}
    >
      <div
        className={cn(
          "sticky top-0 flex h-svh items-center justify-center overflow-hidden",
          landSectionPad,
        )}
      >
        <div className="relative aspect-[3/4] mt-20 h-[min(90svh,52rem)] w-auto max-w-full overflow-hidden rounded-4xl bg-muted/50 backdrop-blur-xl">
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
        </div>
      </div>
    </section>
  );
}
