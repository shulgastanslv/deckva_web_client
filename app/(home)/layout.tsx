import type { Metadata } from "next";
import { Manrope } from "next/font/google";

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
  authors: [{ name: "Deckva", url: "https://deckva.by" }],
  creator: "Deckva",
  publisher: "Deckva",
  openGraph: {
    title: "Deckva — one carousel, not a folder",
    description:
      "A topic becomes the slides. Edit them and download a file you can post, in one project.",
    siteName: "Deckva",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deckva — one carousel, not a folder",
    description:
      "A topic becomes the slides. Edit them and download a file you can post, in one project.",
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
