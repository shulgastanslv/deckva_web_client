"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { useSectionReveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

/** Section / hero-scale title — Miro-style massive, tight type */
export const landTitle =
  "text-4xl font-extrabold tracking-tighter leading-[1.05] sm:text-5xl md:text-6xl md:leading-[1]";

/** Card / block title */
export const landCardTitle =
  "text-2xl font-bold tracking-tight leading-[1.12] sm:text-3xl";

/** Section subtitle under LandingHead */
export const landSub = "text-lg font-medium leading-relaxed text-[#050038]/60 dark:text-white/60 sm:text-xl";

/** Card body / supporting line */
export const landCardSub = "text-base font-medium leading-relaxed sm:text-lg text-[#050038]/60 dark:text-white/60";

/** Shared layout primitives */
export function LandingSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const motionProps = useSectionReveal();
  return (
    <motion.section
      id={id}
      {...motionProps}
      className={cn(
        "mx-auto w-full max-w-[1440px] scroll-mt-32 px-6 py-16 sm:px-10 sm:py-24 lg:px-[120px] lg:py-32",
        className
      )}
    >
      {children}
    </motion.section>
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
    <div className="mb-10 max-w-4xl sm:mb-16">
      {eyebrow ? (
        <p
          className={cn(
            "mb-4 text-sm font-bold uppercase tracking-widest",
            light ? "text-[#FFD02F]" : "text-[#4262FF]"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          landTitle,
          light ? "text-white" : "text-[#050038] dark:text-white"
        )}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={cn(
            "mt-6 max-w-2xl",
            landSub,
            light ? "text-white/80" : ""
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
        "relative overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl sm:rounded-[3rem] dark:border-white/10 dark:bg-[#14151C]",
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
  return <div className={cn("grid gap-6 sm:gap-8", className)}>{children}</div>;
}

export function LandingPad({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("p-8 sm:p-12 lg:p-16", className)}>{children}</div>
  );
}