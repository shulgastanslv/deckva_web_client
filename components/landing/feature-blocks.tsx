"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landSerif } from "@/components/landing/landing-shell";
import { RevealItem, RevealStagger } from "@/components/landing/reveal";
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
  }
> = {
  generate: {
    href: "/studio",
    place: "feature_generate",
    src: "/landing/editor-generate.jpg",
  },
  edit: {
    href: "/studio",
    place: "feature_edit",
    reverse: true,
    src: "/landing/editor-edit.jpg",
  },
  export: {
    href: "#pricing",
    place: "feature_export",
    src: "/landing/editor-export.jpg",
  },
};

function EditorScreenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] bg-[#111218] shadow-sm sm:rounded-[1.5rem]">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#1a1b22] px-3 py-2.5">
        <span className="size-2 rounded-full bg-[#FF5F57]" />
        <span className="size-2 rounded-full bg-[#FEBC2E]" />
        <span className="size-2 rounded-full bg-[#28C840]" />
        <span className="ml-3 truncate text-[11px] text-white/35">
          deckva.studio
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="aspect-[16/10] w-full object-cover object-top"
        loading="lazy"
      />
    </div>
  );
}

export function FeatureBlocks() {
  const t = useTranslations("landing.features");

  return (
    <div
      id="features"
      className="mx-auto flex w-full max-w-[1040px] flex-col gap-16 sm:gap-20"
    >
      {FEATURE_IDS.map((id) => {
        const meta = FEATURE_META[id];
        const points = t.raw(`${id}.points`) as string[];

        return (
          <RevealStagger
            key={id}
            stagger={0.12}
            className={cn(
              "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
              meta.reverse && "lg:[&>*:first-child]:order-2",
            )}
          >
            <RevealItem>
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
            </RevealItem>

            <RevealItem>
              <EditorScreenshot src={meta.src} alt={t(`${id}.alt`)} />
            </RevealItem>
          </RevealStagger>
        );
      })}
    </div>
  );
}
