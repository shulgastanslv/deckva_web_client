import axios, { AxiosHeaders, isAxiosError, type AxiosRequestConfig } from "axios";

/** Shared Axios instance for browser and server HTTP calls. */
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

async function payloadFromAxiosError(error: unknown): Promise<unknown> {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const text = await data.text().catch(() => "");
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { error: text };
    }
  }
  if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
    const text = new TextDecoder().decode(data);
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { error: text };
    }
  }
  return data ?? null;
}

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

/** Normalize Axios / network failures into a user-facing message. */
export async function httpErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (isTimeoutError(error)) return `${fallback} timed out`;

  if (isAxiosError(error)) {
    const fromPayload = readPayloadMessage(await payloadFromAxiosError(error));
    if (fromPayload) return fromPayload;
    if (!error.response) return "Couldn't reach the server";
    if (error.response.status) return `${fallback} (${error.response.status})`;
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export async function httpPostJson<T>(
  url: string,
  body: Record<string, unknown>,
  options?: {
    fallbackError?: string;
    timeoutMs?: number;
    headers?: AxiosRequestConfig["headers"];
    signal?: AbortSignal;
  },
): Promise<T> {
  const fallback = options?.fallbackError ?? "Request failed";
  try {
    const { data } = await http.post<T>(url, body, {
      timeout: options?.timeoutMs,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: options?.signal,
    });
    return data;
  } catch (error) {
    throw new Error(await httpErrorMessage(error, fallback));
  }
}

export async function httpPostForm<T>(
  url: string,
  form: FormData,
  options?: {
    fallbackError?: string;
    responseType?: "json" | "blob";
    timeoutMs?: number;
  },
): Promise<T> {
  const fallback = options?.fallbackError ?? "Request failed";
  try {
    const { data } = await http.post<T>(url, form, {
      timeout: options?.timeoutMs,
      responseType: options?.responseType === "blob" ? "blob" : "json",
    });
    return data;
  } catch (error) {
    throw new Error(await httpErrorMessage(error, fallback));
  }
}

export async function httpGetBlob(
  url: string,
  options?: { fallbackError?: string },
): Promise<Blob> {
  const fallback = options?.fallbackError ?? "Couldn't read the image";
  try {
    const { data } = await http.get<Blob>(url, { responseType: "blob" });
    return data;
  } catch (error) {
    throw new Error(await httpErrorMessage(error, fallback));
  }
}
