import axios, { AxiosHeaders, isAxiosError } from "axios";

/** Shared Axios instance for server → upstream HTTP (AI, tools, billing). */
export const http = axios.create({
  timeout: 120_000,
  headers: {
    Accept: "application/json",
  },
});

http.interceptors.request.use((config) => {
  // Let the runtime set multipart boundaries for FormData bodies.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
      delete (config.headers as Record<string, unknown>)["content-type"];
    }
  }
  return config;
});

export function isTimeoutError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    (error.code === "ECONNABORTED" ||
      error.code === "ERR_CANCELED" ||
      error.name === "CanceledError" ||
      error.name === "AbortError" ||
      error.name === "TimeoutError")
  );
}

function readPayloadMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as {
    error?: unknown;
    detail?: unknown;
    message?: unknown;
  };
  if (typeof row.error === "string" && row.error.trim()) return row.error;
  if (typeof row.message === "string" && row.message.trim()) return row.message;
  if (typeof row.detail === "string" && row.detail.trim()) return row.detail;
  return null;
}

/** Normalize Axios / network failures into a user-facing message. */
export async function httpErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (isTimeoutError(error)) return `${fallback} timed out`;

  if (isAxiosError(error)) {
    const fromPayload = readPayloadMessage(error.response?.data);
    if (fromPayload) return fromPayload;
    if (!error.response) return "Couldn't reach the server";
    if (error.response.status) return `${fallback} (${error.response.status})`;
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
