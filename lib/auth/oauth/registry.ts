import { authProviderDefinitions } from "@/lib/auth/oauth/providers";
import type { AuthProviderDefinition } from "@/lib/auth/oauth/types";

/** Providers that have credentials and can be mounted in NextAuth. */
export function getConfiguredAuthProviders(): AuthProviderDefinition[] {
  return authProviderDefinitions.filter((provider) => provider.isConfigured());
}

export function getAuthProviderByNextAuthId(
  nextAuthId: string | undefined | null,
): AuthProviderDefinition | null {
  if (!nextAuthId) return null;
  return (
    authProviderDefinitions.find((p) => p.nextAuthId === nextAuthId) ?? null
  );
}
