import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

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
        "mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16",
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
    <div className="mb-8 max-w-2xl sm:mb-10">
      {eyebrow ? (
        <p
          className={cn(
            "text-xl font-bold tracking-wide",
            light ? "text-white/70" : "text-land-blue"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl",
          light ? "text-white" : "text-land-ink"
        )}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={cn(
            "mt-4 text-xl leading-relaxed",
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
        "relative overflow-hidden rounded-[3rem] sm:rounded-[3rem]",
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
    <div className={cn("p-6 sm:p-8 lg:p-10", className)}>{children}</div>
  );
}
