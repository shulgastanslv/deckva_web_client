"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export function StudioBoardGrid({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((child, index) => {
        const key =
          isValidElement(child) && child.key != null
            ? String(child.key)
            : `board-${index}`;
        return (
          <motion.div
            key={key}
            initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.34,
              delay: reduce ? 0 : Math.min(index * 0.045, 0.45),
              ease,
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
