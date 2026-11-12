/** Pro price in BYN (minor units = whole rubles for BYN). */
export const STUDIO_PRO_PRICE = 15;
export const STUDIO_PRO_CURRENCY = "BYN";
export const STUDIO_PRO_PRICE_LABEL = `${STUDIO_PRO_PRICE} BYN`;

/** Free plan: successful AI generations before upgrade is required. */
export const FREE_GENERATION_LIMIT = 3;

/** Credits included with each Pro billing period (subscribe / renew). */
export const PRO_MONTHLY_CREDITS = 50;

/** One successful AI generation costs this many credits (Pro / top-up). */
export const GENERATION_CREDIT_COST = 1;

/** Purchasable credit pack (Pro subscribers). */
export const CREDIT_PACK_PRICE = 10;
export const CREDIT_PACK_CREDITS = 40;
export const CREDIT_PACK_PRICE_LABEL = `${CREDIT_PACK_PRICE} BYN`;

/** @deprecated Use FREE_GENERATION_LIMIT — kept for landing copy migration. */
export const FREE_CAROUSEL_LIMIT = FREE_GENERATION_LIMIT;

export const PRO_FEATURES = [
  `${PRO_MONTHLY_CREDITS} AI generations / month`,
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
  return `You've used your ${limit} free generations. Upgrade to Pro for more AI.`;
}

export function creditsExhaustedMessage() {
  return `You're out of generation credits. Buy a pack (${CREDIT_PACK_CREDITS} for ${CREDIT_PACK_PRICE_LABEL}).`;
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
