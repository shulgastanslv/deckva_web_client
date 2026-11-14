"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { landSerif } from "@/components/landing/landing-shell";
import { RevealItem, RevealStagger } from "@/components/landing/reveal";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  title: string;
  points: readonly string[];
  cta: string;
  href: string;
  place: string;
  reverse?: boolean;
  Visual: () => ReactNode;
};

function TopicVisual() {
  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center p-6 sm:min-h-[340px] sm:p-8">
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1d24]">
          <p className="text-[11px] font-medium tracking-wide text-[#050038]/45 uppercase dark:text-white/45">
            Topic
          </p>
          <p className="mt-2 text-[15px] leading-snug text-[#050038] dark:text-white">
            A launch plan in six slides
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 flex-1 rounded-xl bg-white p-2 shadow-sm dark:bg-[#1c1d24]"
            >
              <div className="h-full rounded-lg bg-[#E8EEFF] dark:bg-[#243048]" />
            </div>
          ))}
        </div>
        <span className="absolute -top-3 right-4 rounded-md bg-[#7C5CFF] px-2 py-1 text-[11px] font-medium text-white">
          AI layout
        </span>
        <span className="absolute -bottom-2 left-6 rounded-full bg-[#3DDC97] px-2 py-1 text-[11px] font-medium text-[#050038]">
          Slides
        </span>
      </div>
    </div>
  );
}

function EditVisual() {
  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center p-6 sm:min-h-[340px] sm:p-8">
      <div className="relative grid w-full max-w-md grid-cols-[0.9fr_1.1fr] gap-3">
        <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-[#1c1d24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/reviews/2.jpg"
            alt=""
            className="aspect-[4/5] w-full rounded-xl object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-[#FFF6C8] p-3 text-[#050038] shadow-sm">
            <p className="text-[12px] font-medium">Cover line</p>
            <p className="mt-1 text-[13px] leading-snug opacity-70">
              Rewrite any frame. Nothing is locked.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-[#1c1d24]">
            <div className="h-2 w-3/4 rounded-full bg-[#050038]/10 dark:bg-white/10" />
            <div className="mt-2 h-2 w-1/2 rounded-full bg-[#050038]/10 dark:bg-white/10" />
            <div className="mt-2 h-2 w-2/3 rounded-full bg-[#050038]/10 dark:bg-white/10" />
          </div>
        </div>
        <span className="absolute top-8 right-8 rounded-md bg-[#FF5F57] px-2 py-1 text-[11px] font-medium text-white">
          Edit
        </span>
      </div>
    </div>
  );
}

function ExportVisual() {
  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center p-6 sm:min-h-[340px] sm:p-8">
      <div className="relative flex w-full max-w-sm items-end justify-center gap-3">
        <div className="w-24 -rotate-6 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1c1d24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/reviews/3.jpg"
            alt=""
            className="aspect-[4/5] w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="z-10 w-28 overflow-hidden rounded-2xl bg-white shadow-md dark:bg-[#1c1d24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/reviews/4.jpg"
            alt=""
            className="aspect-[4/5] w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="w-24 rotate-6 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1c1d24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/reviews/1.jpg"
            alt=""
            className="aspect-[4/5] w-full object-cover"
            loading="lazy"
          />
        </div>
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-md bg-[#FFD02F] px-2.5 py-1 text-[11px] font-medium text-[#050038]">
          PNG · ZIP
        </span>
      </div>
    </div>
  );
}

const FEATURES: Feature[] = [
  {
    id: "generate",
    title: "Turn a topic into ordered slides",
    points: [
      "Name what the post is about — one sentence is enough",
      "Deckva lays the slides out in feed order",
      "Open the project and keep editing from there",
    ],
    cta: "Try a topic",
    href: "/studio",
    place: "feature_generate",
    Visual: TopicVisual,
  },
  {
    id: "edit",
    title: "Shape every slide on the canvas",
    points: [
      "Rewrite a line, swap the cover, move a frame",
      "Nothing is locked after generation",
      "Desktop canvas built for carousel work",
    ],
    cta: "Open the studio",
    href: "/studio",
    place: "feature_edit",
    reverse: true,
    Visual: EditVisual,
  },
  {
    id: "export",
    title: "Download a post ready to publish",
    points: [
      "PNG of one slide, or a ZIP of the whole set",
      "No watermark on the way out",
      "Same project from topic to file",
    ],
    cta: "See pricing",
    href: "#pricing",
    place: "feature_export",
    Visual: ExportVisual,
  },
];

export function FeatureBlocks() {
  return (
    <div id="features" className="mx-auto flex w-full max-w-[1040px] flex-col gap-16 sm:gap-20">
      {FEATURES.map((feature) => (
        <RevealStagger
          key={feature.id}
          stagger={0.12}
          className={cn(
            "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
            feature.reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <RevealItem>
            <h3
              className={cn(
                landSerif,
                "max-w-[16ch] text-[2rem] leading-[1.1] sm:text-[2.35rem]",
              )}
            >
              {feature.title}
            </h3>
            <ul className="mt-6 space-y-3">
              {feature.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-[15px] leading-relaxed text-[#050038]/65 dark:text-land-ink/65"
                >
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[#050038]/35 dark:bg-land-ink/40"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 h-11 rounded-full bg-[#050038] px-5 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-land-ink dark:text-land-mist"
            >
              <a
                href={feature.href}
                onClick={() =>
                  trackEvent("landing_cta_click", { place: feature.place })
                }
              >
                {feature.cta}
              </a>
            </Button>
          </RevealItem>

          <RevealItem>
            <div
              className={cn(
                "relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]",
                "bg-[#F0F0EC] dark:bg-[#1c1d24]",
              )}
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(5,0,56,0.08) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <feature.Visual />
            </div>
          </RevealItem>
        </RevealStagger>
      ))}
    </div>
  );
}
