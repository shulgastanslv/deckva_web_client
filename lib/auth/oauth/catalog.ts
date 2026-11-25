import type { AuthProviderUi } from "@/lib/auth/oauth/types";

/**
 * Client-safe provider list (no NextAuth / env / secrets).
 * Keep in sync with `providers/index.ts` order and ids.
 */
export const AUTH_PROVIDERS_UI = [
  {
    id: "google",
    nextAuthId: "google",
    labelKey: "providers.google",
  },
] as const satisfies readonly AuthProviderUi[];
