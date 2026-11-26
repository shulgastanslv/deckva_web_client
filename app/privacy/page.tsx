import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dialogs.legal");
  return {
    title: t("privacyTitle"),
    description: t("privacyIntro"),
    alternates: { canonical: "/privacy" },
    openGraph: {
      title: t("privacyTitle"),
      description: t("privacyIntro"),
      url: "/privacy",
    },
  };
}

export default function PrivacyPage() {
  return <LegalPageShell kind="privacy" />;
}
