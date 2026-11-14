"use client";

import { RevealItem, RevealStagger } from "@/components/landing/reveal";
import { landMuted, landSerif } from "@/components/landing/landing-shell";
import { FREE_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    metric: "1 line",
    label: "from topic to slides",
    src: "/reviews/5.jpg",
    foot: "Generate",
  },
  {
    metric: "0",
    label: "watermark on export",
    src: "/reviews/7.jpg",
    foot: "Export",
  },
  {
    metric: "ZIP",
    label: "whole carousel download",
    src: "/reviews/8.jpg",
    foot: "Publish",
  },
] as const;

const STATS = [
  { value: String(FREE_GENERATION_LIMIT), label: "free AI generations to start" },
  { value: "PNG", label: "single-slide download" },
  { value: "1", label: "project per carousel" },
] as const;

export function FeatureOutcomes() {
  return (
    <div className="mx-auto w-full max-w-[1040px]">
      <RevealStagger className="relative mx-auto max-w-3xl text-center">
        <RevealItem soft>
          <span
            aria-hidden
            className="absolute -top-2 left-0 hidden items-center gap-1.5 rounded-full bg-[#FFB8D2] px-2 py-1 text-[11px] font-medium text-[#050038] sm:inline-flex"
          >
            <span className="size-4 rounded-full bg-[#050038]/15" />
            Topic
          </span>
          <span
            aria-hidden
            className="absolute top-6 right-0 hidden items-center gap-1 rounded-md bg-[#FFD02F] px-2 py-1 text-[11px] font-medium text-[#050038] sm:inline-flex"
          >
            Studio
          </span>

          <h2
            className={cn(
              landSerif,
              "mx-auto max-w-[18ch] text-[2.35rem] leading-[1.08] sm:text-5xl lg:text-[3.25rem]",
            )}
          >
            From one sentence to a post you can publish
          </h2>
          <p className={cn(landMuted, "mx-auto mt-4 max-w-lg")}>
            Deckva keeps the topic, the slides, and the file in one project.
          </p>
        </RevealItem>
      </RevealStagger>

      <RevealStagger
        stagger={0.12}
        className="mt-12 grid gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4"
      >
        {CARDS.map((card) => (
          <RevealItem key={card.label}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/50" />
              <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-6">
                <div>
                  <p
                    className={cn(
                      "font-[family-name:var(--font-landing-serif)] text-4xl leading-none font-medium tracking-tight sm:text-5xl",
                    )}
                  >
                    {card.metric}
                  </p>
                  <p className="mt-2 max-w-[14ch] text-[14px] leading-snug text-white/85">
                    {card.label}
                  </p>
                </div>
                <p className="text-[13px] font-medium tracking-wide text-white/80">
                  {card.foot}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealStagger>

      <RevealStagger
        stagger={0.1}
        className="mt-12 grid gap-8 border-t border-[#050038]/08 pt-10 sm:grid-cols-3 sm:gap-6 dark:border-white/10"
      >
        {STATS.map((stat) => (
          <RevealItem key={stat.label} soft className="text-center">
            <p className={cn(landSerif, "text-4xl sm:text-5xl")}>{stat.value}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#050038]/55 dark:text-land-ink/55">
              {stat.label}
            </p>
          </RevealItem>
        ))}
      </RevealStagger>
    </div>
  );
}
