import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
});

export const metadata: Metadata = {
  title: "Главная",
  description:
    "Deckva — студия каруселей для соцсетей. Сгенерируйте историю по слайдам, отредактируйте в редакторе и экспортируйте без водяных знаков.",
  keywords: [
    "Deckva",
    "генератор каруселей",
    "Instagram карусель",
    "редактор слайдов",
    "студия контента",
    "carousel generator",
  ],
  authors: [{ name: "Deckva", url: "https://deckva.by" }],
  creator: "Deckva",
  publisher: "Deckva",
  openGraph: {
    title: "Deckva — генератор каруселей",
    description:
      "Тема → слайды → студия. Создавайте карусели для Instagram и других соцсетей.",
    siteName: "Deckva",
    locale: "ru_BY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deckva — генератор каруселей",
    description:
      "Тема → слайды → студия. Создавайте карусели для Instagram и других соцсетей.",
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
