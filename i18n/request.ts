import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
  negotiateLocale,
  type AppLocale,
} from "@/lib/i18n/config";

async function resolveLocale(): Promise<AppLocale> {
  const jar = await cookies();
  const fromCookie = jar.get(localeCookieName)?.value;
  if (isAppLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return negotiateLocale(headerStore.get("accept-language"));
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
