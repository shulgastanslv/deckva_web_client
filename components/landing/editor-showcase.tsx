"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import {
  RevealItem,
  useStaggerReveal,
} from "@/components/landing/reveal";
import { LANDING_SHOWCASE_YOUTUBE_ID } from "@/lib/landing-media";
import { cn } from "@/lib/utils";

export function EditorShowcase() {
  const t = useTranslations("landing.showcase");
  const motionProps = useStaggerReveal(0.1);

  const youtubeId = LANDING_SHOWCASE_YOUTUBE_ID;
  const embedSrc = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`
    : null;

  return (
    <motion.section
      id="studio"
      {...motionProps}
      className={cn(
        "relative scroll-mt-28 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]",
        "bg-[#0e0f12] text-white",
        "px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24",
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

      <div className="relative mx-auto flex w-full max-w-[920px] flex-col items-center text-center">
        <RevealItem soft>
          <h2
            className={cn(
              "max-w-[14ch] font-[family-name:var(--font-landing-serif)]",
              "text-[2.5rem] leading-[1.05] font-medium tracking-tight",
              "sm:text-5xl lg:text-[3.5rem]",
            )}
          >
            {t("title")}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
            {t("sub")}
          </p>
        </RevealItem>

        <RevealItem className="mt-12 w-full max-w-[780px]">
          <div
            className={cn(
              "relative aspect-video w-full overflow-hidden",
              "rounded-[1.5rem] bg-black sm:rounded-[1.75rem]",
              "shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
            )}
          >
            {embedSrc ? (
              <iframe
                title={t("title")}
                src={embedSrc}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              // Fallback until NEXT_PUBLIC_LANDING_YOUTUBE_ID is set
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src="/export-1793298925294.mp4"
                poster="/reviews/6.jpg"
                controls
                playsInline
                preload="metadata"
              />
            )}
          </div>
        </RevealItem>
      </div>
    </motion.section>
  );
}
