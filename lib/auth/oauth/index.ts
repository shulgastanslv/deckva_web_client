export type {
  AuthProviderDefinition,
  AuthProviderId,
  AuthProviderUi,
  NextAuthProvider,
} from "@/lib/auth/oauth/types";
export { AUTH_PROVIDERS_UI } from "@/lib/auth/oauth/catalog";
export {
  getAuthProviderByNextAuthId,
  getConfiguredAuthProviders,
} from "@/lib/auth/oauth/registry";
export { linkOAuthAccount } from "@/lib/auth/oauth/link-account";
