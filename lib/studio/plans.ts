export const STUDIO_PRO_PRICE = 15;

/** Free plan max editable carousels per workspace. */
export const FREE_CAROUSEL_LIMIT = 3;

export const PRO_FEATURES = [
  "Unlimited private carousels",
  "High-resolution exports",
  "Folders & brand kits",
  "Invite teammates",
] as const;

/** Server / client shared message when a Pro-only action is blocked. */
export const UPGRADE_REQUIRED = "Upgrade to Pro to unlock this";

export function planLabel(isUpgrade: boolean | null | undefined) {
  return isUpgrade ? "Pro" : "Free";
}

export function isUpgradeRequiredError(error: string | null | undefined) {
  return Boolean(error?.includes("Upgrade to Pro"));
}

export function freeCarouselLimitMessage(limit = FREE_CAROUSEL_LIMIT) {
  return `You've reached the limit of ${limit} editable carousels. Unlock unlimited carousels, guest access, and more.`;
}
