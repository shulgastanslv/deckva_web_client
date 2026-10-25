import { NextResponse } from "next/server";

const DEFAULT_TOOLS_URL = "http://127.0.0.1:8000";
const TIMEOUT_MS = 180_000;

export function toolsBaseUrl() {
  return (process.env.DECKVA_TOOLS_URL?.trim() || DEFAULT_TOOLS_URL).replace(/\/$/, "");
}

export async function proxyToolsRequest(
  path: string,
  form: FormData,
  options?: { expect: "image" | "json" },
): Promise<Response> {
  const expect = options?.expect ?? "image";
  const url = `${toolsBaseUrl()}${path}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    console.error(`deckva-tools ${path}:`, err);
    const timedOut =
      err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json(
      { error: timedOut ? "Image tool timed out" : "Couldn't reach deckva-tools" },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const payload: unknown = await upstream.json().catch(() => null);
    const detail =
      payload &&
      typeof payload === "object" &&
      typeof (payload as { detail?: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : `Tool failed (${upstream.status})`;
    return NextResponse.json({ error: detail }, { status: upstream.status });
  }

  if (expect === "json") {
    const payload = await upstream.json();
    return NextResponse.json(payload);
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "image/png",
      "Cache-Control": "no-store",
    },
  });
}

export function requireFile(form: FormData): File | Blob | NextResponse {
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  return file;
}
