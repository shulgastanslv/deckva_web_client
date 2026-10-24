import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-studio-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-studio-serif",
});

export const metadata: Metadata = {
  title: "Swibp | Carousel Generator",
  description: "Swibp | carousel maker by swibp",
  keywords: [
    "carousel",
    "maker",
    "swibp",
    "carousel maker",
    "carousel maker by swibp",
  ],
  authors: [{ name: "Swibp", url: "https://swibp.io" }],
  icons: {
    icon: "/browser.svg",
  },
  creator: "Swibp",
  publisher: "Swibp",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${instrumentSerif.variable} ${inter.className} h-dvh antialiased`}
    >
      {children}
    </div>
  );
}
