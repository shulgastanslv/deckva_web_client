import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { ogImage } from "@/lib/seo/og";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Просмотр карусели",
  description:
    "Публичный просмотр карусели, созданной в Deckva. Листайте слайды и смотрите готовый пост.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Карусель · Deckva",
    description: "Публичный просмотр карусели из студии Deckva.",
    siteName: "Deckva",
    locale: "ru_BY",
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImage],
  },
};

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${manrope.className} min-h-dvh bg-[#f6f4fb] text-[#14151c] dark:bg-[#121212] dark:text-white`}
    >
      {children}
    </div>
  );
}
