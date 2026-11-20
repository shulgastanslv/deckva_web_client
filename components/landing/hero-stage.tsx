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

import { heroThreadsPosts } from "@/components/landing/threads-content";
import { ThreadsUI, type ThreadsPostData } from "@/components/landing/threads-ui";
import { IPHONE_17_PRO, PhoneFrame } from "@/components/canvas/phone-frame";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export { PhoneFrame };

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Native phone aspect (width / height). */
const PHONE_AR = IPHONE_17_PRO.width / IPHONE_17_PRO.height;

/** Front phone width as a fraction of the stack stage. */
const PHONE_W = 0.8;
/** Back phone — slightly smaller so it reads farther away. */
const BACK_PHONE_W = 0.72;
/** Extra stage height for the offset + tilted pair. */
const STACK_Y = 1;

const phoneShadow = "drop-shadow-[0_18px_40px_rgba(0,0,0,0.28)]";

function ThreadsPhone({
  posts,
  autoplay = false,
  className,
}: {
  posts: ThreadsPostData[];
  autoplay?: boolean;
  className?: string;
}) {
  return (
    <PhoneFrame size="fluid" className={cn(phoneShadow, className)}>
      <ThreadsUI
        posts={posts}
        autoplay={autoplay}
        showReplyBar={false}
        showTabBar
      />
    </PhoneFrame>
  );
}

function useHeroPosts() {
  const t = useTranslations("landing.heroPosts");

  return useMemo(
    () =>
      heroThreadsPosts({
        front: {
          text: t("postA.text"),
          time: t("postA.time"),
          topic: t("postA.topic"),
        },
        back: {
          text: t("postB.text"),
          time: t("postB.time"),
        },
        comments: {
          c1: { text: t("comments.c1.text"), time: t("comments.c1.time") },
          c1r1: {
            text: t("comments.c1r1.text"),
            time: t("comments.c1r1.time"),
          },
          c2: { text: t("comments.c2.text"), time: t("comments.c2.time") },
          b1: { text: t("comments.b1.text"), time: t("comments.b1.time") },
        },
      }),
    [t],
  );
}

function PhoneStack({
  front,
  back,
  className,
  reduceMotion,
  backX,
  backRotate,
  frontX,
  frontRotate,
}: {
  front: ThreadsPostData[];
  back: ThreadsPostData[];
  className?: string;
  reduceMotion: boolean | null;
  backX?: MotionValue<string>;
  backRotate?: MotionValue<number>;
  frontX?: MotionValue<string>;
  frontRotate?: MotionValue<number>;
}) {
  return (
    <div
      className={cn("pointer-events-none relative", className)}
      style={{
        aspectRatio: `${1} / ${(PHONE_W / PHONE_AR) * STACK_Y}`,
      }}
    >
      <motion.div
        className="absolute top-0 left-0 z-[1]"
        style={{
          width: `${BACK_PHONE_W * 100}%`,
          ...(reduceMotion
            ? { rotate: -6 }
            : { x: backX, rotate: backRotate }),
        }}
      >
        <ThreadsPhone posts={back} />
      </motion.div>

      <motion.div
        className="absolute right-0 bottom-0 z-10"
        style={{
          width: `${PHONE_W * 100}%`,
          ...(reduceMotion
            ? { rotate: 3 }
            : { x: frontX, rotate: frontRotate }),
        }}
      >
        <ThreadsPhone posts={front} autoplay />
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const posts = useHeroPosts();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backX = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  const backRotate = useTransform(scrollYProgress, [0, 1], [-6, -12]);
  const frontX = useTransform(scrollYProgress, [0, 1], ["0%", "4%"]);
  const frontRotate = useTransform(scrollYProgress, [0, 1], [3, 8]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90svh] overflow-x-clip dark:bg-background bg-land-blue text-white"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col px-4 pt-[calc(6.5rem+env(safe-area-inset-top))] pb-16 sm:px-6 sm:pb-20 lg:min-h-[100svh] lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-[calc(7rem+env(safe-area-inset-top))] xl:gap-16">
        <motion.div
          className="flex w-full shrink-0 flex-col items-start text-left lg:w-[26rem] xl:w-[28rem]"
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
            {t("freeLine", { count: DAILY_GENERATION_LIMIT })}
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-6 w-[min(100%,24rem)] sm:w-[min(100%,28rem)] lg:mx-0 lg:mt-0 lg:w-[min(100%,30rem)] xl:w-[32rem]"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.8, delay: 0.1, ease: easeOut }
          }
        >
          <PhoneStack
            front={posts.front}
            back={posts.back}
            reduceMotion={reduceMotion}
            backX={backX}
            backRotate={backRotate}
            frontX={frontX}
            frontRotate={frontRotate}
          />
        </motion.div>
      </div>
    </section>
  );
}

/** @deprecated Use HeroSection — kept for older imports */
export function HeroStage() {
  const posts = useHeroPosts();
  return (
    <PhoneStack
      front={posts.front}
      back={posts.back}
      reduceMotion
      className="mx-auto w-[min(100%,28rem)]"
    />
  );
}
