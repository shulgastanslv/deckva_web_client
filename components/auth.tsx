"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { SpinnerGap as Loader2 } from "@phosphor-icons/react";

import { AuthProviderIcon } from "@/components/auth/oauth-icons";
import Logo from "./logo/logo";
import { AUTH_PROVIDERS_UI } from "@/lib/auth/oauth/catalog";
import type { AuthProviderId } from "@/lib/auth/oauth/types";

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
        <DialogHeader className="space-y-3 px-6 pt-6 pb-2 text-center sm:text-center">
          <div className="mx-auto">
            <Logo width={42} height={42} />
          </div>
        </DialogHeader>

        <div className="space-y-3 px-6 py-5">
          {errorMessage ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {providers.map((provider) => {
            const busy = loadingId === provider.id;
            return (
              <Button
                key={provider.id}
                type="button"
                variant="secondary"
                className="w-full gap-2 h-12 text-[13px]"
                disabled={loadingId !== null}
                onClick={() => handleSignIn(provider.nextAuthId, provider.id)}
              >
                {busy ? (
                  <Loader2 className="size-5 animate-spin stroke-[1.5]" />
                ) : (
                  <AuthProviderIcon id={provider.id} />
                )}
                {t(provider.labelKey)}
              </Button>
            );
          })}

          <p className="pt-1 text-center text-sm leading-relaxed text-muted-foreground">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
