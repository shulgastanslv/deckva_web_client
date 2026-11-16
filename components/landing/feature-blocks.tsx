"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landIsland, landSerif } from "@/components/landing/landing-shell";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const FEATURE_IDS = ["generate", "edit", "export"] as const;

const FEATURE_META: Record<
  (typeof FEATURE_IDS)[number],
  {
    href: string;
    place: string;
    reverse?: boolean;
    src: string;
    /** Tailwind object-position — keep the key UI readable inside the square */
    focus: string;
  }
> = {
  generate: {
    href: "/studio",
    place: "feature_generate",
    src: "/landing/write-topic.png",
    focus: "object-center",
  },
  edit: {
    href: "/studio",
    place: "feature_edit",
    reverse: true,
    src: "/landing/edit-slide.png",
    focus: "object-center",
  },
  export: {
    href: "#pricing",
    place: "feature_export",
    src: "/landing/export.png",
    focus: "object-center",
  },
};

function FeatureVisual({
  src,
  alt,
  focus,
}: {
  src: string;
  alt: string;
  focus: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl aspect-square",
        "bg-[#E4E4E0] dark:bg-muted/50",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          focus,
        )}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

export function FeatureBlocks() {
  const t = useTranslations("landing.features");

  return (
    <section
      id="features"
      className="relative mx-auto w-full max-w-[1360px] px-3 sm:px-5"
    >
      {FEATURE_IDS.map((id, index) => {
        const meta = FEATURE_META[id];
        const points = t.raw(`${id}.points`) as string[];
        const top = `calc(${4.75 + index * 0.85}rem + env(safe-area-inset-top))`;

        return (
          <article
            key={id}
            className={cn(
              "sticky mb-2 sm:mb-3",
              landIsland,
              "px-5 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14",
            )}
            style={{ top, zIndex: index + 1 }}
          >
            <div
              className={cn(
                "grid items-center gap-7 lg:grid-cols-[0.9fr_1.25fr] lg:gap-10 xl:gap-12",
                meta.reverse && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div className="min-w-0">
                <h3
                  className={cn(
                    landSerif,
                    "max-w-[16ch] text-[2rem] leading-[1.1] sm:text-[2.35rem]",
                  )}
                >
                  {t(`${id}.title`)}
                </h3>
                <ul className="mt-6 space-y-3">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-relaxed text-[#050038]/65 dark:text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[#050038]/35 dark:bg-muted-foreground/50"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 h-11 rounded-full bg-[#050038] px-5 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-foreground dark:text-background"
                >
                  <a
                    href={meta.href}
                    onClick={() =>
                      trackEvent("landing_cta_click", { place: meta.place })
                    }
                  >
                    {t(`${id}.cta`)}
                  </a>
                </Button>
              </div>

              <FeatureVisual
                src={meta.src}
                alt={t(`${id}.alt`)}
                focus={meta.focus}
              />
            </div>
          </article>
        );
      })}
      <div className="h-[18vh]" aria-hidden />
    </section>
  );
}
