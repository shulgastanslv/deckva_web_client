import { googleAuthProvider } from "@/lib/auth/oauth/providers/google";
import type { AuthProviderDefinition } from "@/lib/auth/oauth/types";

/**
 * Register sign-in connectors here.
 * Order = button order in the auth modal.
 *
 * To add GitHub later:
 * 1. Create `providers/github.ts` (same shape as google)
 * 2. Append it to this list
 * 3. Add `dialogs.auth.providers.github` i18n + icon in `oauth-icons.tsx`
 */
export const authProviderDefinitions: AuthProviderDefinition[] = [
  googleAuthProvider,
];
