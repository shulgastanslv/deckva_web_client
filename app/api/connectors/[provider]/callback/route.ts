import { NextResponse } from "next/server";

import {
  exchangeGoogleDriveCode,
  fetchGoogleDriveProfile,
  googleDriveScopes,
} from "@/lib/connectors/google-drive";
import { isConnectorProviderId } from "@/lib/connectors/map";
import {
  appBaseUrl,
  verifyOAuthState,
} from "@/lib/connectors/oauth-state";
import { recordConnectorEvent, upsertConnectedAccount } from "@/lib/connectors/store";
import type { ConnectorProviderId } from "@/lib/connectors/types";

function redirectResult(
  provider: ConnectorProviderId,
  status: "connected" | "error",
  detail?: string,
) {
  const params = new URLSearchParams({
    provider,
    status,
  });
  if (detail) params.set("detail", detail);
  return NextResponse.redirect(
    `${appBaseUrl()}/studio/connectors?${params.toString()}`,
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await context.params;
  if (!isConnectorProviderId(raw)) {
    return NextResponse.redirect(
      `${appBaseUrl()}/studio/connectors?error=unknown_provider`,
    );
  }
  const provider = raw as ConnectorProviderId;
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error) {
    return redirectResult(provider, "error", error);
  }
  if (!code || !state) {
    return redirectResult(provider, "error", "missing_code");
  }

  const payload = verifyOAuthState(state);
  if (!payload || payload.provider !== provider) {
    return redirectResult(provider, "error", "invalid_state");
  }

  try {
    const tokens = await exchangeGoogleDriveCode(code);
    const profile = await fetchGoogleDriveProfile(tokens.access_token);
    await upsertConnectedAccount({
      userId: payload.userId,
      provider,
      externalAccountId: profile.id,
      displayName: profile.name || profile.email || profile.id,
      avatarUrl: profile.picture ?? null,
      scopes: tokens.scope?.split(/\s+/).filter(Boolean) ?? googleDriveScopes(),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresInSeconds: tokens.expires_in ?? null,
      metadata: { email: profile.email },
    });
    return redirectResult(provider, "connected");
  } catch (err) {
    console.error(`connector callback ${provider}:`, err);
    await recordConnectorEvent({
      userId: payload.userId,
      provider,
      kind: "ERROR",
      label: err instanceof Error ? err.message.slice(0, 120) : "OAuth failed",
    }).catch(() => undefined);
    return redirectResult(provider, "error", "oauth_failed");
  }
}
