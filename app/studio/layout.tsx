import type { Metadata } from "next";
import { Inter  } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Swibp | Carousel Generator",
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
    <div className={`${inter.className} h-dvh antialiased`}>{children}</div>
  );
}
