import { NextResponse } from "next/server";

import { readIconScoutPage, type IconScoutAsset } from "@/lib/iconscout";

const SEARCH_URL = "https://api.iconscout.com/v3/search";
const ASSETS = new Set<string>(["icon", "illustration", "3d"]);
const PER_PAGE = 36;
const TIMEOUT_MS = 12_000;

export async function GET(request: Request) {
  const clientId = process.env.ICONSCOUT_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json({ error: "Add ICONSCOUT_CLIENT_ID to the server environment" }, { status: 500 });
  }

  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  if (query.length < 2) {
    return NextResponse.json({ items: [], page: 1, lastPage: 1, total: 0 });
  }

  const asset = (ASSETS.has(params.get("asset") ?? "") ? params.get("asset") : "icon") as IconScoutAsset;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const url = new URL(SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("asset", asset);
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));

  try {
    const res = await fetch(url, {
      headers: {
        "Client-ID": clientId,
        Accept: "application/json",
        "User-Agent": "swibp/1.0",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const payload: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        payload && typeof payload === "object" && typeof (payload as { message?: unknown }).message === "string"
          ? (payload as { message: string }).message
          : "IconScout search failed";
      return NextResponse.json({ error: message }, { status: res.status });
    }
    return NextResponse.json(readIconScoutPage(payload));
  } catch (err) {
    console.error("iconscout search:", err);
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json(
      { error: timedOut ? "IconScout search timed out" : "Couldn't reach IconScout" },
      { status: 502 },
    );
  }
}
