import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Swibp | carousel maker",
  description: "Swibp | carousel maker by swibp",
  keywords: ["carousel", "maker", "swibp", "carousel maker", "carousel maker by swibp"],
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
    <div className={`${manrope.className} h-dvh antialiased`}>{children}</div>
  );
}
