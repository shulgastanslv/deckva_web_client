import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { getServerSession } from "next-auth";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { htmlLang, isAppLocale, ogLocale, type AppLocale } from "@/lib/i18n/config";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const localeRaw = await getLocale();
  const locale: AppLocale = isAppLocale(localeRaw) ? localeRaw : "ru";

  return {
    applicationName: "Deckva",
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    authors: [{ name: "Deckva", url: "https://deckva.by" }],
    creator: "Deckva",
    publisher: "Deckva",
    icons: {
      icon: "/browser.svg",
    },
    openGraph: {
      type: "website",
      locale: ogLocale[locale],
      siteName: "Deckva",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getServerSession(authOptions);
  const localeRaw = await getLocale();
  const locale: AppLocale = isAppLocale(localeRaw) ? localeRaw : "ru";
  const messages = await getMessages();

  return (
    <html
      lang={htmlLang[locale]}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <span className={`${montserrat.className} sr-only`} aria-hidden>
          .
        </span>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
