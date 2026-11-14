"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  creditPackPrice,
  creditsToMoney,
  DISPLAY_CURRENCIES,
  proPrice,
  readDisplayCurrency,
  writeDisplayCurrency,
  type DisplayCurrency,
} from "@/lib/studio/currency";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === "deckva:display-currency") onStoreChange();
  };
  window.addEventListener("deckva:currency-changed", onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("deckva:currency-changed", onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): DisplayCurrency {
  return readDisplayCurrency();
}

function getServerSnapshot(): DisplayCurrency {
  return "BYN";
}

export function useDisplayCurrency() {
  const currency = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    writeDisplayCurrency(next);
  }, []);

  return {
    currency: mounted ? currency : ("BYN" as DisplayCurrency),
    setCurrency,
    currencies: DISPLAY_CURRENCIES,
    pro: proPrice(mounted ? currency : "BYN"),
    pack: creditPackPrice(mounted ? currency : "BYN"),
    moneyForCredits: (credits: number) =>
      creditsToMoney(credits, mounted ? currency : "BYN"),
  };
}
