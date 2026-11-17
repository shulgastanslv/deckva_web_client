/**
 * Display currency preference (UI only). No catalog prices while the product is free.
 */

export const DISPLAY_CURRENCIES = ["BYN", "USD", "EUR"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

const STORAGE_KEY = "deckva:display-currency";

export const CURRENCY_LABELS: Record<DisplayCurrency, string> = {
  BYN: "BYN",
  USD: "USD",
  EUR: "EUR",
};

export function isDisplayCurrency(value: string): value is DisplayCurrency {
  return (DISPLAY_CURRENCIES as readonly string[]).includes(value);
}

export function readDisplayCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "BYN";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isDisplayCurrency(raw)) return raw;
  } catch {
    // ignore
  }
  return "BYN";
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
