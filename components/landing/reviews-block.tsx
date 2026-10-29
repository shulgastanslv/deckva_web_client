"use client";

import { useState } from "react";

import {
  LandingHead,
  LandingSection,
} from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

const PHOTOS = [
  {
    src: "/reviews/878241688_18157030825560582_6425025260815163360_n.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/reviews/873549208_17919352497462090_7013222084347737390_n.jpg",
    aspect: "aspect-[4/5]",
  },  
  {
    src: "/reviews/871021504_18653741251040809_7233068040570664666_n.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/reviews/865838892_18117300367988507_5436190163512693482_n.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/reviews/5.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/reviews/6.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/reviews/7.jpg",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/reviews/8.jpg",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/reviews/9.jpg",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/reviews/10.jpg",
    aspect: "aspect-[3/4]",
  },
] as const;

const PREVIEW = 6;

export function ReviewsBlock() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const visible = open ? PHOTOS : PHOTOS.slice(0, PREVIEW);

  return (
    <LandingSection id="reviews">
      <LandingHead
        title="Отзывы"
        text="Карусели, которые собрали в студии."
      />

      <ul className="columns-1 gap-3 min-[480px]:columns-2 lg:columns-3">
        {visible.map((photo, index) => {
          const shown = active === index;
          return (
            <li
              key={`${photo.src}-${index}`}
              className="mb-3 break-inside-avoid"
            >
              <button
                type="button"
                className={cn(
                  "group relative block w-full overflow-hidden rounded-2xl bg-land-card text-left",
                  photo.aspect,
                )}
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
                  src={photo.src}
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
        className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground"
      >
        {open ? "Свернуть" : `Показать ещё ${PHOTOS.length - PREVIEW}`}
      </button>
    </LandingSection>
  );
}
