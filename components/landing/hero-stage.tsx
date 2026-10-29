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
    author: "deckva",
    avatar: "/post_logo.jpg",
    verified: true,
    time: "1h",
    liked: true,
    topic: "Примеры",
    text: "Примеры каруселей, которые были созданы в Deckva.",
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
    author: "deckva",
    avatar: "/post_logo.jpg",
    time: "3h",
    topic: "Примеры",
    text: "Примеры каруселей, которые были созданы в Deckva.",
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
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "hero";
}) {
  const hero = size === "hero";
  return (
    <div
      className={cn(
        "relative mx-auto overflow-hidden border-land-panel bg-land-panel",
        hero
          ? "h-[520px] w-[260px] rounded-[2.75rem] border-[7px] sm:h-[600px] sm:w-[300px] sm:rounded-[3rem] sm:border-[8px] lg:h-[640px] lg:w-[320px]"
          : "h-[520px] w-[260px] rounded-[2.75rem] border-[7px] shadow-2xl sm:h-[600px] sm:w-[300px] sm:rounded-[3rem] sm:border-[8px]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute left-1/2 top-0 z-30 -translate-x-1/2 rounded-b-2xl bg-black",
          hero ? "h-6 w-28 sm:h-7 sm:w-32" : "h-7 w-32",
        )}
      />
      <div
        className={cn(
          "h-full w-full overflow-hidden bg-black",
          hero ? "rounded-[2.1rem] sm:rounded-[2.2rem]" : "rounded-[2.2rem]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Threads phone with editable posts — pass your own `posts` to swap content. */
export function ThreadsPhone({
  posts = HERO_POST_A,
  className,
  size = "default",
  compact,
}: {
  posts?: ThreadsPostData[];
  className?: string;
  size?: "default" | "hero";
  compact?: boolean;
}) {
  return (
    <PhoneFrame className={className} size={size}>
      <ThreadsUI
        posts={posts}
        compact={compact ?? false}
        autoplay={size === "hero"}
        showReplyBar={size !== "hero"}
        showTabBar={size !== "hero"}
      />
    </PhoneFrame>
  );
}

export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yBack = useTransform(scrollYProgress, [0, 1], [20, -40]);
  const yFront = useTransform(scrollYProgress, [0, 1], [12, -28]);

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center overflow-visible"
    >
      <div className="relative mx-auto h-[560px] w-full max-w-xl sm:h-[640px] lg:h-[700px]">
        <motion.div
          className="absolute left-[-4%] top-10 z-10 hidden origin-top rotate-[-8deg] sm:block"
          style={reduce ? undefined : { y: yBack }}
        >
          <ThreadsPhone posts={HERO_POST_B} size="hero" className="opacity-80" />
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-0 z-20 origin-top -translate-x-1/2 rotate-[6deg] sm:left-auto sm:right-[-2%] sm:translate-x-0"
          style={reduce ? undefined : { y: yFront }}
        >
          <ThreadsPhone posts={HERO_POST_A} size="hero" />
        </motion.div>
      </div>
    </div>
  );
}
