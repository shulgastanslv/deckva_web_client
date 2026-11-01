import Link from "next/link";

import Logo from "@/components/logo";

export function NotAvailablePhone() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-lg items-center px-4 py-4">
        <Logo width={32} height={32} />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          The editor needs a wider screen
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          The canvas, layers, and export stay on a computer. Projects, templates, and brand kit open on your phone.
        </p>
        <Link
          href="/studio"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Back to studio
        </Link>
      </main>
    </div>
  );
}

