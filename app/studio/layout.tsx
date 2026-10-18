import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Swibp | Carousel Generator",
  description: "Swibp | Carousel Generator by swibp",
  keywords: ["carousel", "generator", "swibp", "carousel generator", "carousel generator by swibp"],
  authors: [{ name: "Swibp", url: "https://swibp.io" }],
  creator: "Swibp",
  publisher: "Swibp",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${manrope.className} h-dvh antialiased`}>{children}</div>
  );
}
