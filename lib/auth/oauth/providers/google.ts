import GoogleProvider from "next-auth/providers/google";
import type { Profile } from "next-auth";

import { isValidEmail, normalizeEmail } from "@/lib/email-address";
import type { AuthProviderDefinition } from "@/lib/auth/oauth/types";

function resolveGoogleEmail(profile: Profile | undefined): string | null {
  if (!profile || typeof profile.email !== "string") return null;
  const verified =
    (profile as { email_verified?: unknown }).email_verified === true;
  if (!verified) return null;
  const email = normalizeEmail(profile.email);
  return isValidEmail(email) ? email : null;
}

export const googleAuthProvider: AuthProviderDefinition = {
  id: "google",
  nextAuthId: "google",
  labelKey: "providers.google",
  isConfigured: () =>
    Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim(),
    ),
  createProvider: () =>
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  resolveEmail: resolveGoogleEmail,
};
