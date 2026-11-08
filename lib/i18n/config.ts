export const locales = ["en", "ru", "be"] as const;

export type AppLocale = (typeof locales)[number];

/** Product default — matches current root `<html lang>` and .by audience. */
export const defaultLocale: AppLocale = "ru";

export const localeCookieName = "NEXT_LOCALE";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  ru: "Русский",
  be: "Беларуская",
};

/** BCP 47 tags for `<html lang>` / Open Graph. */
export const htmlLang: Record<AppLocale, string> = {
  en: "en",
  ru: "ru",
  be: "be",
};

export const ogLocale: Record<AppLocale, string> = {
  en: "en_US",
  ru: "ru_BY",
  be: "be_BY",
};

export function isAppLocale(value: unknown): value is AppLocale {
  return value === "en" || value === "ru" || value === "be";
}

/** Map Accept-Language / browser tags onto our three locales. */
export function negotiateLocale(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) return defaultLocale;
  const lowered = acceptLanguage.toLowerCase();
  // Order matters: be before ru (be often falls back to ru in browsers).
  if (/(^|,)\s*be\b/.test(lowered) || lowered.includes("be-by")) return "be";
  if (/(^|,)\s*ru\b/.test(lowered) || lowered.includes("ru-")) return "ru";
  if (/(^|,)\s*en\b/.test(lowered) || lowered.includes("en-")) return "en";
  return defaultLocale;
}
