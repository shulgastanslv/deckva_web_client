"use client";

import { useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslations } from "next-intl";

import { ThreadsUI, type ThreadsPostData } from "@/components/landing/threads-ui";
import { PhoneFrame } from "@/components/canvas/phone-frame";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { FREE_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export { PhoneFrame };

/** @deprecated Prefer inserting frames via ThreadsUI `media` */
export const THREAD_SHOTS = [
  "/reviews/1.jpg",
  "/reviews/2.jpg",
  "/reviews/3.jpg",
] as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

function ThreadsPhone({
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

function useHeroPosts() {
  const t = useTranslations("landing.heroPosts");

  return useMemo(
    () => ({
      left: [
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
      ] satisfies ThreadsPostData[],
      center: [
        {
          id: "hero-c",
          author: "deckva",
          avatar: "/post_logo.jpg",
          time: t("postB.time"),
          text: t("postB.text"),
          media: ["/reviews/5.jpg", "/reviews/7.jpg", "/reviews/9.jpg"],
          likes: "64",
          replies: "9",
          reposts: "4",
        },
      ] satisfies ThreadsPostData[],
      right: [
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
      ] satisfies ThreadsPostData[],
    }),
    [t],
  );
}

function HeroPhones({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const posts = useHeroPosts();

  const leftX = useTransform(progress, [0, 1], ["12%", "-28%"]);
  const leftY = useTransform(progress, [0, 1], ["10%", "4%"]);
  const leftRotate = useTransform(progress, [0, 1], [-6, -16]);
  const leftScale = useTransform(progress, [0, 1], [0.72, 0.98]);

  const midX = useTransform(progress, [0, 1], ["2%", "-2%"]);
  const midY = useTransform(progress, [0, 1], ["18%", "0%"]);
  const midRotate = useTransform(progress, [0, 1], [2, 0]);
  const midScale = useTransform(progress, [0, 1], [0.78, 1.08]);
  const midOpacity = useTransform(progress, [0, 0.2, 0.55], [0, 0.35, 1]);

  const rightX = useTransform(progress, [0, 1], ["-4%", "26%"]);
  const rightY = useTransform(progress, [0, 1], ["6%", "8%"]);
  const rightRotate = useTransform(progress, [0, 1], [4, 14]);
  const rightScale = useTransform(progress, [0, 1], [0.86, 1]);

  if (reduceMotion) {
    return (
      <div className="relative mx-auto flex h-[min(70vh,620px)] w-full max-w-[40rem] items-end justify-center">
        <ThreadsPhone
          posts={posts.left}
          className="absolute bottom-[8%] left-[4%] z-[1] w-[42%] -rotate-[14deg]"
        />
        <ThreadsPhone
          posts={posts.center}
          size="hero"
          className="relative z-[3] w-[48%]"
        />
        <ThreadsPhone
          posts={posts.right}
          className="absolute right-[2%] bottom-[6%] z-[2] w-[44%] rotate-[12deg]"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[min(72vh,640px)] w-full max-w-[42rem]">
      <motion.div
        style={{
          x: leftX,
          y: leftY,
          rotate: leftRotate,
          scale: leftScale,
        }}
        className="absolute bottom-0 left-1/2 z-[1] w-[46%] origin-bottom -translate-x-1/2 will-change-transform"
      >
        <ThreadsPhone posts={posts.left} className="w-full" />
      </motion.div>

      <motion.div
        style={{
          x: midX,
          y: midY,
          rotate: midRotate,
          scale: midScale,
          opacity: midOpacity,
        }}
        className="absolute bottom-0 left-1/2 z-[3] w-[52%] origin-bottom -translate-x-1/2 will-change-transform"
      >
        <ThreadsPhone posts={posts.center} size="hero" className="w-full" />
      </motion.div>

      <motion.div
        style={{
          x: rightX,
          y: rightY,
          rotate: rightRotate,
          scale: rightScale,
        }}
        className="absolute bottom-0 left-1/2 z-[2] w-[48%] origin-bottom -translate-x-1/2 will-change-transform"
      >
        <ThreadsPhone posts={posts.right} className="w-full" />
      </motion.div>
    </div>
  );
}

/** Scroll-driven hero: phones fan open as the section is scrolled. */
export function HeroSection() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.45, 0.8], [1, 0.7, 0.15]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const copyScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const phonesY = useTransform(scrollYProgress, [0, 1], [28, -12]);

  const content = (
    <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col items-center justify-center gap-8 px-4 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-10 sm:gap-10 sm:px-6 lg:flex-row lg:items-center lg:justify-center lg:gap-8 lg:px-16 lg:pb-16">
      <motion.div
        className="flex w-full max-w-xl flex-col items-start text-left lg:w-[28rem] lg:shrink-0"
        style={
          reduceMotion
            ? undefined
            : { opacity: copyOpacity, y: copyY, scale: copyScale }
        }
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.7, ease: easeOut }
        }
      >
        <h1 className="max-w-[14ch] text-5xl font-semibold tracking-tight leading-[0.96] sm:text-6xl lg:text-7xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-md text-xl leading-snug text-white/80">
          {t("hero.sub")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-start gap-x-5 gap-y-3">
          <Button
            asChild
            className="h-12 rounded-full bg-white px-6 text-land-blue hover:bg-white/90"
          >
            <a
              href="/studio"
              onClick={() =>
                trackEvent("landing_cta_click", { place: "hero" })
              }
            >
              {t("ctaStudio")}
            </a>
          </Button>
          <a
            href="#features"
            className="text-sm font-medium text-white/75 hover:text-white"
          >
            {t("hero.howLink")}
          </a>
        </div>
        <p className="mt-4 text-sm text-white/65">
          {t("freeLine", { count: FREE_GENERATION_LIMIT })}
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-[28rem] sm:max-w-[36rem] lg:max-w-[42rem]"
        style={reduceMotion ? undefined : { y: phonesY }}
        initial={reduceMotion ? false : { opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.85, delay: 0.12, ease: easeOut }
        }
      >
        <HeroPhones
          progress={scrollYProgress}
          reduceMotion={Boolean(reduceMotion)}
        />
      </motion.div>
    </div>
  );

  if (reduceMotion) {
    return (
      <section className="relative overflow-hidden bg-land-blue text-white">
        <div className="min-h-[calc(100svh-1rem)]">{content}</div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-land-blue text-white"
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">{content}</div>
    </section>
  );
}

/** @deprecated Use HeroSection — kept for older imports */
export function HeroStage() {
  const posts = useHeroPosts();
  return (
    <div className="pointer-events-none relative mx-auto w-full max-w-[28rem] sm:max-w-[36rem]">
      <ThreadsPhone
        posts={posts.left}
        className="absolute top-6 left-[4%] w-[66%] origin-center -rotate-6 sm:top-8 sm:left-[5%] sm:w-[62%]"
      />
      <ThreadsPhone
        posts={posts.right}
        size="hero"
        className="relative z-10 ml-auto w-[86%] sm:w-[78%]"
      />
    </div>
  );
}
