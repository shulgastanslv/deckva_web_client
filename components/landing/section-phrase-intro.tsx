"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { landSectionPad, landSerif } from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

/**
 * Sticky scroll beat: a big phrase rises in, holds, then yields to children.
 */
export function SectionPhraseIntro({
  id,
  phrase,
  children,
  heightVh = 160,
}: {
  id?: string;
  phrase: string;
  children: ReactNode;
  heightVh?: number;
}) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    mass: 0.35,
    restDelta: 0.001,
  });

  const phraseOpacity = useTransform(
    progress,
    [0, 0.14, 0.42, 0.62],
    [0, 1, 1, 0],
  );
  const phraseY = useTransform(
    progress,
    [0, 0.14, 0.42, 0.62],
    [40, 0, -8, -52],
  );
  const phraseScale = useTransform(progress, [0.14, 0.62], [0.96, 0.98]);

  const contentOpacity = useTransform(progress, [0.48, 0.72], [0, 1]);
  const contentY = useTransform(progress, [0.48, 0.78], [56, 0]);
  const contentScale = useTransform(progress, [0.48, 0.78], [0.96, 1]);

  if (reduceMotion) {
    return (
      <section id={id} className={cn("scroll-mt-28", landSectionPad)}>
        <div className="mx-auto mb-8 max-w-[1100px] px-4 text-center">
          <h2
            className={cn(
              landSerif,
              "text-[clamp(2.75rem,10vw,5.5rem)] leading-[0.95]",
            )}
          >
            {phrase}
          </h2>
        </div>
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative scroll-mt-28"
      style={{ height: `${heightVh}vh` }}
    >
      <div
        className={cn(
          "sticky top-0 flex h-svh items-center justify-center overflow-hidden",
          landSectionPad,
        )}
      >
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <motion.h2
            style={{
              opacity: phraseOpacity,
              y: phraseY,
              scale: phraseScale,
            }}
            className={cn(
              landSerif,
              "max-w-[16ch] px-6 text-center text-[clamp(3rem,11vw,6.5rem)] leading-[0.92] tracking-tight",
            )}
          >
            {phrase}
          </motion.h2>
        </div>

        <motion.div
          style={{
            opacity: contentOpacity,
            y: contentY,
            scale: contentScale,
          }}
          className="relative z-10 w-full"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
