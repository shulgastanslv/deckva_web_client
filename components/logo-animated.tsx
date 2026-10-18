"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { LOGO_PATH_BACK, LOGO_PATH_FRONT } from "@/components/logo-paths";
import { cn } from "@/lib/utils";

type LogoAnimatedProps = {
  width?: number;
  height?: number;
  className?: string;
  href?: string;
};

export function LogoAnimated({
  width = 28,
  height = 28,
  className,
  href,
}: LogoAnimatedProps) {
  const router = useRouter();

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", href && "cursor-pointer", className)}
      aria-hidden={!href}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={() => {
        if (href) router.push(href);
      }}
      onKeyDown={(e) => {
        if (!href) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
    >
      <motion.g
        style={{ transformOrigin: "12px 12px" }}
        animate={{ rotate: [0, -8, 0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          className="opacity-45"
          fill="currentColor"
          stroke="currentColor"
          d={LOGO_PATH_BACK}
        />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "12px 12px" }}
        animate={{ rotate: [0, 8, 0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d={LOGO_PATH_FRONT}
        />
      </motion.g>
    </motion.svg>
  );
}

export default LogoAnimated;
