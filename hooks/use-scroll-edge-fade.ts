"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export type ScrollEdgeFade = {
  canStart: boolean;
  canEnd: boolean;
  maskImage: string | undefined;
  update: () => void;
};

/**
 * Soft edge fade when content overflows a scroll container.
 * Uses CSS mask so it blends into any background (see chip-scroll / list overflow).
 */
export function useScrollEdgeFade(
  ref: RefObject<HTMLElement | null>,
  {
    axis = "vertical",
    size = 28,
    deps = [] as unknown[],
  }: {
    axis?: "vertical" | "horizontal";
    size?: number;
    deps?: unknown[];
  } = {},
): ScrollEdgeFade {
  const [canStart, setCanStart] = useState(false);
  const [canEnd, setCanEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (axis === "horizontal") {
      const max = el.scrollWidth - el.clientWidth;
      setCanStart(el.scrollLeft > 2);
      setCanEnd(max > 2 && el.scrollLeft < max - 2);
      return;
    }
    const max = el.scrollHeight - el.clientHeight;
    setCanStart(el.scrollTop > 2);
    setCanEnd(max > 2 && el.scrollTop < max - 2);
  }, [axis, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes explicit deps
  }, [update, ...deps]);

  const maskImage =
    canStart || canEnd
      ? axis === "horizontal"
        ? `linear-gradient(to right, ${canStart ? "transparent" : "black"} 0, black ${canStart ? `${size}px` : "0"}, black calc(100% - ${canEnd ? `${size}px` : "0px"}), ${canEnd ? "transparent" : "black"} 100%)`
        : `linear-gradient(to bottom, ${canStart ? "transparent" : "black"} 0, black ${canStart ? `${size}px` : "0"}, black calc(100% - ${canEnd ? `${size}px` : "0px"}), ${canEnd ? "transparent" : "black"} 100%)`
      : undefined;

  return { canStart, canEnd, maskImage, update };
}
