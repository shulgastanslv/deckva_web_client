"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Logo from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { RatioKey } from "@/lib/types";

const RATIO: Record<RatioKey, string> = {
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

const WIDTH: Record<RatioKey, string> = {
  "4:5": "0.8",
  "1:1": "1",
  "9:16": "0.5625",
  "16:9": "1.7778",
};

export function ViewHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-start gap-3 px-4 py-4 sm:px-6">
        <Logo width={34} height={34} />
      <ThemeSwitcher className="text-[#5c6170] hover:bg-[#e4ebff] hover:text-[#14151c] dark:text-[#a0a0a0] dark:hover:bg-white/10 dark:hover:text-white" />
    </header>
  );
}

export function CarouselView({
  aspectRatio,
  slides,
}: {
  title: string;
  aspectRatio: RatioKey;
  slides: Array<string | null>;
}) {
  const [index, setIndex] = useState(0);
  const count = Math.max(slides.length, 1);
  const current = slides[index] ?? null;

  const go = (next: number) => {
    setIndex((next + count) % count);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % count);
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  return (
    <div className="flex min-h-dvh flex-col">
      <ViewHeader />

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-[58%] rounded-full bg-[#ffe08a] sm:size-96 dark:bg-[#3a3420]"
        />

        <div className="relative flex w-full items-center justify-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#14151c] shadow-[0_8px_24px_rgba(20,21,28,0.08)] dark:bg-[#2c2c2c] dark:text-white"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_40px_rgba(20,21,28,0.12)] dark:bg-[#2c2c2c]"
            style={{
              aspectRatio: RATIO[aspectRatio],
              width: `min(420px, 100%, calc(70dvh * ${WIDTH[aspectRatio]}))`,
            }}
          >
            {current ? (
              <img src={current} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center bg-[#e4ebff] px-6 text-center text-sm font-medium text-[#3a4f9a]">
                This slide has no preview yet.
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#14151c] shadow-[0_8px_24px_rgba(20,21,28,0.08)] dark:bg-[#2c2c2c] dark:text-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="relative mt-5 flex items-center gap-2">
          {slides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              aria-label={`Slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-2 rounded-full ${
                slideIndex === index ? "w-6 bg-[#2f5bff]" : "w-2 bg-[#d5d8e4] dark:bg-white/25"
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
