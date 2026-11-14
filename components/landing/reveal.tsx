"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export const revealEase = ease;

export const revealContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease },
  },
};

export const revealItemSoft: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

function useShown(ref: RefObject<HTMLElement | null>, reduce: boolean | null) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let stopped = false;
    const show = () => {
      if (stopped) return;
      stopped = true;
      setShown(true);
    };
    const inView = () => {
      const box = el.getBoundingClientRect();
      return box.top < window.innerHeight * 0.9 && box.bottom > 40;
    };

    if (inView()) show();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) show();
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    const onScroll = () => {
      if (inView()) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const fallback = window.setTimeout(() => {
      if (inView()) show();
    }, 700);

    return () => {
      stopped = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fallback);
    };
  }, [reduce, ref]);

  return shown || reduce === true;
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref, reduce);

  return (
    <motion.div
      ref={ref}
      className={cn("w-full", className)}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.75, delay, ease }
      }
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref, reduce);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : "hidden"}
      animate={shown ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : 0.04,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  soft = false,
}: {
  children: ReactNode;
  className?: string;
  soft?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : soft ? revealItemSoft : revealItem}
    >
      {children}
    </motion.div>
  );
}

export function useSectionReveal(delay = 0) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const shown = useShown(ref, reduce);
  return {
    ref,
    initial: false as const,
    animate: shown
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 28 },
    transition: reduce
      ? { duration: 0 }
      : { duration: 0.85, delay, ease },
  };
}

/** Staggered section shell: fade the board, then cascade children via RevealItem. */
export function useStaggerReveal(stagger = 0.1) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useShown(ref, reduce);
  return {
    ref,
    initial: (reduce ? false : "hidden") as false | "hidden",
    animate: (shown ? "show" : "hidden") as "show" | "hidden",
    variants: {
      hidden: { opacity: 0, y: 28 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: reduce ? 0 : 0.75,
          ease,
          when: "beforeChildren" as const,
          staggerChildren: reduce ? 0 : stagger,
          delayChildren: reduce ? 0 : 0.06,
        },
      },
    },
  };
}
