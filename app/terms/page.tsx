import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dialogs.legal");
  return {
    title: t("termsTitle"),
    description: t("termsIntro"),
    alternates: { canonical: "/terms" },
    openGraph: {
      title: t("termsTitle"),
      description: t("termsIntro"),
      url: "/terms",
    },
  };
}

export default function TermsPage() {
  return <LegalPageShell kind="terms" />;
}
