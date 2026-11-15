"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";

import { LANDING_SHOWCASE_YOUTUBE_ID } from "@/lib/landing-media";
import { cn } from "@/lib/utils";

function buildEmbedSrc(id: string, autoplay: boolean) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * Scroll-pinned studio reel: video scales into focus and starts muted
 * so the YouTube block is hard to scroll past unnoticed.
 */
export function EditorShowcase() {
  const t = useTranslations("landing.showcase");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [autoplay, setAutoplay] = useState(false);

  const youtubeId = LANDING_SHOWCASE_YOUTUBE_ID;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const frameScale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.7, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.86, 1, 1, 0.94],
  );
  const frameY = useTransform(
    scrollYProgress,
    [0, 0.3, 1],
    reduceMotion ? [0, 0, 0] : [36, 0, -12],
  );
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.4],
    reduceMotion ? [1, 1, 1] : [1, 1, 0.35],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    // Start the reel once it has filled the stage
    if (value >= 0.22 && value <= 0.85) {
      setAutoplay(true);
    }
  });

  useEffect(() => {
    if (reduceMotion) setAutoplay(false);
  }, [reduceMotion]);

  const embedSrc = youtubeId
    ? buildEmbedSrc(youtubeId, autoplay)
    : null;

  const stage = (
    <div className="relative mx-auto flex h-full w-full max-w-[1100px] flex-col items-center justify-center px-3 py-20 sm:px-5 sm:py-24">
      <motion.div
        style={{ opacity: copyOpacity }}
        className="relative z-10 mb-8 max-w-[20ch] text-center sm:mb-10"
      >
        <h2
          className={cn(
            "font-[family-name:var(--font-landing-serif)]",
            "text-[2.35rem] leading-[1.05] font-medium tracking-tight text-white",
            "sm:text-5xl lg:text-[3.25rem]",
          )}
        >
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/55 sm:mt-5 sm:text-lg">
          {t("sub")}
        </p>
      </motion.div>

      <motion.div
        style={{ scale: frameScale, y: frameY }}
        className={cn(
          "relative z-10 w-full max-w-[880px] origin-center overflow-hidden",
          "aspect-video rounded-[1.25rem] bg-black sm:rounded-[1.5rem]",
          "ring-1 ring-white/10",
        )}
      >
        {embedSrc ? (
          <iframe
            key={autoplay ? "playing" : "idle"}
            title={t("title")}
            src={embedSrc}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/export-1793298925294.mp4"
            poster="/reviews/6.jpg"
            controls
            playsInline
            muted={autoplay}
            autoPlay={autoplay}
            loop
            preload="metadata"
          />
        )}
      </motion.div>
    </div>
  );

  if (reduceMotion) {
    return (
      <section
        id="studio"
        className="relative scroll-mt-28 px-3 py-3 sm:px-5 sm:py-5"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]",
            "bg-[#0e0f12]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative min-h-[min(100svh,52rem)]">{stage}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="studio"
      ref={sectionRef}
      className="relative scroll-mt-28"
      style={{ height: "190vh" }}
    >
      <div className="sticky top-0 h-svh overflow-hidden px-3 py-3 sm:px-5 sm:py-5">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]",
            "bg-[#0e0f12]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          {stage}
        </div>
      </div>
    </section>
  );
}
