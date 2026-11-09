import { http, httpErrorMessage, isTimeoutError } from "@/lib/api/http";
import { isAxiosError } from "axios";

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
  if (status === 402) return "Upgrade to Pro to keep generating";
  return `${fallback} (${status})`;
}

function aiUrl(path: string) {
  return `${aiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

async function throwUpstream(
  error: unknown,
  label: string,
): Promise<never> {
  if (error instanceof Error && error.message.includes("returned an empty response")) {
    throw error;
  }
  if (isTimeoutError(error)) {
    throw new Error(`${label} timed out`);
  }
  if (isAxiosError(error)) {
    if (!error.response) {
      throw new Error("Couldn't reach the Deckva AI server");
    }
    throw new Error(
      upstreamErrorMessage(error.response.data, error.response.status, label),
    );
  }
  throw new Error(await httpErrorMessage(error, label));
}

export async function fetchAiJson(
  path: string,
  body: Record<string, unknown>,
  options?: { timeoutMs?: number; label?: string },
): Promise<unknown> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const label = options?.label ?? "AI request";

  try {
    const { data } = await http.post(aiUrl(path), body, {
      timeout: timeoutMs,
      headers: { "Content-Type": "application/json" },
    });
    if (!data || typeof data !== "object") {
      throw new Error(`${label} returned an empty response`);
    }
    return data;
  } catch (error) {
    return throwUpstream(error, label);
  }
}

export async function fetchAiGet(
  path: string,
  options?: { timeoutMs?: number; label?: string; params?: Record<string, string | number> },
): Promise<unknown> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const label = options?.label ?? "AI request";

  try {
    const { data } = await http.get(aiUrl(path), {
      timeout: timeoutMs,
      params: options?.params,
    });
    if (!data || typeof data !== "object") {
      throw new Error(`${label} returned an empty response`);
    }
    return data;
  } catch (error) {
    return throwUpstream(error, label);
  }
}
