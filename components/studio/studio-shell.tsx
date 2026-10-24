"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AuthModal } from "@/components/auth";
import { StudioGenerateDialog } from "@/components/studio/create/studio-generate-dialog";
import { StudioHeader } from "@/components/studio/header/studio-header";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioSidebar } from "@/components/studio/sidebar/studio-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      <div className="flex h-dvh w-full overflow-hidden bg-[#f5f5f5] text-foreground dark:bg-background">
        <StudioSidebar
          search={sidebarSearch}
          onSearchChange={setSidebarSearch}
          onBlank={create.openBlank}
          onGenerate={create.openGenerate}
          onTemplates={create.openTemplates}
        />

        <div className="relative m-2 ml-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-background dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <StudioHeader onSignIn={() => setAuthOpen(true)} />
          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        <StudioGenerateDialog
          open={create.generateOpen}
          onOpenChange={(open) => {
            if (!open) create.closeGenerate();
            else create.setGenerateOpen(true);
          }}
          theme={create.theme}
          onThemeChange={create.setTheme}
          submitting={create.submitting}
          onSubmit={create.submitGenerate}
        />

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
