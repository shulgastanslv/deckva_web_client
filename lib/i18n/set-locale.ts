"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from "@/lib/i18n/config";

export async function setAppLocale(locale: string): Promise<{ ok: boolean }> {
  if (!isAppLocale(locale)) return { ok: false };

  const jar = await cookies();
  jar.set(localeCookieName, locale as AppLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Refresh RSC trees that read translations / html lang.
  revalidatePath("/", "layout");
  return { ok: true };
}
