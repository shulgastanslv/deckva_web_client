"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  LandingHead,
  LandingLayer,
  LandingSection,
} from "@/components/landing/landing-shell";

const FRAMES = [
  { src: "/landing/slide-a.jpg", label: "01 · Cover" },
  { src: "/landing/slide-b.jpg", label: "02 · Hook" },
  { src: "/landing/slide-c.jpg", label: "03 · Middle" },
  { src: "/landing/slide-d.jpg", label: "04 · Proof" },
  { src: "/landing/slide-e.jpg", label: "05 · Close" },
  { src: "/landing/slide-f.jpg", label: "06 · CTA" },
] as const;

function Frame({ src, label }: { src: string; label: string }) {
  return (
    <figure className="relative w-[148px] shrink-0 overflow-hidden rounded-2xl sm:w-[176px]">
      <div className="aspect-4/5 w-full bg-land-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-land-ink/80 to-transparent px-3 pb-2.5 pt-8 text-[11px] font-semibold tracking-wide text-white">
        {label}
      </figcaption>
    </figure>
  );
}

export function SlideMarquee() {
  const reduce = useReducedMotion();
  const loop = [...FRAMES, ...FRAMES];

  return (
    <LandingSection>
      <LandingHead
        eyebrow="Frames"
        title="Real slides, not diagrams"
        text="Covers, middles, endings — the same rhythm you ship to the feed."
      />

      <LandingLayer className="bg-land-card py-5 ring-1 ring-land-ink/5 sm:py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />

        <motion.div
          className="flex w-max gap-3 px-4 sm:gap-3.5 sm:px-5"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={
            reduce
              ? undefined
              : { duration: 42, ease: "linear", repeat: Infinity }
          }
        >
          {loop.map((frame, i) => (
            <Frame
              key={`${frame.src}-${i}`}
              src={frame.src}
              label={frame.label}
            />
          ))}
        </motion.div>
      </LandingLayer>
    </LandingSection>
  );
}
