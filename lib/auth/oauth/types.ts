import type { AuthOptions, Profile } from "next-auth";

/**
 * Stable ids for sign-in connectors.
 * Add a new id here when wiring another OAuth app (GitHub, Apple, …).
 */
export type AuthProviderId = "google";

/** NextAuth provider instance mounted in `authOptions.providers`. */
export type NextAuthProvider = NonNullable<AuthOptions["providers"]>[number];

export type AuthProviderDefinition = {
  id: AuthProviderId;
  /** Value passed to `signIn(nextAuthId)` / NextAuth `account.provider`. */
  nextAuthId: string;
  /** i18n key under `dialogs.auth` for the CTA label. */
  labelKey: `providers.${AuthProviderId}`;
  /** True when client id/secret (or equivalent) are present. */
  isConfigured: () => boolean;
  /** Build the NextAuth provider instance. */
  createProvider: () => NextAuthProvider;
  /**
   * Return a normalized email the IdP has verified, or `null` to deny sign-in.
   * Keep provider-specific trust rules here — not in auth-options callbacks.
   */
  resolveEmail: (profile: Profile | undefined) => string | null;
};

/** Client-safe slice used by the auth modal (no secrets / provider factories). */
export type AuthProviderUi = {
  id: AuthProviderId;
  nextAuthId: string;
  labelKey: `providers.${AuthProviderId}`;
};
