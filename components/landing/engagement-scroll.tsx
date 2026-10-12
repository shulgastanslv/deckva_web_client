"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Heart, MessageCircle } from "lucide-react";

function AnimatedNumber({ value }: { value: MotionValue<number> }) {
  const [display, setDisplay] = useState(() => Math.round(value.get()));
  useMotionValueEvent(value, "change", (latest) => {
    setDisplay(Math.round(latest));
  });
  return (
    <span className="tabular-nums">{display.toLocaleString("en-US")}</span>
  );
}

function LiveStat({
  value,
  label,
}: {
  value: MotionValue<number>;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
      <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-sm font-medium text-[#5c6170]">{label}</p>
    </div>
  );
}

export function EngagementScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  const likes = useTransform(smooth, [0, 1], [12, 1284]);
  const comments = useTransform(smooth, [0, 1], [2, 186]);
  const floatY = useTransform(smooth, [0, 1], [40, -60]);
  const floatY2 = useTransform(smooth, [0, 1], [20, -90]);
  const scalePulse = useTransform(smooth, [0, 0.5, 1], [0.94, 1.02, 1]);

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-6xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
    >
   
      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-sm font-bold tracking-wide text-[#2f5bff]">
            Reach
          </p>
          <h2 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
            Scroll the feed.
            <br />
            The numbers climb.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5c6170] sm:text-base">
            A carousel that stops the thumb earns likes and replies. Watch the
            counters grow as you move down the page.
          </p>
        </div>

        <motion.div
          className="relative rounded-[2rem] bg-[#f4f5f9] p-8 sm:rounded-[2.4rem] sm:p-10"
          style={reduce ? undefined : { scale: scalePulse }}
        >
          <div className="relative flex flex-col gap-10 sm:flex-row sm:gap-8">
            <LiveStat
              value={likes}
              label="Likes on the post"
            />
            <div className="hidden w-px self-stretch bg-black/8 sm:block" />
            <LiveStat
              value={comments}
              label="Comments in the thread"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
