/** Pro price in BYN (minor units = whole rubles for BYN). */
export const STUDIO_PRO_PRICE = 15;
export const STUDIO_PRO_CURRENCY = "BYN";
export const STUDIO_PRO_PRICE_LABEL = `${STUDIO_PRO_PRICE} BYN`;

/** Free plan: successful AI generations before upgrade is required. */
export const FREE_GENERATION_LIMIT = 3;

/** @deprecated Use FREE_GENERATION_LIMIT — kept for landing copy migration. */
export const FREE_CAROUSEL_LIMIT = FREE_GENERATION_LIMIT;

export const PRO_FEATURES = [
  "Unlimited AI generations",
  "High-resolution exports",
  "Folders & brand kits",
  "Priority support",
] as const;

/** Server / client shared message when a Pro-only action is blocked. */
export const UPGRADE_REQUIRED = "Upgrade to Pro to unlock this";

export function planLabel(isPro: boolean | null | undefined) {
  return isPro ? "Pro" : "Free";
}

export function isUpgradeRequiredError(error: string | null | undefined) {
  return Boolean(error?.includes("Upgrade to Pro"));
}

export function freeGenerationLimitMessage(limit = FREE_GENERATION_LIMIT) {
  return `You've used your ${limit} free generations. Upgrade to Pro for unlimited AI.`;
}

/** @deprecated Use freeGenerationLimitMessage */
export function freeCarouselLimitMessage(limit = FREE_GENERATION_LIMIT) {
  return freeGenerationLimitMessage(limit);
}

export function addBillingMonth(from = new Date()): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}
