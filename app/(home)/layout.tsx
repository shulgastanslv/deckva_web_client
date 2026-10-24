import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Swibp | Carousel Generator",
  description: "Swibp | Carousel Generator by swibp",
  keywords: [
    "carousel",
    "generator",
    "swibp",
    "carousel generator",
    "carousel generator by swibp",
  ],
  authors: [{ name: "Swibp", url: "https://swibp.io" }],
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
