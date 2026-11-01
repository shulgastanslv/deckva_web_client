"use client";

import { useSyncExternalStore } from "react";

type MediaStore = {
  mql: MediaQueryList;
  listeners: Set<() => void>;
};

const stores = new Map<string, MediaStore>();

function storeFor(query: string): MediaStore | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  let store = stores.get(query);
  if (store) return store;
  const mql = window.matchMedia(query);
  const listeners = new Set<() => void>();
  const onChange = () => {
    for (const listener of listeners) listener();
  };
  mql.addEventListener("change", onChange);
  store = { mql, listeners };
  stores.set(query, store);
  return store;
}

function subscribe(query: string, onStoreChange: () => void) {
  const store = storeFor(query);
  if (!store) return () => {};
  store.listeners.add(onStoreChange);
  return () => {
    store.listeners.delete(onStoreChange);
  };
}

/**
 * `null` on the server and during hydration, then the real match.
 * Callers should keep data-fetching trees unmounted while this is `null`,
 * so a phone-sized viewport never starts those requests.
 * One MediaQueryList is shared per query string.
 */
export function useMediaQuery(query: string): boolean | null {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => storeFor(query)?.mql.matches ?? false,
    () => null,
  );
}
