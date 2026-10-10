import Link from "next/link";

import Logo from "@/components/logo";

export function NotAvailablePhone() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f4fb] text-[#14151c]">
      <header className="mx-auto flex w-full max-w-lg items-center px-4 py-4">
        <Logo width={32} height={32} className="text-[#14151c]" />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <DesktopArt />
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          The studio needs a wider screen
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5c6170]">
          Editing a carousel works on a computer. Open this page on a desktop to use the canvas, layers, and export.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-[#2f5bff] px-5 text-sm font-semibold text-white"
        >
          Back to Swibp
        </Link>
      </main>
    </div>
  );
}

function DesktopArt() {
  return (
    <svg viewBox="0 0 280 180" className="h-auto w-full max-w-[280px]" aria-hidden>
      <circle cx="148" cy="86" r="62" fill="#ffe08a" />
      <rect x="36" y="28" width="168" height="108" rx="18" fill="#fff" />
      <rect x="48" y="40" width="96" height="72" rx="12" fill="#e4ebff" />
      <rect x="60" y="52" width="48" height="8" rx="4" fill="#14151c" />
      <rect x="60" y="66" width="32" height="6" rx="3" fill="#fff" />
      <rect x="60" y="80" width="72" height="20" rx="6" fill="#2f5bff" />
      <rect x="156" y="40" width="36" height="28" rx="8" fill="#efe7ff" />
      <rect x="156" y="74" width="36" height="38" rx="8" fill="#fff4cc" />
      <rect x="78" y="136" width="84" height="8" rx="4" fill="#14151c" />
      <rect x="62" y="148" width="116" height="6" rx="3" fill="#fff" />
    </svg>
  );
}
