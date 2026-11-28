"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
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
    <header className="flex w-full shrink-0 items-center justify-between gap-3 px-3.5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6">
      <Logo width={36} height={36} />
      <ThemeSwitcher />
    </header>
  );
}

function SlideGlow({ src }: { src: string | null }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-10 md:-inset-16"
      style={{
        maskImage: "radial-gradient(closest-side, #000 18%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(closest-side, #000 18%, transparent 72%)",
      }}
    >
      <div className="absolute inset-2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full scale-110 rounded-3xl object-cover opacity-30 blur-3xl dark:opacity-40"
        />
      ) : null}
    </div>
  );
}

function SlideFrame({
  src,
  aspectRatio,
  onSwipe,
}: {
  src: string | null;
  aspectRatio: RatioKey;
  onSwipe: (direction: -1 | 1) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    src ? "loading" : "idle",
  );
  const drag = useRef<{ x: number; y: number } | null>(null);

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

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    onSwipe(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="relative isolate w-[min(100cqw,36rem,calc(100cqh*var(--slide-w)))] max-w-full touch-pan-y select-none md:w-[min(calc(100cqw-8.5rem),36rem,calc(100cqh*var(--slide-w)))]"
      style={{
        aspectRatio: RATIO[aspectRatio] ?? "4 / 5",
        ["--slide-w" as string]: WIDTH[aspectRatio] ?? "0.8",
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <SlideGlow src={status === "error" ? null : src} />
      <div className="relative z-10 h-full w-full overflow-hidden rounded-3xl bg-muted/30">
        {src && status !== "error" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-200",
                status === "ready" ? "opacity-100" : "opacity-0",
              )}
            />
            {status === "loading" ? (
              <div className="absolute inset-0 grid place-items-center">
                <Loader2 className="size-5 animate-spin stroke-[1.5] text-muted-foreground" />
              </div>
            ) : null}
          </>
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-[13px] font-normal text-muted-foreground">
            {status === "error" ? "Preview failed to load." : "This slide has no preview yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function SlideNavButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={label}
      onClick={onClick}
    >
      <Icon className="size-5 stroke-[1.5]" />
    </Button>
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
  const hasPager = count > 1;

  useEffect(() => {
    setIndex((prev) => Math.min(prev, Math.max(0, count - 1)));
  }, [count]);

  const go = (next: number) => {
    setIndex(((next % count) + count) % count);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((currentIndex) => (currentIndex + 1) % count);
      if (event.key === "ArrowLeft") setIndex((currentIndex) => (currentIndex - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  useEffect(() => {
    for (const offset of [-1, 1]) {
      const src = slides[(index + offset + count) % count];
      if (!src) continue;
      const img = new Image();
      img.src = src;
    }
  }, [index, count, slides]);

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <ViewHeader />

      <main className="relative min-h-0 w-full flex-1 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center px-5 py-4 md:px-8 md:py-6"
          style={{ containerType: "size" }}
        >
          <div className="flex max-w-full items-center justify-center gap-4 md:gap-6">
            {hasPager ? (
              <div className="hidden shrink-0 md:block">
                <SlideNavButton
                  label="Previous slide"
                  direction="prev"
                  onClick={() => go(index - 1)}
                />
              </div>
            ) : null}

            <SlideFrame
              src={current}
              aspectRatio={aspectRatio}
              onSwipe={(direction) => go(index + direction)}
            />

            {hasPager ? (
              <div className="hidden shrink-0 md:block">
                <SlideNavButton
                  label="Next slide"
                  direction="next"
                  onClick={() => go(index + 1)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="flex shrink-0 flex-col items-center gap-4 px-4 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))] md:gap-5 md:pb-8">
        {hasPager ? (
          <div className="flex w-full max-w-md items-center justify-center gap-3">
            <div className="md:hidden">
              <SlideNavButton
                label="Previous slide"
                direction="prev"
                onClick={() => go(index - 1)}
              />
            </div>
            <div className="flex min-w-0 items-center justify-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {safeSlides.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  type="button"
                  aria-label={`Slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index ? "true" : undefined}
                  onClick={() => setIndex(slideIndex)}
                  className={cn(
                    "size-2 shrink-0 rounded-full transition-colors",
                    slideIndex === index
                      ? "bg-primary"
                      : "bg-muted-foreground/25 hover:bg-muted-foreground/45",
                  )}
                />
              ))}
            </div>
            <div className="md:hidden">
              <SlideNavButton
                label="Next slide"
                direction="next"
                onClick={() => go(index + 1)}
              />
            </div>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {`Slide ${Math.min(index, count - 1) + 1} of ${count}`}
        </p>

        <div className="flex w-full max-w-md flex-col items-center gap-2 md:max-w-sm">
          <Button asChild className="w-full md:w-auto">
            <Link
              href={studioHref}
              onClick={() =>
                trackEvent("share_remix_cta", {
                  hasTopic: Boolean(title.trim()),
                })
              }
            >
              {t("makeLikeThis")}
            </Link>
          </Button>
          <p className="text-center text-[13px] font-normal text-balance text-muted-foreground">
            {t("makeLikeThisSub")}
          </p>
        </div>
      </footer>
    </div>
  );
}
