"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { CaretRight, SpinnerGap as Loader2 } from "@phosphor-icons/react";

import { AuthProviderIcon } from "@/components/auth/oauth-icons";
import { controlSize } from "@/components/ui/control";
import Logo from "./logo/logo";
import { AUTH_PROVIDERS_UI } from "@/lib/auth/oauth/catalog";
import type { AuthProviderId } from "@/lib/auth/oauth/types";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
}

function queryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function callbackUrlFromQuery(): string {
  return queryParam("callbackUrl") || "/studio";
}

function stripAuthParams() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ["error", "auth"] as const) {
    if (!url.searchParams.has(key)) continue;
    url.searchParams.delete(key);
    changed = true;
  }
  if (changed) {
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

const providers = AUTH_PROVIDERS_UI;

export function AuthModal({
  isOpen,
  onOpenChange,
  required = false,
}: AuthModalProps) {
  const t = useTranslations("dialogs.auth");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<AuthProviderId | null>(null);
  const shownAuthError = useRef(false);

  useEffect(() => {
    const code = queryParam("error");
    if (!code || shownAuthError.current) return;
    shownAuthError.current = true;
    setErrorMessage(
      code === "AccessDenied" ? t("oauthUnconfirmed") : t("oauthFailed"),
    );
    onOpenChange?.(true);
    stripAuthParams();
  }, [onOpenChange, t]);

  const handleOpenChange = (open: boolean) => {
    if (!open && required) return;
    if (!open) {
      setErrorMessage(null);
      setLoadingId(null);
    }
    onOpenChange?.(open);
  };

  const handleSignIn = (nextAuthId: string, id: AuthProviderId) => {
    setLoadingId(id);
    setErrorMessage(null);
    void signIn(nextAuthId, {
      callbackUrl: callbackUrlFromQuery(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!required}
        className="gap-0 overflow-hidden rounded-3xl border-border/50 p-0 sm:max-w-[400px]"
      >
        <div className="px-5 pt-5">
          <div className="flex items-start justify-start mb-4">
            <Logo width={42} height={42} className="pointer-events-none" />
          </div>
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-snug">
              {t("description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-2 px-5 pt-4 pb-5">
          {errorMessage ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {providers.map((provider) => {
            const busy = loadingId === provider.id;
            return (
              <button
                key={provider.id}
                type="button"
                disabled={loadingId !== null}
                onClick={() => handleSignIn(provider.nextAuthId, provider.id)}
                className="flex w-full items-center gap-3 rounded-md bg-muted/40 p-1.5 pr-3 text-left text-[13px] font-normal text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
              >
                <span
                  className={cn(
                    controlSize,
                    "flex shrink-0 items-center justify-center rounded-md bg-background",
                  )}
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin stroke-[1.5]" />
                  ) : (
                    <AuthProviderIcon id={provider.id} />
                  )}
                </span>
                <span className="min-w-0 flex-1">{t(provider.labelKey)}</span>
                <CaretRight className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        <p className="bg-muted/30 px-5 py-3.5 text-[12px] leading-snug text-muted-foreground">
          {t.rich("agreeLegal", {
            terms: (chunks) => (
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:underline"
              >
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:underline"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
