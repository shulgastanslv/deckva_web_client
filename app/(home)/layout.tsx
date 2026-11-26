import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";

import { isAppLocale, ogLocale, type AppLocale } from "@/lib/i18n/config";
import { SITE_URL, ogImage } from "@/lib/seo/og";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const localeRaw = await getLocale();
  const locale: AppLocale = isAppLocale(localeRaw) ? localeRaw : "ru";
  const description = t("description");

  return {
    title: { absolute: t("titleDefault") },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: t("ogTitle"),
      description,
      url: SITE_URL,
      siteName: "Deckva",
      locale: ogLocale[locale],
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description,
      images: [ogImage],
    },
  };
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${manrope.className} min-h-full bg-land-mist text-land-ink`}
    >
      {children}
    </div>
  );
}
