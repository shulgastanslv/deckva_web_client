/**
 * Lightweight product analytics stub.
 * Swap the body later for PostHog / Plausible without changing call sites.
 */

export type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;

export function trackEvent(name: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  try {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", name, props ?? {});
    }
    window.dispatchEvent(
      new CustomEvent("deckva:analytics", { detail: { name, props } }),
    );
  } catch {
    // never break product flows for telemetry
  }
}
