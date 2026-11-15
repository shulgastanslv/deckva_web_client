"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useTranslations } from "next-intl";

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
  "/landing/examples/1.jpg",
  "/landing/examples/2.jpg",
  "/landing/examples/3.jpg",
  "/landing/examples/4.jpg",
  "/landing/examples/5.jpg",
  "/landing/examples/6.jpg",
  "/landing/examples/7.jpg",
  "/landing/examples/8.jpg",
  "/landing/examples/9.jpg",
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
        y: active ? 0 : 18,
      }}
      transition={{ duration: 0.55, ease }}
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
        <div className="relative mx-auto flex max-w-lg flex-col items-center px-6 text-center text-white">
          <p className="text-sm font-medium text-white/80 sm:text-[15px]">
            {item.text}
          </p>
          <Button
            asChild
            className="mt-5 h-11 rounded-full bg-white px-6 text-[15px] font-medium text-[#050038] hover:bg-white/90"
          >
            <a href={item.href} tabIndex={active ? 0 : -1}>
              {cta}
            </a>
          </Button>
        </div>
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
    <section id="examples" className="scroll-mt-28 px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pt-24 pb-6">
              <div className="relative mx-auto flex max-w-lg flex-col items-center px-6 text-center text-white">
                <p className="text-sm font-medium text-white/80">{item.text}</p>
                <Button
                  asChild
                  className="mt-4 h-11 rounded-full bg-white px-6 text-[15px] font-medium text-[#050038] hover:bg-white/90"
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
      className="relative"
      style={{ height: `${count * 100}vh` }}
      aria-label={t("aria")}
    >
      <div className="sticky top-0 flex h-svh items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="relative h-full w-full max-w-[1200px] overflow-hidden rounded-[1.75rem] bg-[#14151c] sm:rounded-[2rem]">
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
