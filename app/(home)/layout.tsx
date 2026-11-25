import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { SITE_URL, ogImage } from "@/lib/seo/og";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Home",
  description:
    "Deckva turns a topic into one carousel: slides in feed ratio and a file with no watermark.",
  keywords: [
    "Deckva",
    "carousel editor",
    "Instagram carousel",
    "slide editor",
    "social carousel",
  ],
  authors: [{ name: "Deckva", url: SITE_URL }],
  creator: "Deckva",
  publisher: "Deckva",
  openGraph: {
    title: "AI Carousel Editor",
    description:
      "Generate carousels, edit slides, and export to PNG, ZIP, or PDF.",
    siteName: "Deckva",
    locale: "en_US",
    type: "website",
    url: SITE_URL,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Carousel Editor",
    description:
      "Generate carousels, edit slides, and export to PNG, ZIP, or PDF.",
    images: [ogImage],
  },
};

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
