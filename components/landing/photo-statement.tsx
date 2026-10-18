"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function PhotoStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.4rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/statement-feed.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[#14151c]/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14151c]/80 via-[#14151c]/45 to-transparent" />

        <div className="relative z-10 flex min-h-[320px] flex-col justify-end px-6 py-8 sm:min-h-[380px] sm:px-10 sm:py-12">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <p className="text-sm font-bold tracking-wide text-white/70">
              Atmosphere
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              The feed wants a story.
              <br />
              Not another blank slide.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Cover, middle, and ending already in place — edit the words, not
              the structure.
            </p>
            <Link
              href="/studio"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#14151c]"
            >
              Start
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
