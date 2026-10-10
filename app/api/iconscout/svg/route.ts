import { NextResponse } from "next/server";

import {
  isIconScoutUrl,
  isIconScoutUuid,
  readIconScoutDownloadUrl,
  sanitizeIconSvg,
} from "@/lib/iconscout";

const TIMEOUT_MS = 15_000;

export async function POST(request: Request) {
  const clientId = process.env.ICONSCOUT_CLIENT_ID?.trim();
  const secret = process.env.ICONSCOUT_API_KEY?.trim();
  if (!clientId || !secret) {
    return NextResponse.json({ error: "Add ICONSCOUT_API_KEY to the server environment" }, { status: 500 });
  }

  let uuid = "";
  try {
    const body: unknown = await request.json();
    uuid =
      body && typeof body === "object" && typeof (body as { uuid?: unknown }).uuid === "string"
        ? (body as { uuid: string }).uuid
        : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!isIconScoutUuid(uuid)) {
    return NextResponse.json({ error: "That icon id isn't valid" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.iconscout.com/v3/items/${uuid}/api-download`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Client-ID": clientId,
        "Client-Secret": secret,
        "User-Agent": "swibp/1.0",
      },
      body: JSON.stringify({ format: "svg" }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const payload: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const reason =
        payload && typeof payload === "object"
          ? (payload as { data?: { reason?: unknown } }).data?.reason
          : null;
      if (reason === "subscription_required" || reason === "asset_not_covered") {
        return NextResponse.json(
          { error: "This IconScout app can't download SVGs (subscription_required)" },
          { status: 402 },
        );
      }
      if (reason === "credit_limit_reached" || reason === "quota_exhausted") {
        return NextResponse.json({ error: "IconScout download limit reached" }, { status: 402 });
      }
      return NextResponse.json({ error: "Couldn't download the SVG" }, { status: res.status });
    }

    const downloadUrl = readIconScoutDownloadUrl(payload);
    if (!downloadUrl) {
      return NextResponse.json({ error: "IconScout didn't return an SVG" }, { status: 502 });
    }

    const file = await fetch(downloadUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "swibp/1.0" },
    });
    if (!file.ok || !isIconScoutUrl(file.url)) {
      return NextResponse.json({ error: "Couldn't download the SVG" }, { status: 502 });
    }

    const svg = sanitizeIconSvg(await file.text());
    if (!svg) {
      return NextResponse.json({ error: "IconScout didn't return an SVG" }, { status: 502 });
    }

    return NextResponse.json({ svg });
  } catch (err) {
    console.error("iconscout svg:", err);
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json(
      { error: timedOut ? "IconScout download timed out" : "Couldn't download the SVG" },
      { status: 502 },
    );
  }
}
