import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swibp | carousel maker",
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
  return children;
}
