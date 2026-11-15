"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Pause, Play } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

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
        "bg-[#14151c] text-white dark:bg-[#0a0a0c]",
        "px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,91,255,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(26,37,72,0.55),transparent_60%)]"
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
          <div
            className={cn(
              "overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]",
              "bg-[#0a0b0f] ring-1 ring-white/10",
            )}
          >
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? t("pause") : t("play")}
              className={cn(
                "group relative block w-full overflow-hidden text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14151c]",
              )}
            >
              <div className="relative aspect-[16/10] w-full bg-black">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                    <span
                      className={cn(
                        "inline-flex size-14 items-center justify-center rounded-md",
                        "bg-white text-[#14151c]",
                        "transition-transform group-hover:scale-[1.03]",
                      )}
                    >
                      <Play className="size-6 translate-x-px" weight="fill" />
                    </span>
                  </div>
                ) : null}
              </div>
            </button>

            <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? t("pause") : t("play")}
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-md",
                  "bg-white/10 text-white hover:bg-white/15",
                )}
              >
                {playing ? (
                  <Pause className="size-4" weight="fill" />
                ) : (
                  <Play className="size-4 translate-x-px" weight="fill" />
                )}
              </button>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-white/90">
                  {t("label")}
                </p>
                <p className="truncate text-[12px] text-white/50">{t("flow")}</p>
              </div>
              <div
                aria-hidden
                className="hidden h-1.5 w-24 overflow-hidden rounded-md bg-white/10 sm:block"
              >
                <div
                  className={cn(
                    "h-full rounded-md bg-white/45 transition-all duration-500",
                    playing ? "w-[66%]" : "w-0",
                  )}
                />
              </div>
            </div>
          </div>
        </RevealItem>
      </div>
    </motion.section>
  );
}
