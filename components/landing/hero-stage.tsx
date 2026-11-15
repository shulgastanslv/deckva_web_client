"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { ThreadsUI, type ThreadsPostData } from "@/components/landing/threads-ui";
import { PhoneFrame } from "@/components/canvas/phone-frame";
import { cn } from "@/lib/utils";

export { PhoneFrame };

/** @deprecated Prefer inserting frames via ThreadsUI `media` */
export const THREAD_SHOTS = [
  "/reviews/1.jpg",
  "/reviews/2.jpg",
  "/reviews/3.jpg",
] as const;

/** Threads phone with editable posts — pass your own `posts` to swap content. */
export function ThreadsPhone({
  posts,
  className,
  size = "default",
  compact,
}: {
  posts: ThreadsPostData[];
  className?: string;
  size?: "default" | "hero";
  compact?: boolean;
}) {
  return (
    <PhoneFrame className={cn("w-[270px]", className)}>
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
  const t = useTranslations("landing.heroPosts");

  const postB = useMemo<ThreadsPostData[]>(
    () => [
      {
        id: "hero-b",
        author: "deckva",
        avatar: "/post_logo.jpg",
        time: t("postB.time"),
        text: t("postB.text"),
        media: ["/reviews/6.jpg", "/reviews/8.jpg", "/reviews/4.jpg"],
        likes: "97",
        replies: "12",
        reposts: "6",
      },
    ],
    [t],
  );

  const postA = useMemo<ThreadsPostData[]>(
    () => [
      {
        id: "hero-a",
        author: "deckva",
        avatar: "/post_logo.jpg",
        verified: true,
        time: t("postA.time"),
        liked: true,
        topic: t("postA.topic"),
        text: t("postA.text"),
        media: ["/reviews/1.jpg", "/reviews/2.jpg", "/reviews/3.jpg"],
        likes: "214",
        replies: "31",
        reposts: "18",
      },
    ],
    [t],
  );

  return (
    <div className="pointer-events-none relative mx-auto w-full max-w-[28rem] sm:max-w-[36rem]">
      <ThreadsPhone
        posts={postB}
        className="absolute top-6 left-[4%] w-[66%] origin-center -rotate-6 sm:top-8 sm:left-[5%] sm:w-[62%]"
      />
      <ThreadsPhone
        posts={postA}
        size="hero"
        className="relative z-10 ml-auto w-[86%] sm:w-[78%]"
      />
    </div>
  );
}
