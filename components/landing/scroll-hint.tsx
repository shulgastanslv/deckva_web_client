"use client";

import { motion, useReducedMotion } from "motion/react";

export function ScrollHint({ href = "#studio" }: { href?: string }) {
  const reduce = useReducedMotion();

  return (
    <a
      href={href}
      aria-label="Листать вниз"
      className="absolute bottom-8 left-1/2 z-100 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white sm:bottom-10"
    >
      <span className="text-[11px] font-medium tracking-[0.2em] uppercase">
        Scroll
      </span>
      <motion.span
        className="flex h-9 w-5 items-start justify-center rounded-full border border-white/35 pt-1.5"
        aria-hidden
      >
        <motion.span
          className="size-1 rounded-full bg-white"
          animate={reduce ? undefined : { y: [0, 10, 0], opacity: [1, 0.35, 1] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.span>
    </a>
  );
}
