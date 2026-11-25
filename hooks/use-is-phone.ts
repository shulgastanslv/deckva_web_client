"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/** Tailwind `md` breakpoint — phone / narrow layout below 768px. */
export const PHONE_MQ = "(max-width: 767px)";

/**
 * `null` until hydrated, then whether the viewport is phone-width.
 * Prefer CSS `max-md:` when possible; use this for behavior that must
 * change (auto-open sheets, padding constants, etc.).
 */
export function useIsPhone(): boolean | null {
  return useMediaQuery(PHONE_MQ);
}
