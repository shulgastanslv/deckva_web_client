/** Template tabs / publish chips — social platforms Deckva targets. */
export const TEMPLATE_CATEGORIES = [
  "Instagram",
  "TikTok",
  "Threads",
  "LinkedIn",
  "Telegram",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export function isTemplateCategory(value: string): value is TemplateCategory {
  return (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
}

/** Maps new-project platform id → template category label. */
export const PLATFORM_TEMPLATE_CATEGORY: Record<string, TemplateCategory | null> = {
  Insta: "Instagram",
  TikTok: "TikTok",
  Threads: "Threads",
  LinkedIn: "LinkedIn",
  Other: null,
};
