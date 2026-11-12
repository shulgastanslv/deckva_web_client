import { NextResponse } from "next/server";

import { googleDriveAuthUrl, googleDriveConfigured } from "@/lib/connectors/google-drive";
import { isConnectorProviderId } from "@/lib/connectors/map";
import {
  appBaseUrl,
  signOAuthState,
} from "@/lib/connectors/oauth-state";
import { threadsAuthUrl, threadsConfigured } from "@/lib/connectors/threads";
import type { ConnectorProviderId } from "@/lib/connectors/types";
import { getUserId } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await context.params;
  if (!isConnectorProviderId(raw)) {
    return NextResponse.redirect(
      `${appBaseUrl()}/studio/connectors?error=unknown_provider`,
    );
  }
  const provider = raw as ConnectorProviderId;

  const userId = await getUserId();
  if (!userId) {
    const callback = encodeURIComponent(`/api/connectors/${provider}/connect`);
    return NextResponse.redirect(
      `${appBaseUrl()}/?auth=1&callbackUrl=${callback}`,
    );
  }

  if (provider === "google-drive" && !googleDriveConfigured()) {
    return NextResponse.redirect(
      `${appBaseUrl()}/studio/connectors?error=google_not_configured`,
    );
  }
  if (provider === "threads" && !threadsConfigured()) {
    return NextResponse.redirect(
      `${appBaseUrl()}/studio/connectors?error=threads_not_configured`,
    );
  }

  const state = signOAuthState({ userId, provider });
  const url =
    provider === "threads" ? threadsAuthUrl(state) : googleDriveAuthUrl(state);

  return NextResponse.redirect(url);
}
