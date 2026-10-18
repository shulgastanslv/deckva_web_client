"use client";

import { motion, useReducedMotion } from "motion/react";

import { CoverClose, CoverHook, CoverList } from "@/components/landing/covers";

export function CoverStack() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-[340px] w-full max-w-[420px] items-center justify-center sm:h-[400px]">
      <motion.div
        className="absolute w-[58%] origin-bottom"
        style={{ rotate: reduce ? -8 : undefined }}
        animate={reduce ? undefined : { rotate: [-10, -6, -10], y: [8, 0, 8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <CoverList className="shadow-xl" />
      </motion.div>
      <motion.div
        className="absolute w-[58%] origin-bottom"
        style={{ rotate: reduce ? 10 : undefined }}
        animate={reduce ? undefined : { rotate: [8, 12, 8], y: [12, 4, 12] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      >
        <CoverClose className="shadow-xl" />
      </motion.div>
      <motion.div
        className="relative z-10 w-[64%]"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <CoverHook className="shadow-2xl ring-1 ring-black/10" />
      </motion.div>
    </div>
  );
}
