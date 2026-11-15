"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landSerif } from "@/components/landing/landing-shell";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const FEATURE_IDS = ["generate", "edit", "export"] as const;

const FEATURE_META: Record<
  (typeof FEATURE_IDS)[number],
  {
    href: string;
    place: string;
    reverse?: boolean;
  }
> = {
  generate: {
    href: "/studio",
    place: "feature_generate",
  },
  edit: {
    href: "/studio",
    place: "feature_edit",
    reverse: true,
  },
  export: {
    href: "#pricing",
    place: "feature_export",
  },
};

function FeatureVisual() {
  return (
    <div
      aria-hidden
      className={cn(
        "aspect-[16/10] w-full rounded-[1.25rem] sm:rounded-[1.5rem]",
        "bg-[#E4E4E0] dark:bg-[#2a2b33]",
      )}
    />
  );
}

export function FeatureBlocks() {
  const t = useTranslations("landing.features");

  return (
    <section
      id="features"
      className="relative mx-auto w-full max-w-[1200px] px-3 sm:px-5"
    >
      {FEATURE_IDS.map((id, index) => {
        const meta = FEATURE_META[id];
        const points = t.raw(`${id}.points`) as string[];
        const top = `calc(${4.75 + index * 0.85}rem + env(safe-area-inset-top))`;

        return (
          <article
            key={id}
            className={cn(
              "sticky mb-4 rounded-[1.75rem] sm:mb-5 sm:rounded-[2rem]",
              "bg-white px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14",
              "dark:bg-[#14151c]",
            )}
            style={{ top, zIndex: index + 1 }}
          >
            <div
              className={cn(
                "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
                meta.reverse && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div>
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
                      className="flex gap-3 text-[15px] leading-relaxed text-[#050038]/65 dark:text-land-ink/65"
                    >
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[#050038]/35 dark:bg-land-ink/40"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 h-11 rounded-full bg-[#050038] px-5 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-land-ink dark:text-land-mist"
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

              <FeatureVisual />
            </div>
          </article>
        );
      })}
      {/* Lets the last card linger before the next section. */}
      <div className="h-[30vh]" aria-hidden />
    </section>
  );
}
