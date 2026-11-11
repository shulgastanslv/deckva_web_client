"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo/logo";

export function NotAvailablePhone() {
  const t = useTranslations("editor.mobileGate");
  const tc = useTranslations("common");

  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f4fb] text-[#14151c]">
      <header className="mx-auto flex w-full max-w-lg items-center px-4 py-4">
        <Logo width={32} height={32} className="text-[#14151c]" />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5c6170]">
          {t("body")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
        >
          {tc("back")}
        </Link>
      </main>
    </div>
  );
}
