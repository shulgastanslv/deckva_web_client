"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import {
  getActiveOrganization,
  setOrganizationUpgrade,
  type OrganizationListItem,
} from "@/actions/organizations";
import { StudioIconPro } from "@/components/studio/ui/studio-icons";
import { PRO_FEATURES, STUDIO_PRO_PRICE } from "@/lib/studio/plans";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function StudioUpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [org, setOrg] = useState<OrganizationListItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void (async () => {
      const res = await getActiveOrganization();
      if (res.success) setOrg(res.organization);
    })();
  }, [open]);

  const alreadyPro = Boolean(org?.isUpgrade);

  const subscribe = async () => {
    if (busy || alreadyPro) return;
    setBusy(true);
    setError(null);
    try {
      const res = await setOrganizationUpgrade(true);
      if (res.success === false) {
        setError(res.error);
        return;
      }
      setOrg(res.organization);
      try {
        sessionStorage.removeItem("studio:upgrade-banner-dismissed");
      } catch {
      }
      window.dispatchEvent(new CustomEvent("studio:org-changed"));
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 sm:max-w-[350px] dark:bg-background"
      >
        <div className="relative flex items-center justify-end px-4 pt-3">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="mx-auto h-[140px] w-full max-w-[220px]">
            <StudioIconPro />
          </div>

          <DialogTitle className="mt-1 text-center text-[22px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
            {alreadyPro ? "You're on Pro" : "Go Pro"}
          </DialogTitle>
          <p className="mt-1.5 text-center text-[13px] leading-relaxed text-neutral-500 dark:text-muted-foreground">
            {alreadyPro
              ? "Everything unlocked for this workspace."
              : "One simple subscription. Cancel anytime."}
          </p>

          <div className="mt-5 flex items-baseline justify-center gap-1">
            <span className="text-[40px] font-bold tracking-tight text-neutral-950 dark:text-foreground">
              ${STUDIO_PRO_PRICE}
            </span>
            <span className="text-[14px] text-neutral-500 dark:text-muted-foreground">
              / month
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {PRO_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-[13px] text-neutral-700 dark:text-foreground"
              >
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#2f5bff]/12">
                  <Check className="size-2.5 text-[#2f5bff]" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={alreadyPro || busy}
            onClick={() => void subscribe()}
            className={cn(
              "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors",
              alreadyPro
                ? "cursor-default bg-neutral-100 text-neutral-400 dark:bg-muted"
                : "bg-[#2f5bff] text-white hover:bg-[#254ae6]",
            )}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : alreadyPro ? (
              "Current plan"
            ) : (
              `Subscribe · $${STUDIO_PRO_PRICE}/mo`
            )}
          </button>

          {error ? (
            <p className="mt-3 text-center text-[12px] text-destructive">{error}</p>
          ) : null}

          {!alreadyPro ? (
            <p className="mt-3 text-center text-[11px] text-neutral-400">
              Billed monthly. No seats, no tiers.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
