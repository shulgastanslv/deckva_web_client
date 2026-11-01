"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

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
      return box.top < window.innerHeight * 0.92 && box.bottom > 0;
    };

    if (inView()) show();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) show();
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    const onScroll = () => {
      if (inView()) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // If the observer never fires, anything already on screen still appears.
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
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <Reveal key={index} delay={index * stagger} className="contents">
              {child}
            </Reveal>
          ))
        : children}
    </div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <Reveal className={className}>{children}</Reveal>;
}

export function useSectionReveal(delay = 0) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const shown = useShown(ref, reduce);
  return {
    ref,
    initial: false as const,
    animate: shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    transition: reduce
      ? { duration: 0 }
      : { duration: 0.75, delay, ease },
  };
}
