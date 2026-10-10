import type { Metadata } from "next";

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
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
