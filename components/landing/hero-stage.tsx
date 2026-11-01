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
  return (
    <div
      className={cn("relative mx-auto w-[270px]", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: `${(screen.x / width) * 100}%`,
          top: `${(screen.y / height) * 100}%`,
          width: `${(screen.width / width) * 100}%`,
          height: `${(screen.height / height) * 100}%`,
          borderRadius: "11.5%",
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
    <div className="pointer-events-none flex justify-center">
      <ThreadsPhone
        posts={HERO_POST_A}
        size="hero"
        className="w-[min(86vw,300px)]"
      />
    </div>
  );
}
