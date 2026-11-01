"use client";

import type { ReactNode } from "react";

import { ThreadsUI, type ThreadsPostData } from "@/components/landing/threads-ui";
import { cn } from "@/lib/utils";

/** Front-facing iPhone 17 Pro, silver. Screen hole from the frame's template. */
const IPHONE_17_PRO = {
  src: "/mockups/iphone-17-pro-silver.png",
  width: 1406,
  height: 2822,
  screen: { x: 100, y: 100, width: 1206, height: 2622 },
} as const;

/** @deprecated Prefer inserting frames via ThreadsUI `media` */
export const THREAD_SHOTS = [
  "/reviews/1.jpg",
  "/reviews/2.jpg",
  "/reviews/3.jpg",
] as const;

const HERO_POST_B: ThreadsPostData[] = [
  {
    id: "hero-b",
    author: "deckva",
    avatar: "/post_logo.jpg",
    time: "3h",
    text: "One idea, already in order.",
    media: ["/reviews/6.jpg", "/reviews/8.jpg", "/reviews/4.jpg"],
    likes: "97",
    replies: "12",
    reposts: "6",
  },
];

const HERO_POST_A: ThreadsPostData[] = [
  {
    id: "hero-a",
    author: "deckva",
    avatar: "/post_logo.jpg",
    verified: true,
    time: "1h",
    liked: true,
    topic: "Examples",
    text: "Carousels made in Deckva.",
    media: ["/reviews/1.jpg", "/reviews/2.jpg", "/reviews/3.jpg"],
    likes: "214",
    replies: "31",
    reposts: "18",
  },
];

export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "hero";
}) {
  const { width, height, screen } = IPHONE_17_PRO;
  // Glass corner is a circle (~230px on the source frame). A single % radius
  // uses the tall side for the vertical curve and pulls the UI off the bezel.
  const bleed = 12;
  return (
    <div
      className={cn("relative mx-auto w-[270px]", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: `${((screen.x - bleed) / width) * 100}%`,
          top: `${((screen.y - bleed) / height) * 100}%`,
          width: `${((screen.width + bleed * 2) / width) * 100}%`,
          height: `${((screen.height + bleed * 2) / height) * 100}%`,
          borderRadius: "17.5% / 8.1%",
        }}
      >
        <div className="h-full w-full">{children}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IPHONE_17_PRO.src}
        alt=""
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
        draggable={false}
      />
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
        showReplyBar={false}
        showTabBar
      />
    </PhoneFrame>
  );
}

export function HeroStage() {
  return (
    <div className="pointer-events-none relative mx-auto flex w-full max-w-[520px] items-center justify-center">
      <ThreadsPhone
        posts={HERO_POST_B}
        className="w-[46%] origin-center -rotate-6"
      />
      <ThreadsPhone
        posts={HERO_POST_A}
        size="hero"
        className="relative z-10 -ml-[10%] w-[52%]"
      />
    </div>
  );
}
