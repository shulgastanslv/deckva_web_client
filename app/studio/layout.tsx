import type { Metadata } from "next";
import { Inter, Instrument_Serif, Cormorant_Garamond } from "next/font/google";

import { StudioSessionCache } from "@/components/studio/studio-session-cache";

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
  keywords: ["Deckva", "studio", "carousel editor", "canvas", "community", "export PNG"],
  authors: [{ name: "Deckva", url: "https://deckva.by" }],
  creator: "Deckva",
  publisher: "Deckva",
  icons: { icon: "/browser.svg" },
  openGraph: {
    title: "Deckva · Studio",
    description: "Projects, canvas, and carousel export.",
    siteName: "Deckva",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Deckva · Studio",
    description: "Projects, canvas, and carousel export.",
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
      {children}
    </div>
  );
}
