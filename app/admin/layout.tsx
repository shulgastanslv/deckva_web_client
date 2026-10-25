import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-studio-sans",
});

export const metadata: Metadata = {
  title: "Админка",
  description:
    "Админ-панель Deckva: управление студией, пользователями и служебными настройками.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${inter.className} h-dvh antialiased`}>
      {children}
    </div>
  );
}
