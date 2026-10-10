import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});


export const metadata: Metadata = {
  title: "swibp | carousel maker",
  description: "swibp | carousel maker by swibp",
  keywords: ["carousel", "maker", "swibp", "carousel maker", "carousel maker by swibp"],
  authors: [{ name: "swibp", url: "https://swibp.io" }],
  icons: {
    icon: "browser.svg",
  },
  creator: "swibp",
  publisher: "swibp",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="light"
      className={`${manrope.className} min-h-full bg-[#f6f4fb] text-[#14151c]`}
    >
      {children}
    </div>
  );
}
