"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

import { AuthModal } from "@/components/auth";
import { threadsContentOffset } from "@/components/nav/threads-chrome";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioThreadsNav } from "@/components/studio/studio-threads-nav";
import { StudioUpgradeBanner } from "@/components/studio/ui/studio-upgrade-banner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function StudioShell({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
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
      <div className="relative h-dvh w-full overflow-hidden bg-background text-foreground">
        <Suspense fallback={null}>
          <StudioThreadsNav
            search={sidebarSearch}
            onSearchChange={setSidebarSearch}
            onBlank={() => void create.openBlank()}
            onTemplates={create.openTemplates}
            onSignIn={() => setAuthOpen(true)}
          />
        </Suspense>

        <div
          className={cn(
            "flex h-full min-w-0 flex-col",
            threadsContentOffset,
          )}
        >
          <StudioUpgradeBanner />
          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
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
