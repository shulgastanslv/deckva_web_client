"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { trackEvent } from "@/lib/analytics";
import type { RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const RATIO: Record<RatioKey, string> = {
  "4:3": "4 / 3",
  "3:2": "3 / 2",
  "5:4": "5 / 4",
  "1.618:1": "1.618 / 1",
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
  "1:2": "1 / 2",
  "3:1": "3 / 1",
};

const WIDTH: Record<RatioKey, string> = {
  "4:3": "1.3333",
  "3:2": "1.5",
  "5:4": "1.25",
  "1.618:1": "1.4662",
  "4:5": "0.8",
  "1:1": "1",
  "9:16": "0.5625",
  "16:9": "1.7778",
  "1:2": "0.5",
  "3:1": "0.3333",
};

export function ViewHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-start gap-3 px-4 py-4 sm:px-6">
      <Logo width={34} height={34} />
      <ThemeSwitcher className="text-muted-foreground hover:bg-muted/60 hover:text-foreground" />
    </header>
  );
}

function SlideFrame({
  src,
  aspectRatio,
}: {
  src: string | null;
  aspectRatio: RatioKey;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    src ? "loading" : "idle",
  );

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setStatus("ready");
    };
    img.onerror = () => {
      if (!cancelled) setStatus("error");
    };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      setStatus("ready");
    }
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      className="relative overflow-hidden rounded-[1.6rem] bg-background shadow-[0_18px_40px_rgba(20,21,28,0.12)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
      style={{
        aspectRatio: RATIO[aspectRatio] ?? "4 / 5",
        width: `min(420px, 100%, calc(70dvh * ${WIDTH[aspectRatio] ?? "0.8"}))`,
      }}
    >
      {src && status !== "error" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              status === "ready" ? "opacity-100" : "opacity-0",
            )}
          />
          {status === "loading" ? (
            <div className="absolute inset-0 grid place-items-center bg-muted/40">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid h-full place-items-center bg-muted/50 px-6 text-center text-sm font-medium text-muted-foreground">
          {status === "error" ? "Preview failed to load." : "This slide has no preview yet."}
        </div>
      )}
    </div>
  );
}

export function CarouselView({
  title,
  aspectRatio,
  slides,
}: {
  title: string;
  aspectRatio: RatioKey;
  slides: Array<string | null>;
}) {
  const t = useTranslations("share");
  const [index, setIndex] = useState(0);
  const safeSlides = slides.length > 0 ? slides : [null];
  const count = safeSlides.length;
  const current = safeSlides[Math.min(index, count - 1)] ?? null;
  const studioHref = title.trim()
    ? `/studio?topic=${encodeURIComponent(title.trim())}`
    : "/studio";

  useEffect(() => {
    setIndex((prev) => Math.min(prev, Math.max(0, count - 1)));
  }, [count]);

  const go = (next: number) => {
    setIndex(((next % count) + count) % count);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % count);
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  // Warm neighboring slides so next/prev feel instant.
  useEffect(() => {
    for (const offset of [-1, 1]) {
      const src = slides[(index + offset + count) % count];
      if (!src) continue;
      const img = new Image();
      img.src = src;
    }
  }, [index, count, slides]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <ViewHeader />

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-[58%] rounded-full bg-amber-200/70 sm:size-96 dark:bg-amber-900/30"
        />

        <div className="relative flex w-full items-center justify-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-foreground shadow-sm ring-1 ring-border/50"
          >
            <ChevronLeft className="size-5" />
          </button>

          <SlideFrame src={current} aspectRatio={aspectRatio} />

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-foreground shadow-sm ring-1 ring-border/50"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="relative mt-5 flex items-center gap-2">
          {safeSlides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              aria-label={`Slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={cn(
                "h-2 rounded-full transition-all",
                slideIndex === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40",
              )}
            />
          ))}
        </div>

        <div className="relative mt-8 flex max-w-sm flex-col items-center gap-2 text-center">
          <Link
            href={studioHref}
            onClick={() =>
              trackEvent("share_remix_cta", {
                hasTopic: Boolean(title.trim()),
              })
            }
            className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-semibold text-background"
          >
            {t("makeLikeThis")}
          </Link>
          <p className="text-[13px] text-muted-foreground">{t("makeLikeThisSub")}</p>
        </div>
      </main>
    </div>
  );
}
