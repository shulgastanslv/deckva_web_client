import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-studio-sans",
});

export const metadata: Metadata = {
  title: "Swibp Admin",
  description: "Studio admin desk",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${inter.className} h-dvh antialiased`}
    >
      {children}
    </div>
  );
}
