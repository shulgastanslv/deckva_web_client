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
    title: "AI Carousel Editor",
    description:
      "Generate carousels, edit slides, and export to PNG, ZIP, or PDF.",
    siteName: "Deckva",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/presentation.png",
        width: 1200,
        height: 630,
        alt: "Deckva — AI Carousel Editor",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Carousel Editor",
    description:
      "Generate carousels, edit slides, and export to PNG, ZIP, or PDF.",
    images: ["/presentation.png"],
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
