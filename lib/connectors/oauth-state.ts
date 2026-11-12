import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import type { ConnectorProviderId } from "@/lib/connectors/types";

type OAuthStatePayload = {
  userId: string;
  provider: ConnectorProviderId;
  nonce: string;
  exp: number;
};

function secret(): string {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "deckva-dev-secret";
}

export function signOAuthState(input: {
  userId: string;
  provider: ConnectorProviderId;
}): string {
  const payload: OAuthStatePayload = {
    userId: input.userId,
    provider: input.provider,
    nonce: randomBytes(16).toString("base64url"),
    exp: Date.now() + 15 * 60_000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyOAuthState(
  state: string,
): OAuthStatePayload | null {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as OAuthStatePayload;
    if (!payload?.userId || !payload?.provider || !payload?.exp) return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function appBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function connectorCallbackUrl(provider: ConnectorProviderId): string {
  return `${appBaseUrl()}/api/connectors/${provider}/callback`;
}
