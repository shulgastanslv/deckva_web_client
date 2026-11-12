import { connectorCallbackUrl } from "@/lib/connectors/oauth-state";

const THREADS_SCOPES = [
  "threads_basic",
  "threads_content_publish",
  "threads_manage_insights",
] as const;

function threadsAppId(): string {
  return (
    process.env.THREADS_APP_ID?.trim() ||
    process.env.FACEBOOK_APP_ID?.trim() ||
    ""
  );
}

function threadsAppSecret(): string {
  return (
    process.env.THREADS_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim() ||
    ""
  );
}

export function threadsConfigured(): boolean {
  return Boolean(threadsAppId() && threadsAppSecret());
}

export function threadsAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: threadsAppId(),
    redirect_uri: connectorCallbackUrl("threads"),
    scope: THREADS_SCOPES.join(","),
    response_type: "code",
    state,
  });
  return `https://threads.com/oauth/authorize?${params.toString()}`;
}

export type ThreadsTokenResponse = {
  access_token: string;
  user_id?: number | string;
  expires_in?: number;
};

export async function exchangeThreadsCode(
  code: string,
): Promise<ThreadsTokenResponse> {
  const cleanCode = code.replace(/#_$/, "");
  const body = new URLSearchParams({
    client_id: threadsAppId(),
    client_secret: threadsAppSecret(),
    grant_type: "authorization_code",
    redirect_uri: connectorCallbackUrl("threads"),
    code: cleanCode,
  });
  const res = await fetch("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Threads token exchange failed: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as ThreadsTokenResponse;
}

/** Exchange short-lived token for a long-lived one (≈60 days). */
export async function exchangeThreadsLongLived(
  shortLivedToken: string,
): Promise<ThreadsTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "th_exchange_token",
    client_secret: threadsAppSecret(),
    access_token: shortLivedToken,
  });
  const res = await fetch(
    `https://graph.threads.net/access_token?${params.toString()}`,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Threads long-lived exchange failed: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as ThreadsTokenResponse;
}

export async function fetchThreadsProfile(accessToken: string): Promise<{
  id: string;
  username?: string;
  name?: string;
  threads_profile_picture_url?: string;
}> {
  const params = new URLSearchParams({
    fields: "id,username,name,threads_profile_picture_url",
    access_token: accessToken,
  });
  const res = await fetch(`https://graph.threads.net/v1.0/me?${params}`);
  if (!res.ok) {
    throw new Error("Failed to load Threads profile");
  }
  const data = (await res.json()) as {
    id?: string;
    username?: string;
    name?: string;
    threads_profile_picture_url?: string;
  };
  if (!data.id) throw new Error("Threads profile missing id");
  return {
    id: data.id,
    username: data.username,
    name: data.name,
    threads_profile_picture_url: data.threads_profile_picture_url,
  };
}

/** Lightweight insights snapshot for the analytics panel. */
export async function fetchThreadsInsightsSummary(
  accessToken: string,
): Promise<{
  views?: number;
  likes?: number;
  replies?: number;
  reposts?: number;
  quotes?: number;
}> {
  const params = new URLSearchParams({
    metric: "views,likes,replies,reposts,quotes",
    access_token: accessToken,
  });
  const res = await fetch(
    `https://graph.threads.net/v1.0/me/threads_insights?${params}`,
  );
  if (!res.ok) {
    return {};
  }
  const data = (await res.json()) as {
    data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
  };
  const out: Record<string, number> = {};
  for (const row of data.data ?? []) {
    const name = row.name;
    const value = row.values?.[0]?.value;
    if (name && typeof value === "number") out[name] = value;
  }
  return {
    views: out.views,
    likes: out.likes,
    replies: out.replies,
    reposts: out.reposts,
    quotes: out.quotes,
  };
}

export function threadsScopes(): string[] {
  return [...THREADS_SCOPES];
}
