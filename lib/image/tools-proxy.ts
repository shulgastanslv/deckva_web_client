import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

import { http, isTimeoutError } from "@/lib/api/http";

const DEFAULT_TOOLS_URL = "http://127.0.0.1:8000";
const TIMEOUT_MS = 180_000;

export function toolsBaseUrl() {
  return (process.env.DECKVA_TOOLS_URL?.trim() || DEFAULT_TOOLS_URL).replace(/\/$/, "");
}

function errorDetail(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }
  return `Tool failed (${status})`;
}

function decodeErrorPayload(data: unknown): unknown {
  if (data && typeof data === "object" && !(data instanceof ArrayBuffer)) {
    return data;
  }
  if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
    try {
      return JSON.parse(new TextDecoder().decode(data)) as unknown;
    } catch {
      return null;
    }
  }
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
    try {
      return JSON.parse(data.toString("utf8")) as unknown;
    } catch {
      return null;
    }
  }
  return null;
}

export async function proxyToolsRequest(
  path: string,
  form: FormData,
  options?: { expect: "image" | "json" },
): Promise<Response> {
  const expect = options?.expect ?? "image";
  const url = `${toolsBaseUrl()}${path}`;

  try {
    const response = await http.post(url, form, {
      timeout: TIMEOUT_MS,
      responseType: expect === "json" ? "json" : "arraybuffer",
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        { error: errorDetail(decodeErrorPayload(response.data), response.status) },
        { status: response.status },
      );
    }

    if (expect === "json") {
      return NextResponse.json(response.data);
    }

    const contentType =
      (response.headers["content-type"] as string | undefined) || "image/png";
    return new NextResponse(response.data as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(`deckva-tools ${path}:`, err);
    const timedOut = isTimeoutError(err);
    const unreachable = isAxiosError(err) && !err.response;
    return NextResponse.json(
      {
        error: timedOut
          ? "Image tool timed out"
          : unreachable
            ? "Couldn't reach deckva-tools"
            : "Image tool request failed",
      },
      { status: 502 },
    );
  }
}

export function requireFile(form: FormData): File | Blob | NextResponse {
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  return file;
}
