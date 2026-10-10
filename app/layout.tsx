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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <span className={`${montserrat.className} sr-only`} aria-hidden>
          .
        </span>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
