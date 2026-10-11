"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { ThreadsUI, type ThreadsPostData } from "@/components/landing/threads-ui";
import { cn } from "@/lib/utils";

/** @deprecated Prefer inserting frames via ThreadsUI `media` */
export const THREAD_SHOTS = [
  "/landing/slide-cover.jpg",
  "/landing/slide-mid.jpg",
  "/landing/slide-end.jpg",
] as const;

const HERO_POST_A: ThreadsPostData[] = [
  {
    id: "hero-a",
    author: "swibp",
    avatar: "post_logo.jpg",
    verified: true,
    time: "1h",
    text: "Explain a launch in six frames. Cover first — then the story.",
    media: [
      "/landing/slide-cover.jpg",
      "/landing/slide-mid.jpg",
      "/landing/slide-end.jpg",
    ],
    likes: "214",
    replies: "31",
    reposts: "18",
  },
];

const HERO_POST_B: ThreadsPostData[] = [
  {
    id: "hero-b",
    author: "swibp",
    avatar: "post_logo.jpg",
    time: "3h",
    text: "One point per frame. The carousel keeps the rhythm.",
    media: [
      "/landing/slide-mid.jpg",
      "/landing/slide-end.jpg",
      "/landing/slide-cover.jpg",
    ],
    likes: "97",
    replies: "12",
  },
];

export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto h-[600px] w-[300px] overflow-hidden rounded-[3rem] border-[8px] border-neutral-900 bg-neutral-950 shadow-2xl",
        "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-20 before:h-full before:w-full before:bg-gradient-to-tr before:from-white/5 before:to-transparent",
        "after:absolute after:-left-[10px] after:top-24 after:h-12 after:w-1 after:rounded-l-md after:bg-neutral-800",
        className
      )}
    >
      <div className="absolute left-1/2 top-0 z-30 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
      <div className="h-full w-full overflow-hidden rounded-[2.2rem] bg-black">
        {children}
      </div>
    </div>
  );
}

/** Threads phone with editable posts — pass your own `posts` to swap content. */
export function ThreadsPhone({
  posts = HERO_POST_A,
  className,
}: {
  posts?: ThreadsPostData[];
  className?: string;
}) {
  return (
    <PhoneFrame className={className}>
      <ThreadsUI posts={posts} />
    </PhoneFrame>
  );
}

export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBack = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotBack = useTransform(scrollYProgress, [0, 1], [-8, -12]);
  const rotFront = useTransform(scrollYProgress, [0, 1], [6, 2]);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden py-2 sm:py-6 lg:py-10"
    >
      <div className="relative mx-auto h-[420px] w-full max-w-4xl sm:h-[540px] lg:h-[620px]">
        <motion.div
          className="absolute left-[6%] top-8 z-10 hidden scale-[0.72] opacity-80 sm:block lg:scale-90"
          style={reduce ? undefined : { y: yBack, rotate: rotBack }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ThreadsPhone posts={HERO_POST_B} />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-0 z-20 origin-top -translate-x-1/2 scale-[0.62] sm:left-auto sm:right-[6%] sm:translate-x-0 sm:scale-[0.78] lg:scale-100"
          style={reduce ? { rotate: 6 } : { y: yFront, rotate: rotFront }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, 15, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <ThreadsPhone posts={HERO_POST_A} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
