const DEFAULT_AI_URL = "http://127.0.0.1:9000";

export function aiBaseUrl() {
  return (process.env.DECKVA_AI_URL?.trim() || DEFAULT_AI_URL).replace(/\/$/, "");
}

export function upstreamErrorMessage(
  payload: unknown,
  status: number,
  fallback: string,
): string {
  if (payload && typeof payload === "object") {
    const row = payload as { detail?: unknown; error?: unknown };
    if (typeof row.detail === "string" && row.detail.trim()) return row.detail;
    // FastAPI validation errors: { detail: [{ loc, msg, ... }, ...] }
    if (Array.isArray(row.detail) && row.detail.length > 0) {
      const parts = row.detail
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const entry = item as { loc?: unknown; msg?: unknown };
          const msg = typeof entry.msg === "string" ? entry.msg.trim() : "";
          if (!msg) return null;
          const loc = Array.isArray(entry.loc)
            ? entry.loc.filter((p) => typeof p === "string").join(".")
            : "";
          return loc ? `${loc}: ${msg}` : msg;
        })
        .filter((part): part is string => Boolean(part));
      if (parts.length > 0) return parts.join("; ");
    }
    if (typeof row.error === "string" && row.error.trim()) return row.error;
  }
  return `${fallback} (${status})`;
}

export async function fetchAiJson(
  path: string,
  body: Record<string, unknown>,
  options?: { timeoutMs?: number; label?: string },
): Promise<unknown> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const label = options?.label ?? "AI request";
  const url = `${aiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const timedOut =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    throw new Error(
      timedOut ? `${label} timed out` : "Couldn't reach the Deckva AI server",
    );
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    throw new Error(upstreamErrorMessage(payload, upstream.status, label));
  }
  if (!payload || typeof payload !== "object") {
    throw new Error(`${label} returned an empty response`);
  }
  return payload;
}
