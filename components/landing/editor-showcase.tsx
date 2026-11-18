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

import { landIsland, landSectionPad } from "@/components/landing/landing-shell";
import { Button } from "@/components/ui/button";
import { LANDING_SHOWCASE_YOUTUBE_ID } from "@/lib/landing-media";
import { trackEvent } from "@/lib/analytics";
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

function DotField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.45]"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in oklab, var(--foreground) 20%, transparent) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />
  );
}

/**
 * Scroll-pinned studio reel: video scales into focus and starts muted
 * so the YouTube block is hard to scroll past unnoticed.
 */
export function EditorShowcase() {
  const t = useTranslations("landing.showcase");
  const tLanding = useTranslations("landing");
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
    [0, 0.22, 0.7, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.94, 1, 1, 0.98],
  );
  const frameY = useTransform(
    scrollYProgress,
    [0, 0.28, 1],
    reduceMotion ? [0, 0, 0] : [20, 0, -6],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    if (value >= 0.18 && value <= 0.88) {
      setAutoplay(true);
    }
  });

  useEffect(() => {
    if (reduceMotion) setAutoplay(false);
  }, [reduceMotion]);

  const embedSrc = youtubeId ? buildEmbedSrc(youtubeId, autoplay) : null;

  const stage = (
    <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-center gap-7 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:py-12">
      <div className="w-full shrink-0 text-left lg:max-w-[18rem] xl:max-w-[20rem]">
        <h2
          className={cn(
            "font-[family-name:var(--font-landing-serif)]",
            "max-w-[12ch] text-[2.35rem] leading-[1.05] font-medium tracking-tight text-foreground",
            "sm:text-5xl lg:text-[2.85rem]",
          )}
        >
          {t("title")}
        </h2>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
          {t("sub")}
        </p>
        <Button
          asChild
          className="mt-6 h-11 rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground hover:bg-primary/90 sm:mt-7"
        >
          <a
            href="/studio"
            onClick={() =>
              trackEvent("landing_cta_click", { place: "showcase" })
            }
          >
            {tLanding("ctaStudio")}
          </a>
        </Button>
      </div>

      <motion.div
        style={{ scale: frameScale, y: frameY }}
        className={cn(
          "relative min-w-0 w-full flex-1 origin-center overflow-hidden",
          "aspect-video min-h-[min(42vh,22rem)] rounded-3xl bg-black sm:min-h-[min(48vh,26rem)]",
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
            src="/deckva.mp4"
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

  const shellClass = cn("relative overflow-hidden text-foreground", landIsland);

  if (reduceMotion) {
    return (
      <section id="studio" className={cn("relative scroll-mt-28", landSectionPad)}>
        <div className={shellClass}>
          <DotField />
          <div className="relative min-h-[min(100svh,48rem)]">{stage}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="studio"
      ref={sectionRef}
      className="relative scroll-mt-28"
      style={{ height: "160vh" }}
    >
      <div className={cn("sticky top-0 h-svh overflow-hidden", landSectionPad)}>
        <div className={cn(shellClass, "h-full")}>
          <DotField />
          {stage}
        </div>
      </div>
    </section>
  );
}
