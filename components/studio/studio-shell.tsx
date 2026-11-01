"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { AuthModal } from "@/components/auth";
import { StudioHeader } from "@/components/studio/header/studio-header";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioMobileNav } from "@/components/studio/studio-mobile-nav";
import { StudioSidebar } from "@/components/studio/sidebar/studio-sidebar";
import { StudioUpgradeBanner } from "@/components/studio/ui/studio-upgrade-banner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const create = useStudioCreate();
  const { authNeeded, setAuthNeeded } = create;

  useEffect(() => {
    const onAuthLink = (event: Event) => {
      const detail = (
        event as CustomEvent<{ verify?: string | null; reset?: string | null }>
      ).detail;
      if (detail?.verify) setAuthVerifyToken(detail.verify);
      if (detail?.reset) setAuthResetToken(detail.reset);
      if (detail?.verify || detail?.reset) setAuthOpen(true);
    };
    window.addEventListener("core:auth-link", onAuthLink);
    return () => window.removeEventListener("core:auth-link", onAuthLink);
  }, []);

  useEffect(() => {
    if (!authNeeded) return;
    setAuthOpen(true);
    setAuthNeeded(false);
  }, [authNeeded, setAuthNeeded]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  useEffect(() => {
    const q = sidebarSearch.trim();
    const t = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("studio:sidebar-search", { detail: { query: q } }),
      );
    }, q ? 180 : 0);
    return () => window.clearTimeout(t);
  }, [sidebarSearch]);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-dvh w-full gap-2 overflow-hidden bg-[#e6e8ef] p-2 text-foreground sm:gap-3 sm:p-3 dark:bg-[#0c0d12]">
        <div className="hidden h-full md:flex">
          <div className="flex h-full overflow-hidden rounded-3xl bg-white dark:bg-[#14151c]">
            <StudioSidebar
              search={sidebarSearch}
              onSearchChange={setSidebarSearch}
              onBlank={create.openBlank}
              onTemplates={create.openTemplates}
            />
          </div>
        </div>

        {navOpen ? (
          <div className="fixed inset-0 z-[80] md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/55"
              onClick={() => setNavOpen(false)}
            />
            <div className="absolute inset-y-2 left-2 flex w-[min(20rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#14151c]">
              <div className="flex justify-end px-2 pt-2">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setNavOpen(false)}
                  className="flex size-9 items-center justify-center rounded-full text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <StudioSidebar
                className="min-h-0 w-full flex-1"
                search={sidebarSearch}
                onSearchChange={setSidebarSearch}
                onBlank={create.openBlank}
                onTemplates={create.openTemplates}
              />
            </div>
          </div>
        ) : null}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 sm:gap-3">
          <StudioHeader
            onSignIn={() => setAuthOpen(true)}
            onMenu={() => setNavOpen(true)}
          />
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-background">
            <StudioUpgradeBanner />
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              {children}
            </div>
          </div>
          <StudioMobileNav
            moreOpen={navOpen}
            onMore={() => setNavOpen((open) => !open)}
          />
        </div>

        <AuthModal
          isOpen={authOpen}
          verifyToken={authVerifyToken}
          resetToken={authResetToken}
          onOpenChange={(open) => {
            setAuthOpen(open);
            if (!open) {
              setAuthVerifyToken(null);
              setAuthResetToken(null);
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}
