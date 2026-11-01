import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Section / hero-scale title — modern big type */
export const landTitle =
  "text-[2.125rem] font-extrabold tracking-tight leading-[1.08] sm:text-5xl sm:leading-[1.05]";

/** Card / block title */
export const landCardTitle =
  "text-2xl font-extrabold tracking-tight leading-[1.12] sm:text-3xl sm:leading-[1.1]";

/** Section subtitle under LandingHead */
export const landSub = "text-lg leading-snug sm:text-2xl";

/** Card body / supporting line */
export const landCardSub = "text-base leading-relaxed sm:text-xl sm:leading-snug";

/** Shared layout primitives — keep section rhythm identical across the landing. */
export function LandingSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:scroll-mt-24 sm:px-6 sm:py-16",
        className
      )}
    >
      {children}
    </section>
  );
}

export function LandingHead({
  eyebrow,
  title,
  text,
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-6 max-w-3xl sm:mb-10">
      {eyebrow ? (
        <p
          className={cn(
            "text-base font-semibold tracking-wide sm:text-lg",
            light ? "text-white/70" : "text-land-blue"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          landTitle,
          eyebrow ? "mt-2" : null,
          light ? "text-white" : "text-land-ink"
        )}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={cn(
            "mt-4 max-w-2xl",
            landSub,
            light ? "text-white/75" : "text-land-ink/55"
          )}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

export function LandingLayer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] sm:rounded-[3rem]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function LandingGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("grid gap-3 sm:gap-4", className)}>{children}</div>;
}

export function LandingPad({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("p-5 sm:p-8 lg:p-10", className)}>{children}</div>
  );
}
