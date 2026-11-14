"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  SpinnerGap as Loader2,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  attachPaymentCard,
  getBilling,
  purchaseCredits,
  subscribePro,
} from "@/actions/billing";
import type { BillingSnapshot } from "@/lib/billing/types";
import { formatCardBrand } from "@/lib/billing/card";
import {
  CREDIT_PACK_CREDITS,
  CREDIT_PACK_PRICE,
  PRO_MONTHLY_CREDITS,
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
import { controlH } from "@/components/ui/control";

type Step = "plan" | "payment";

const FEATURE_KEYS = [
  "unlimitedAi",
  "hiResExports",
  "foldersBrand",
] as const;

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
  const t = useTranslations("dialogs.upgrade");
  const ts = useTranslations("studio.upgrade");
  const tv = useTranslations("dialogs.settings.validation");
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
          setError(tv("expiry"));
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
      window.dispatchEvent(
        new CustomEvent("studio:generations-changed", {
          detail: {
            entitlement: {
              isPro: true,
              remaining: res.billing.creditsTotal,
              canGenerate: res.billing.creditsTotal > 0,
              credits: {
                plan: res.billing.creditsPlan,
                topup: res.billing.creditsTopup,
                total: res.billing.creditsTotal,
              },
            },
          },
        }),
      );
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const buyCredits = async () => {
    if (busy || !alreadyPro) return;
    setBusy(true);
    setError(null);
    try {
      const res = await purchaseCredits();
      if (res.success === false) {
        setError(res.error);
        return;
      }
      setBilling(res.billing);
      try {
        sessionStorage.removeItem("studio:upgrade-banner-dismissed");
      } catch {
        /* ignore */
      }
      window.dispatchEvent(
        new CustomEvent("studio:generations-changed", {
          detail: {
            entitlement: {
              isPro: true,
              remaining: res.billing.creditsTotal,
              canGenerate: res.billing.creditsTotal > 0,
              credits: {
                plan: res.billing.creditsPlan,
                topup: res.billing.creditsTopup,
                total: res.billing.creditsTotal,
              },
            },
          },
        }),
      );
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[300px]"
      >
        <button
          type="button"
          aria-label={t("close")}
          onClick={() => onOpenChange(false)}
          className="absolute top-2.5 right-2.5 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>

        <div className="px-5 pt-5 pb-5">
          {step === "plan" || alreadyPro ? (
            <>
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
                {alreadyPro ? t("onPro") : t("pro")}
              </DialogTitle>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                {alreadyPro
                  ? billing?.cancelAtPeriodEnd
                    ? t("cancelsAtEnd")
                    : t("billedMonthly")
                  : t("cancelAnytime")}
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
                  {FEATURE_KEYS.map((key) => (
                    <li
                      key={key}
                      className="flex items-center gap-2 text-[12px] text-foreground/80"
                    >
                      <Check
                        className="size-3 shrink-0 text-primary"
                        strokeWidth={3}
                      />
                      {key === "unlimitedAi"
                        ? ts(`features.${key}`, { count: PRO_MONTHLY_CREDITS })
                        : ts(`features.${key}`)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3.5 text-[12px] text-muted-foreground">
                  {ts("unlimitedOnSub", {
                    remaining: billing?.creditsTotal ?? 0,
                    plan: billing?.creditsPlan ?? 0,
                    topup: billing?.creditsTopup ?? 0,
                  })}
                </p>
              )}

              {alreadyPro ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void buyCredits()}
                  className={cn(
                    "mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary text-[13px] font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary/90 disabled:opacity-60",
                    controlH,
                  )}
                >
                  {busy ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    ts("buyCreditsPack", {
                      credits: billing?.creditPackCredits ?? CREDIT_PACK_CREDITS,
                      price: billing?.creditPackPrice ?? CREDIT_PACK_PRICE,
                      currency: STUDIO_PRO_CURRENCY,
                    })
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("payment");
                  }}
                  className={cn(
                    "mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary text-[13px] font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary/90",
                    controlH,
                  )}
                >
                  {t("continuePrice", {
                    price: STUDIO_PRO_PRICE,
                    currency: STUDIO_PRO_CURRENCY,
                  })}
                </button>
              )}
            </>
          ) : (
            <>
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
                {t("addCard")}
              </DialogTitle>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                {t("cardSavedHint")}
              </p>

              {hasCard && !showCardForm && billing?.paymentMethod ? (
                <button
                  type="button"
                  onClick={() => setShowCardForm(true)}
                  className="mt-4 flex w-full items-center gap-2 rounded-2xl bg-muted/40 px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-muted/60"
                >
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {formatCardBrand(billing.paymentMethod.brand)} ····{" "}
                    {billing.paymentMethod.last4}
                  </span>
                  <span className="text-muted-foreground">{t("change")}</span>
                </button>
              ) : null}

              {!hasCard || showCardForm ? (
                <div className="mt-4 space-y-2">
                  <Input
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder={t("cardNumber")}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="rounded-md border-none bg-muted/40 px-3.5 text-[13px] shadow-none focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20"
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
                      placeholder={t("exp")}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="rounded-md border-none bg-muted/40 px-3.5 text-[13px] shadow-none focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20"
                    />
                    <Input
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder={t("cvv")}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      type="password"
                      className="rounded-md border-none bg-muted/40 px-3.5 text-[13px] shadow-none focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20"
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => void subscribe()}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary text-[13px] font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary/90 disabled:opacity-60",
                  controlH,
                )}
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  t("subscribePrice", {
                    price: STUDIO_PRO_PRICE,
                    currency: STUDIO_PRO_CURRENCY,
                  })
                )}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setStep("plan");
                }}
                className={cn(
                  "mt-2 flex w-full items-center justify-center rounded-md border-none bg-transparent text-[12px] font-medium text-muted-foreground shadow-none transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-60",
                  controlH,
                )}
              >
                {t("back")}
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
