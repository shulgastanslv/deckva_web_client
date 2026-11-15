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
      back: [
        {
          id: "hero-b",
          author: "alex",
          avatar: "/post_logo.jpg",
          time: t("postB.time"),
          text: t("postB.text"),
          media: ["/reviews/6.jpg", "/reviews/8.jpg", "/reviews/4.jpg"],
          likes: "97",
          replies: "12",
          reposts: "6",
        },
      ] satisfies ThreadsPostData[],
      front: [
        {
          id: "hero-a",
          author: "mira",
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

  const backX = useTransform(progress, [0, 1], ["0%", "-3%"]);
  const backRotate = useTransform(progress, [0, 1], [-6, -9]);
  const frontX = useTransform(progress, [0, 1], ["0%", "2%"]);
  const frontRotate = useTransform(progress, [0, 1], [0, 3]);

  return (
    <div className="pointer-events-none relative mx-auto w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem]">
      <motion.div
        className="absolute top-5 left-[2%] z-[1] w-[70%] origin-top sm:top-7 sm:left-[3%] sm:w-[64%]"
        style={
          reduceMotion ? undefined : { x: backX, rotate: backRotate }
        }
      >
        <ThreadsPhone
          posts={posts.back}
          className={cn("w-full", reduceMotion && "-rotate-6")}
        />
      </motion.div>

      <motion.div
        className="relative z-10 ml-auto w-[88%] origin-top sm:w-[80%]"
        style={
          reduceMotion ? undefined : { x: frontX, rotate: frontRotate }
        }
      >
        <ThreadsPhone posts={posts.front} size="hero" className="w-full" />
      </motion.div>
    </div>
  );
}

/**
 * Text on top; phones fill the rest of the viewport and are clipped by
 * the bottom edge of the hero (~half device visible).
 */
export function HeroSection() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const inner = (
    <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col px-4 pt-[calc(5.75rem+env(safe-area-inset-top))] sm:px-6 lg:flex-row lg:items-stretch lg:gap-12 lg:px-16 lg:pt-[calc(6.5rem+env(safe-area-inset-top))]">
      <motion.div
        className="flex w-full shrink-0 flex-col items-start text-left lg:w-[28rem] lg:self-center lg:pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.65, ease: easeOut }
        }
      >
        <h1 className="max-w-[14ch] text-4xl font-semibold tracking-tight leading-[0.96] sm:text-5xl lg:text-7xl">
          {t("hero.title")}
        </h1>
        <p className="mt-4 max-w-md text-base leading-snug text-white/80 sm:mt-5 sm:text-xl">
          {t("hero.sub")}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-start gap-x-5 gap-y-3 sm:mt-7">
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
        <p className="mt-3 text-sm text-white/65 sm:mt-4">
          {t("freeLine", { count: FREE_GENERATION_LIMIT })}
        </p>
      </motion.div>

      {/* Fills remaining height; bottom edge = crop line through phones */}
      <motion.div
        className="relative mt-8 min-h-0 w-full flex-1 overflow-hidden sm:mt-10 lg:mt-0 lg:max-w-[32rem]"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.8, delay: 0.1, ease: easeOut }
        }
      >
        <div className="absolute inset-x-0 top-0">
          <HeroPhones
            progress={scrollYProgress}
            reduceMotion={Boolean(reduceMotion)}
          />
        </div>
      </motion.div>
    </div>
  );

  if (reduceMotion) {
    return (
      <section className="relative overflow-hidden bg-land-blue text-white">
        <div className="h-svh">{inner}</div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-land-blue text-white"
      style={{ height: "140vh" }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">{inner}</div>
    </section>
  );
}

/** @deprecated Use HeroSection — kept for older imports */
export function HeroStage() {
  const posts = useHeroPosts();
  return (
    <div className="pointer-events-none relative mx-auto w-full max-w-[28rem] sm:max-w-[36rem]">
      <ThreadsPhone
        posts={posts.back}
        className="absolute top-6 left-[4%] w-[66%] origin-center -rotate-6 sm:top-8 sm:left-[5%] sm:w-[62%]"
      />
      <ThreadsPhone
        posts={posts.front}
        size="hero"
        className="relative z-10 ml-auto w-[86%] sm:w-[78%]"
      />
    </div>
  );
}
