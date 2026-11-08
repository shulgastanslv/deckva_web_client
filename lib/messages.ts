/**
 * Locale-aware message catalogs.
 *
 * Prefer `await getMessages()` in Server Actions / RSC.
 * The sync `messages` export is the default-locale catalog for gradual migration
 * and non-request contexts — do not rely on it for UI locale.
 */
import { cache } from "react";
import { getLocale } from "next-intl/server";

import {
  defaultLocale,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";
import be from "@/messages/be.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const catalogs = {
  en,
  ru,
  be,
} as const;

export type AppMessages = typeof en;

export function catalogFor(locale: AppLocale): AppMessages {
  return catalogs[locale] ?? catalogs[defaultLocale];
}

/** Request-scoped catalog for the active UI locale. */
export const getMessages = cache(async (): Promise<AppMessages> => {
  try {
    const locale = await getLocale();
    if (isAppLocale(locale)) return catalogFor(locale);
  } catch {
    // Outside a next-intl request (scripts, rare edge paths).
  }
  return catalogFor(defaultLocale);
});

/** @deprecated Prefer `await getMessages()` — sync default-locale fallback. */
export const messages: AppMessages = catalogFor(defaultLocale);
