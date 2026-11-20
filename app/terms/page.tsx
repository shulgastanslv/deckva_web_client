import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using the Deckva studio.",
};

export default function TermsPage() {
  return <LegalPageShell kind="terms" />;
}
