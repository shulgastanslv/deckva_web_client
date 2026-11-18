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
    width: number;
    height: number;
    grid: string;
    visual: string;
  }
> = {
  generate: {
    href: "/studio",
    place: "feature_generate",
    src: "/landing/write-topic.png",
    width: 1083,
    height: 710,
    grid: "lg:grid-cols-[0.95fr_1.2fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[120rem] lg:max-w-none",
  },
  edit: {
    href: "/studio",
    place: "feature_edit",
    reverse: true,
    src: "/landing/edit-slide.png",
    width: 739,
    height: 869,
    grid: "lg:grid-cols-[0.75fr_1.5fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[120rem] lg:max-w-none",
  },
  export: {
    href: "#pricing",
    place: "feature_export",
    src: "/landing/export.png",
    width: 739,
    height: 869,
    grid: "lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem]",
  },
};

function FeatureVisual({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-3xl",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="absolute inset-0 h-full w-full rounded-3xl object-cover object-center"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

/** Sticky stacked feature cards — each covers the previous as you scroll. */
export function FeatureBlocks() {
  const t = useTranslations("landing.features");

  return (
    <section
      id="features"
      className="relative mx-auto w-full max-w-[1440px] scroll-mt-42 px-3 sm:px-5 mt-20"
    >
      {FEATURE_IDS.map((id, index) => {
        const meta = FEATURE_META[id];
        const points = t.raw(`${id}.points`) as string[];
        const top = `calc(${4.5 + index * 0.85}rem + env(safe-area-inset-top))`;

        return (
          <article
            key={id}
            className={cn(
              "sticky mb-2 sm:mb-3",
              landIsland,
              "px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14",
            )}
            style={{ top, zIndex: index + 1 }}
          >
            <div
              className={cn(
                "grid items-center gap-8",
                meta.grid,
                meta.reverse && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div className="min-w-0">
                <h3
                  className={cn(
                    landSerif,
                    "max-w-[16ch] text-[2.15rem] leading-[1.08] sm:text-[2.75rem] lg:text-[3.1rem]",
                  )}
                >
                  {t(`${id}.title`)}
                </h3>
                <ul className="mt-7 space-y-3.5">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-relaxed text-[#050038]/65 dark:text-muted-foreground sm:text-base"
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
                  className="mt-9 h-12 rounded-full bg-[#050038] px-6 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-foreground dark:text-background"
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
                width={meta.width}
                height={meta.height}
                className={meta.visual}
              />
            </div>
          </article>
        );
      })}
      <div className="h-[18vh]" aria-hidden />
    </section>
  );
}
