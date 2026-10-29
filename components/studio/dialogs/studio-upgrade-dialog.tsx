"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2, X } from "lucide-react";

import {
  attachPaymentCard,
  getBilling,
  subscribePro,
} from "@/actions/billing";
import type { BillingSnapshot } from "@/lib/billing/types";
import { formatCardBrand } from "@/lib/billing/card";
import {
  PRO_FEATURES,
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
} from "@/lib/studio/plans";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = "plan" | "payment";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function StudioUpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [billing, setBilling] = useState<BillingSnapshot | null>(null);
  const [step, setStep] = useState<Step>("plan");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const load = async () => {
    const res = await getBilling();
    if (res.success) {
      setBilling(res.billing);
      setShowCardForm(!res.billing.paymentMethod);
    }
  };

  useEffect(() => {
    if (!open) return;
    setStep("plan");
    setError(null);
    setCardNumber("");
    setExp("");
    setCvv("");
    setBusy(false);
    void load();
  }, [open]);

  const alreadyPro = Boolean(billing?.isPro);
  const hasCard = Boolean(billing?.paymentMethod);

  const parseExp = () => {
    const m = exp.replace(/\s/g, "").match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
    if (!m) return null;
    return { month: Number(m[1]), year: Number(m[2]) };
  };

  const subscribe = async () => {
    if (busy || alreadyPro) return;
    setBusy(true);
    setError(null);
    try {
      if (!hasCard || showCardForm) {
        const parsed = parseExp();
        if (!parsed) {
          setError("Use MM/YY for expiry");
          return;
        }
        const attached = await attachPaymentCard({
          number: cardNumber,
          expMonth: parsed.month,
          expYear: parsed.year,
          cvv,
        });
        if (attached.success === false) {
          setError(attached.error);
          return;
        }
        setBilling(attached.billing);
      }

      const res = await subscribePro();
      if (res.success === false) {
        setError(res.error);
        if (res.error.toLowerCase().includes("card")) {
          setShowCardForm(true);
        }
        return;
      }
      setBilling(res.billing);
      try {
        sessionStorage.removeItem("studio:upgrade-banner-dismissed");
      } catch {
        /* ignore */
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
        className="gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 sm:max-w-[300px] dark:bg-background dark:ring-1 dark:ring-border"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute top-2.5 right-2.5 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>

        <div className="px-5 pt-5 pb-5">
          {step === "plan" || alreadyPro ? (
            <>
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
                {alreadyPro ? "You're on Pro" : "Pro"}
              </DialogTitle>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                {alreadyPro
                  ? billing?.cancelAtPeriodEnd
                    ? "Cancels at period end."
                    : "Personal plan · billed monthly."
                  : "Personal plan. Cancel anytime."}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[28px] font-semibold tracking-tight text-foreground">
                  {STUDIO_PRO_PRICE}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {STUDIO_PRO_CURRENCY}/mo
                </span>
              </div>

              {!alreadyPro ? (
                <ul className="mt-3.5 space-y-1.5">
                  {PRO_FEATURES.slice(0, 3).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-[12px] text-foreground/80"
                    >
                      <Check
                        className="size-3 shrink-0 text-[#2f5bff]"
                        strokeWidth={3}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}

              <button
                type="button"
                disabled={alreadyPro}
                onClick={() => {
                  setError(null);
                  setStep("payment");
                }}
                className={cn(
                  "mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full text-[13px] font-semibold transition-colors",
                  alreadyPro
                    ? "cursor-default bg-muted text-muted-foreground"
                    : "bg-[#2f5bff] text-white hover:bg-[#254ae6]",
                )}
              >
                {alreadyPro
                  ? "Current plan"
                  : `Continue · ${STUDIO_PRO_PRICE} ${STUDIO_PRO_CURRENCY}`}
              </button>
            </>
          ) : (
            <>
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
                Add a card
              </DialogTitle>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                Saved for monthly Pro billing. Manage later in Settings.
              </p>

              {hasCard && !showCardForm && billing?.paymentMethod ? (
                <button
                  type="button"
                  onClick={() => setShowCardForm(true)}
                  className="mt-4 flex w-full items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-muted"
                >
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {formatCardBrand(billing.paymentMethod.brand)} ····{" "}
                    {billing.paymentMethod.last4}
                  </span>
                  <span className="text-muted-foreground">Change</span>
                </button>
              ) : null}

              {!hasCard || showCardForm ? (
                <div className="mt-4 space-y-2">
                  <Input
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder="Card number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="h-9 rounded-xl bg-muted/50 px-3 text-[13px]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={exp}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^\d/]/g, "");
                        if (
                          v.length === 2 &&
                          !v.includes("/") &&
                          exp.length < 2
                        ) {
                          v = `${v}/`;
                        }
                        setExp(v.slice(0, 7));
                      }}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="h-9 rounded-xl bg-muted/50 px-3 text-[13px]"
                    />
                    <Input
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="CVV"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      type="password"
                      className="h-9 rounded-xl bg-muted/50 px-3 text-[13px]"
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => void subscribe()}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#2f5bff] text-[13px] font-semibold text-white transition-colors hover:bg-[#254ae6] disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  `Subscribe · ${STUDIO_PRO_PRICE} ${STUDIO_PRO_CURRENCY}`
                )}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setStep("plan");
                }}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-full text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
              >
                Back
              </button>
            </>
          )}

          {error ? (
            <p className="mt-2.5 text-center text-[11px] text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
