export const STUDIO_PRO_PRICE = 15;

export const PRO_FEATURES = [
  "Unlimited private carousels",
  "High-resolution exports",
  "Priority AI generation",
  "Folders & brand kits",
  "Invite teammates",
] as const;

export function planLabel(isUpgrade: boolean | null | undefined) {
  return isUpgrade ? "Pro" : "Free";
}
