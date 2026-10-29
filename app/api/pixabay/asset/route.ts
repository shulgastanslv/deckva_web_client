import { NextResponse } from "next/server";

import {
  buildPixabaySearchUrl,
  bytesToDataUrl,
  downloadFirstPixabayBytes,
  isPixabayId,
  pixabayApiKey,
  pixabayFetchJson,
  readPixabayAsset,
  sanitizeIconSvg,
} from "@/lib/pixabay";

export async function POST(request: Request) {
  const key = pixabayApiKey();
  if (!key) {
    return NextResponse.json({ error: "Add PIXABAY_API_KEY to the server environment" }, { status: 500 });
  }

  let id = "";
  try {
    const body: unknown = await request.json();
    id =
      body && typeof body === "object" && typeof (body as { id?: unknown }).id === "string"
        ? (body as { id: string }).id.trim()
        : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!isPixabayId(id)) {
    return NextResponse.json({ error: "That Pixabay id isn't valid" }, { status: 400 });
  }

  try {
    const { res, payload } = await pixabayFetchJson(
      buildPixabaySearchUrl({
        key,
        query: "",
        page: 1,
        imageType: "all",
        id,
      }),
    );
    if (!res.ok) {
      const message =
        typeof payload === "string" && payload.trim()
          ? payload.trim().slice(0, 200)
          : res.status === 429
            ? "Pixabay rate limit exceeded — try again in a minute"
            : "Couldn't fetch Pixabay asset";
      return NextResponse.json({ error: message }, { status: res.status === 429 ? 429 : 502 });
    }

    const asset = readPixabayAsset(payload);
    if (!asset) {
      return NextResponse.json({ error: "Pixabay didn't return that asset" }, { status: 404 });
    }

    if (asset.vectorUrl) {
      try {
        const file = await downloadFirstPixabayBytes([asset.vectorUrl]);
        const text = Buffer.from(file.bytes).toString("utf8");
        const svg = sanitizeIconSvg(text);
        if (svg) {
          return NextResponse.json({ kind: "svg", svg, pageUrl: asset.pageUrl, name: asset.name });
        }
      } catch {
        // Free API keys usually have no vectorURL; fall through to raster.
      }
    }

    if (asset.imageUrls.length === 0) {
      return NextResponse.json({ error: "Pixabay didn't return a downloadable image" }, { status: 502 });
    }

    const file = await downloadFirstPixabayBytes(asset.imageUrls);
    const dataUrl = bytesToDataUrl(file.bytes, file.contentType);
    return NextResponse.json({ kind: "image", dataUrl, pageUrl: asset.pageUrl, name: asset.name });
  } catch (err) {
    console.error("pixabay asset:", err);
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    const message = err instanceof Error ? err.message : "Couldn't download the Pixabay asset";
    if (message.includes("429") || /rate limit/i.test(message)) {
      return NextResponse.json(
        { error: "Pixabay rate limit exceeded — try again in a minute" },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: timedOut ? "Pixabay download timed out" : "Couldn't download the Pixabay asset" },
      { status: 502 },
    );
  }
}
