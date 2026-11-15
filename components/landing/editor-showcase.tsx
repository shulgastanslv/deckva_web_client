"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Play } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo/logo";
import { Button } from "@/components/ui/button";
import {
  RevealItem,
  useStaggerReveal,
} from "@/components/landing/reveal";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function EditorShowcase() {
  const t = useTranslations("landing.showcase");
  const motionProps = useStaggerReveal(0.1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
      trackEvent("landing_cta_click", { place: "editor_video" });
    } else {
      video.pause();
      setPlaying(false);
    }
  };

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
          <Button
            asChild
            className={cn(
              "mt-8 h-11 rounded-full border border-white/20 bg-transparent px-5",
              "text-[15px] font-medium text-white hover:bg-white/10",
            )}
          >
            <a
              href="/studio"
              onClick={() =>
                trackEvent("landing_cta_click", { place: "editor_showcase" })
              }
            >
              {t("cta")}
            </a>
          </Button>
        </RevealItem>

        <RevealItem className="mt-12 w-full max-w-[780px]">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? t("pause") : t("play")}
            className={cn(
              "group relative w-full overflow-hidden",
              "rounded-[1.5rem] bg-white text-left sm:rounded-[1.75rem]",
              "shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD02F]/70",
            )}
          >
            <div className="relative aspect-[16/10] w-full bg-[#f3f2ee]">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src="/export-1793298925294.mp4"
                poster="/reviews/6.jpg"
                playsInline
                muted
                loop
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />

              {!playing ? (
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/35 via-transparent to-black/10 p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-[family-name:var(--font-landing-serif)] text-2xl leading-tight text-white sm:text-3xl">
                      {t("brandBefore") ? `${t("brandBefore")} ` : null}
                      <span className="rounded-md bg-[#FFD02F] px-1.5 text-[#050038]">
                        {t("brandNew")}
                      </span>{" "}
                      {t("brandAfter")}
                    </p>
                    <Logo
                      width={28}
                      height={28}
                      className="pointer-events-none text-white"
                    />
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {t("label")}
                      </p>
                      <p className="mt-0.5 text-[13px] text-white/65">
                        {t("flow")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex size-12 items-center justify-center rounded-full",
                        "bg-white text-[#050038] shadow-sm",
                        "transition-transform group-hover:scale-105",
                      )}
                    >
                      <Play className="size-5 translate-x-px" weight="fill" />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </button>
        </RevealItem>
      </div>
    </motion.section>
  );
}
