/** Pro price in BYN (minor units = whole rubles for BYN). */
export const STUDIO_PRO_PRICE = 15;
export const STUDIO_PRO_CURRENCY = "BYN";
export const STUDIO_PRO_PRICE_LABEL = `${STUDIO_PRO_PRICE} BYN`;

/** Free plan max editable carousels per user. */
export const FREE_CAROUSEL_LIMIT = 3;

export const PRO_FEATURES = [
  "Unlimited private carousels",
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

export function freeCarouselLimitMessage(limit = FREE_CAROUSEL_LIMIT) {
  return `You've reached the limit of ${limit} editable carousels. Unlock unlimited carousels and more.`;
}

export function addBillingMonth(from = new Date()): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}
