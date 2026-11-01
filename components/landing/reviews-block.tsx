"use client";

import { useState } from "react";

import {
  LandingSection,
  landSub,
  landTitle,
} from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

const PHOTOS = [
  "/reviews/1.jpg",
  "/reviews/2.jpg",
  "/reviews/3.jpg",
  "/reviews/4.jpg",
  "/reviews/5.jpg",
  "/reviews/6.jpg",
  "/reviews/7.jpg",
  "/reviews/8.jpg",
  "/reviews/9.jpg",
  "/reviews/10.jpg",
] as const;

const PREVIEW = 6;

export function ReviewsBlock() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const visible = open ? PHOTOS : PHOTOS.slice(0, PREVIEW);

  return (
    <LandingSection id="reviews">
      <h2 className={`${landTitle} text-land-ink`}>What you get</h2>
      <p className={`mt-3 max-w-lg ${landSub}`}>
        Carousels made in the studio, ready to post.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visible.map((src, index) => {
          const shown = active === index;
          return (
            <li key={src}>
              <button
                type="button"
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-3xl bg-land-card text-left"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                onClick={() =>
                  setActive((current) => (current === index ? null : index))
                }
                aria-expanded={shown}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                />

                <div
                  className={cn(
                    "absolute inset-0 bg-land-ink/45 transition-opacity duration-200",
                    shown
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                />

              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground sm:w-auto"
      >
        {open ? "Show less" : `Show ${PHOTOS.length - PREVIEW} more`}
      </button>
    </LandingSection>
  );
}
