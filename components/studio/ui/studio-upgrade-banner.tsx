"use client";

import { useEffect, useState } from "react";
import {
  ArrowCircleUp as ArrowUpCircle,
  X,
} from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { getGenerationStatus } from "@/actions/ai";
import { FREE_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "studio:upgrade-banner-dismissed";

export function StudioUpgradeBanner({ className }: { className?: string }) {
  const t = useTranslations("studio.upgrade");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [exhausted, setExhausted] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    void (async () => {
      try {
        const status = await getGenerationStatus();
        if (!cancelled) {
          setExhausted(!status.entitlement.canGenerate);
          setIsPro(status.entitlement.isPro);
        }
      } catch {
        // ignore
      }
    })();
    const onChanged = (event: Event) => {
      const remaining = (
        event as CustomEvent<{
          entitlement?: { remaining?: number; canGenerate?: boolean; isPro?: boolean };
        }>
      ).detail?.entitlement;
      if (remaining && typeof remaining.canGenerate === "boolean") {
        setExhausted(!remaining.canGenerate);
      }
      if (typeof remaining?.isPro === "boolean") {
        setIsPro(remaining.isPro);
      }
    };
    window.addEventListener("studio:generations-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:generations-changed", onChanged);
    };
  }, [signedIn]);

  const visible =
    signedIn &&
    !dismissed &&
    exhausted &&
    (typeof window === "undefined" || sessionStorage.getItem(DISMISS_KEY) !== "1");

  if (!visible) return null;

  const openUpgrade = () => {
    window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className={cn("mb-4 w-full shrink-0 pt-2", className)}>
      <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground">
        <ArrowUpCircle
          className="size-5 shrink-0 stroke-[1.75] opacity-95"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-[13px] leading-snug sm:text-[14px]">
          {isPro
            ? t("creditsExhausted")
            : t("freeLimitReached", { limit: FREE_GENERATION_LIMIT })}{" "}
          <button
            type="button"
            onClick={openUpgrade}
            className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-90"
          >
            {isPro ? t("buyCredits") : t("upgrade")}
          </button>
        </p>
        <button
          type="button"
          aria-label={t("dismiss")}
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 opacity-80 transition-opacity hover:bg-primary-foreground/15 hover:opacity-100"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
