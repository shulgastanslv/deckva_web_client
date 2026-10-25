import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  applicationName: "Deckva",
  title: {
    default: "Deckva — студия каруселей",
    template: "%s · Deckva",
  },
  description:
    "Deckva — студия каруселей для соцсетей. Соберите слайды на холсте, отредактируйте и экспортируйте в PNG или ZIP.",
  keywords: [
    "Deckva",
    "карусель",
    "карусели",
    "Instagram",
    "студия",
    "редактор слайдов",
    "редактор каруселей",
    "соцсети",
    "carousel",
    "carousel maker",
  ],
  authors: [{ name: "Deckva", url: "https://deckva.by" }],
  creator: "Deckva",
  publisher: "Deckva",
  icons: {
    icon: "/browser.svg",
  },
  openGraph: {
    type: "website",
    locale: "ru_BY",
    siteName: "Deckva",
    title: "Deckva — студия каруселей",
    description:
      "Шаблоны, холст и экспорт. Карусели для Instagram и других соцсетей.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deckva — студия каруселей",
    description:
      "Шаблоны, холст и экспорт. Карусели для Instagram и других соцсетей.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <span className={`${montserrat.className} sr-only`} aria-hidden>
          .
        </span>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
