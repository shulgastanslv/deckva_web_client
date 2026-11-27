import type { Metadata } from "next";
import { Inter, Instrument_Serif, Cormorant_Garamond } from "next/font/google";

import { StudioSessionCache } from "@/components/studio/studio-session-cache";
import { StudioTourHost } from "@/components/studio/tour/studio-tour-host";
import { SITE_URL, ogImage } from "@/lib/seo/og";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-studio-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-studio-serif",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-studio-serif",
});

/** Server Actions used by studio (AI / image tools) may run up to 3 minutes. */
export const maxDuration = 180;

export const metadata: Metadata = {
  title: "Studio",
  description: "Canvas editing, community, folders, and PNG/ZIP slide export.",
  robots: { index: false, follow: false },
  keywords: ["Deckva", "studio", "carousel editor", "canvas", "community", "export PNG"],
  authors: [{ name: "Deckva", url: SITE_URL }],
  creator: "Deckva",
  publisher: "Deckva",
  icons: {
    icon: [
      {
        url: "/favicon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "AI Carousel Editor",
    description:
      "Generate carousels, edit slides, and export to PNG, ZIP, or PDF.",
    siteName: "Deckva",
    locale: "en_US",
    type: "website",
    url: `${SITE_URL}/studio`,
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

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${instrumentSerif.variable} ${cormorantGaramond.variable} ${inter.className} h-dvh antialiased`}
    >
      <StudioSessionCache />
      <StudioTourHost />
      {children}
    </div>
  );
}
