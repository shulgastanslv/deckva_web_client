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
  title: "Студия",
  description:
    "Студия Deckva: правка слоёв на холсте, шаблоны, папки и экспорт слайдов в PNG или ZIP.",
  keywords: [
    "Deckva",
    "студия",
    "редактор каруселей",
    "холст",
    "шаблоны",
    "экспорт PNG",
    "carousel editor",
  ],
  authors: [{ name: "Deckva", url: "https://deckva.by" }],
  creator: "Deckva",
  publisher: "Deckva",
  icons: {
    icon: "/browser.svg",
  },
  openGraph: {
    title: "Deckva · Студия",
    description:
      "Рабочее пространство Deckva: проекты, холст и экспорт каруселей.",
    siteName: "Deckva",
    locale: "ru_BY",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Deckva · Студия",
    description:
      "Рабочее пространство Deckva: проекты, холст и экспорт каруселей.",
  },
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
