import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Deckva stores, and why.",
};

export default function PrivacyPage() {
  return <LegalPageShell kind="privacy" />;
}
