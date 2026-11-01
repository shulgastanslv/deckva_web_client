import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Главная",
  description:
    "Deckva собирает карусель как один пост: тема, слайды в формате ленты и файл без водяного знака.",
  keywords: [
    "Deckva",
    "редактор каруселей",
    "Instagram карусель",
    "редактор слайдов",
    "студия контента",
    "carousel editor",
  ],
  authors: [{ name: "Deckva", url: "https://deckva.by" }],
  creator: "Deckva",
  publisher: "Deckva",
  openGraph: {
    title: "Deckva — карусель без сборки по частям",
    description:
      "Тема становится лентой слайдов. Правки и файл для публикации — в одном проекте.",
    siteName: "Deckva",
    locale: "ru_BY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deckva — карусель без сборки по частям",
    description:
      "Тема становится лентой слайдов. Правки и файл для публикации — в одном проекте.",
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
