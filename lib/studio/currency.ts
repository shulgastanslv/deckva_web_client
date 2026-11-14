/**
 * Display currency for prices in Preferences / upgrade / landing / prompt.
 * Charging (bePaid) stays in base BYN — this is UI conversion only.
 */

import {
  CREDIT_PACK_CREDITS,
  CREDIT_PACK_PRICE,
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
} from "@/lib/studio/plans";

export const DISPLAY_CURRENCIES = ["BYN", "USD", "EUR"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

const STORAGE_KEY = "deckva:display-currency";

/** Approximate FX from BYN (base catalog prices). */
const RATE_FROM_BYN: Record<DisplayCurrency, number> = {
  BYN: 1,
  USD: 1 / 3.2,
  EUR: 1 / 3.5,
};

export const CURRENCY_LABELS: Record<DisplayCurrency, string> = {
  BYN: "BYN",
  USD: "USD",
  EUR: "EUR",
};

export function isDisplayCurrency(value: string): value is DisplayCurrency {
  return (DISPLAY_CURRENCIES as readonly string[]).includes(value);
}

export function readDisplayCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return STUDIO_PRO_CURRENCY as DisplayCurrency;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isDisplayCurrency(raw)) return raw;
  } catch {
    // ignore
  }
  return (STUDIO_PRO_CURRENCY as DisplayCurrency) || "BYN";
}

export function writeDisplayCurrency(currency: DisplayCurrency): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, currency);
    window.dispatchEvent(
      new CustomEvent("deckva:currency-changed", { detail: { currency } }),
    );
  } catch {
    // ignore
  }
}

export function convertFromByn(amountByn: number, currency: DisplayCurrency): number {
  const rate = RATE_FROM_BYN[currency] ?? 1;
  const value = amountByn * rate;
  if (currency === "BYN") return Math.round(value);
  return Math.round(value * 100) / 100;
}

export function formatMoney(
  amountByn: number,
  currency: DisplayCurrency,
): { amount: number; currency: DisplayCurrency; label: string } {
  const amount = convertFromByn(amountByn, currency);
  return {
    amount,
    currency,
    label: `${amount} ${currency}`,
  };
}

export function proPrice(currency: DisplayCurrency) {
  return formatMoney(STUDIO_PRO_PRICE, currency);
}

export function creditPackPrice(currency: DisplayCurrency) {
  return formatMoney(CREDIT_PACK_PRICE, currency);
}

/** Approx money for N generation credits in display currency. */
export function creditsToMoney(credits: number, currency: DisplayCurrency) {
  if (credits <= 0 || CREDIT_PACK_CREDITS <= 0) {
    return formatMoney(0, currency);
  }
  const byn = (CREDIT_PACK_PRICE / CREDIT_PACK_CREDITS) * credits;
  return formatMoney(byn, currency);
}
