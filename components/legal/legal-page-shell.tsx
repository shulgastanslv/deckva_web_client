"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo/logo";
import { LegalDocument } from "@/components/legal/legal-document";
import type { LegalKind } from "@/lib/legal/sections";

export function LegalPageShell({ kind }: { kind: LegalKind }) {
  const t = useTranslations("common");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-5">
        <Logo width={36} height={36} href="/" className="shrink-0" />
        <Link
          href="/"
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("back")}
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-4">
        <LegalDocument kind={kind} />
      </main>
    </div>
  );
}
