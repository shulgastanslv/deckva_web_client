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

import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
} from "@/components/landing/landing-shell";

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
  icon,
}: {
  value: MotionValue<number>;
  label: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
      <span className="grid size-10 place-items-center rounded-full bg-land-mist text-land-blue">
        {icon}
      </span>
      <p className="text-5xl font-extrabold tracking-tight text-land-ink sm:text-6xl">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-sm font-medium text-land-ink/55">{label}</p>
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
  const scalePulse = useTransform(smooth, [0, 0.5, 1], [0.96, 1.02, 1]);

  return (
    <LandingSection className="overflow-hidden">
      <div
        ref={ref}
        className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
      >
        <LandingHead
          eyebrow="Reach"
          title={
            <>
              Scroll the feed.
              <br />
              The numbers climb.
            </>
          }
          text="A carousel that stops the thumb earns likes and replies. Watch the counters grow as you move down the page."
        />

        <motion.div style={reduce ? undefined : { scale: scalePulse }}>
          <LandingLayer className="bg-white">
            <LandingPad>
              <div className="relative flex flex-col gap-10 sm:flex-row sm:gap-8">
                <LiveStat
                  value={likes}
                  label="Likes on the post"
                  icon={<Heart className="size-5 fill-land-blue" strokeWidth={0} />}
                />
                <div className="hidden w-px self-stretch bg-land-ink/8 sm:block" />
                <LiveStat
                  value={comments}
                  label="Comments in the thread"
                  icon={<MessageCircle className="size-5" strokeWidth={2.25} />}
                />
              </div>
            </LandingPad>
          </LandingLayer>
        </motion.div>
      </div>
    </LandingSection>
  );
}
