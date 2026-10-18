"use client";

import { motion } from "motion/react";

import { LOGO_PATH_BACK, LOGO_PATH_FRONT } from "@/components/logo-paths";
import { cn } from "@/lib/utils";

type LogoAnimatedLoadingProps = {
  width?: number;
  height?: number;
  className?: string;
  label?: string;
};

const CYCLE = 1.2;
const EASE = [0.4, 0, 0.2, 1] as const;

export function LogoAnimatedLoading({
  width = 28,
  height = 28,
  className,
  label = "Loading",
}: LogoAnimatedLoadingProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      role="status"
      aria-label={label}
    >
      <motion.path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.15}
        d={LOGO_PATH_BACK}
        style={{ transformOrigin: "12px 12px" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: CYCLE,
          repeat: Infinity,
          ease: EASE,
          times: [0, 0.5, 1],
        }}
      />
      <motion.path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.15}
        d={LOGO_PATH_FRONT}
        style={{ transformOrigin: "12px 12px" }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{
          duration: CYCLE,
          repeat: Infinity,
          ease: EASE,
          times: [0, 0.5, 1],
        }}
      />
    </svg>
  );
}

export default LogoAnimatedLoading;
