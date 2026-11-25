"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { landIsland, landSerif } from "@/components/landing/landing-shell";
import { MobileStudioVisual } from "@/components/landing/mobile-studio-visual";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const FEATURE_IDS = [
  "generate",
  "edit",
  "codeblock",
  "mockups",
  "mobile",
  "export",
] as const;

type FeatureId = (typeof FEATURE_IDS)[number];

type ImageFeatureMeta = {
  href: string;
  place: string;
  reverse?: boolean;
  kind: "image";
  src: string;
  width: number;
  height: number;
  grid: string;
  visual: string;
};

type CustomFeatureMeta = {
  href: string;
  place: string;
  reverse?: boolean;
  kind: "codeblock" | "mobile";
  grid: string;
  visual: string;
};

type FeatureMeta = ImageFeatureMeta | CustomFeatureMeta;

const FEATURE_META: Record<FeatureId, FeatureMeta> = {
  generate: {
    href: "/studio",
    place: "feature_generate",
    kind: "image",
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
    kind: "image",
    src: "/landing/edit-slide.png",
    width: 739,
    height: 869,
    grid: "lg:grid-cols-[0.75fr_1.5fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[120rem] lg:max-w-none",
  },
  codeblock: {
    href: "/studio",
    place: "feature_codeblock",
    kind: "codeblock",
    grid: "lg:grid-cols-[0.95fr_1.2fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[36rem] sm:max-w-[40rem] lg:max-w-none",
  },
  mockups: {
    href: "/studio",
    place: "feature_mockups",
    reverse: true,
    kind: "image",
    src: "/landing/mockups.jpg",
    width: 1000,
    height: 1500,
    grid: "lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[22rem] sm:max-w-[26rem] lg:max-w-[30rem]",
  },
  mobile: {
    href: "/studio",
    place: "feature_mobile",
    kind: "mobile",
    grid: "lg:grid-cols-[1fr_0.85fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[15.5rem] sm:max-w-[17rem] lg:max-w-[18.5rem]",
  },
  export: {
    href: "#pricing",
    place: "feature_export",
    reverse: true,
    kind: "image",
    src: "/landing/export.png",
    width: 739,
    height: 869,
    grid: "lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-14",
    visual: "max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem]",
  },
};

function FeatureImage({
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
        className="absolute inset-0 h-full w-full rounded-3xl object-left object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

/** Product-like code window for the code-block feature card. */
function CodeBlockVisual({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-3xl",
        "bg-[#ebeae6] dark:bg-muted/40",
        "aspect-[5/4] p-5 sm:p-7 lg:p-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="relative mx-auto flex h-full max-w-[34rem] items-center justify-center">
        <div
          className={cn(
            "w-full overflow-hidden rounded-2xl",
            "bg-[#121214] text-white shadow-[0_18px_50px_rgba(5,0,56,0.18)]",
            "ring-1 ring-black/10 dark:ring-white/10",
          )}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate font-mono text-[11px] tracking-wide text-white/45">
              carousel.ts
            </span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-[1.7] sm:text-[13px]">
            <code>
              <span className="text-[#6599FF]">const</span>
              <span className="text-white">{" slides "}</span>
              <span className="text-[#F8518D]">=</span>
              <span className="text-white">{" await "}</span>
              <span className="text-[#F8518D]">generate</span>
              <span className="text-white">{"({"}</span>
              {"\n"}
              <span className="text-white">{"  "}</span>
              <span className="text-[#49E8F2]">topic</span>
              <span className="text-white">:</span>
              <span className="text-[#E9AEFE]">
                {' "How to ship a carousel"'}
              </span>
              <span className="text-white">,</span>
              {"\n"}
              <span className="text-white">{"  "}</span>
              <span className="text-[#49E8F2]">format</span>
              <span className="text-white">:</span>
              <span className="text-[#E9AEFE]">{" \"4:5\""}</span>
              <span className="text-white">,</span>
              {"\n"}
              <span className="text-white">{"  "}</span>
              <span className="text-[#49E8F2]">blocks</span>
              <span className="text-white">:</span>
              <span className="text-white">{" ["}</span>
              <span className="text-[#E9AEFE]">{'"code"'}</span>
              <span className="text-white">{", "}</span>
              <span className="text-[#E9AEFE]">{'"mockup"'}</span>
              <span className="text-white">{"],"}</span>
              {"\n"}
              <span className="text-white">{"});"}</span>
              {"\n\n"}
              <span className="text-[#8A757D]">
                {"// highlight · theme · chrome"}
              </span>
              {"\n"}
              <span className="text-white">{"export("}</span>
              <span className="text-white">slides</span>
              <span className="text-white">);</span>
            </code>
          </pre>
        </div>
      </div>
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

              {meta.kind === "codeblock" ? (
                <CodeBlockVisual alt={t(`${id}.alt`)} className={meta.visual} />
              ) : meta.kind === "mobile" ? (
                <MobileStudioVisual
                  alt={t(`${id}.alt`)}
                  className={meta.visual}
                />
              ) : meta.kind === "image" ? (
                <FeatureImage
                  src={meta.src}
                  alt={t(`${id}.alt`)}
                  width={meta.width}
                  height={meta.height}
                  className={meta.visual}
                />
              ) : null}
            </div>
          </article>
        );
      })}
      <div className="h-[22vh]" aria-hidden />
    </section>
  );
}
