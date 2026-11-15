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
      front: [
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

/** Two large phones — stacked at rest, fan open on scroll. */
function HeroPhones({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const posts = useHeroPosts();

  const backX = useTransform(progress, [0, 1], ["0%", "-10%"]);
  const backY = useTransform(progress, [0, 1], ["0%", "-2%"]);
  const backRotate = useTransform(progress, [0, 1], [-6, -18]);
  const backScale = useTransform(progress, [0, 1], [1, 1.04]);

  const frontX = useTransform(progress, [0, 1], ["0%", "6%"]);
  const frontY = useTransform(progress, [0, 1], ["0%", "2%"]);
  const frontRotate = useTransform(progress, [0, 1], [0, 10]);
  const frontScale = useTransform(progress, [0, 1], [1, 1.06]);

  return (
    <div className="pointer-events-none relative mx-auto w-full max-w-[22rem] sm:max-w-[30rem] lg:max-w-[36rem]">
      <motion.div
        className="absolute top-5 left-[2%] z-[1] w-[72%] origin-bottom sm:top-7 sm:left-[3%] sm:w-[66%]"
        style={
          reduceMotion
            ? undefined
            : {
                x: backX,
                y: backY,
                rotate: backRotate,
                scale: backScale,
              }
        }
      >
        <ThreadsPhone
          posts={posts.back}
          className={cn("w-full", reduceMotion && "-rotate-6")}
        />
      </motion.div>

      <motion.div
        className="relative z-10 ml-auto w-[90%] origin-bottom sm:w-[82%]"
        style={
          reduceMotion
            ? undefined
            : {
                x: frontX,
                y: frontY,
                rotate: frontRotate,
                scale: frontScale,
              }
        }
      >
        <ThreadsPhone posts={posts.front} size="hero" className="w-full" />
      </motion.div>
    </div>
  );
}

/** Scroll-driven hero: text above phones; phones fan open while scrolling. */
export function HeroSection() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const phonesLift = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const inner = (
    <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-stretch gap-8 px-4 pt-[calc(6.5rem+env(safe-area-inset-top))] pb-12 sm:gap-10 sm:px-6 sm:pb-16 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-16 lg:pb-20">
      <motion.div
        className="flex w-full max-w-xl flex-col items-start text-left lg:w-[28rem] lg:shrink-0"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.65, ease: easeOut }
        }
      >
        <h1 className="max-w-[14ch] text-5xl font-semibold tracking-tight leading-[0.96] sm:text-6xl lg:text-7xl">
          {t("hero.title")}
        </h1>
        <p className="mt-5 max-w-md text-lg leading-snug text-white/80 sm:mt-6 sm:text-xl">
          {t("hero.sub")}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-start gap-x-5 gap-y-3 sm:mt-8">
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
        className="w-full lg:max-w-[36rem]"
        style={reduceMotion ? undefined : { y: phonesLift }}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.8, delay: 0.1, ease: easeOut }
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
        {inner}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-land-blue text-white"
      style={{ height: "180vh" }}
    >
      <div className="sticky top-0 overflow-x-clip">{inner}</div>
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
