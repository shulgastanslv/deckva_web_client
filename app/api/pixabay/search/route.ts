import { NextResponse } from "next/server";

import {
  buildPixabaySearchUrl,
  isPixabayImageType,
  pixabayApiKey,
  pixabayFetchJson,
  readPixabayPage,
  type PixabayImageType,
  PIXABAY_PER_PAGE,
} from "@/lib/pixabay";

export async function GET(request: Request) {
  const key = pixabayApiKey();
  if (!key) {
    return NextResponse.json({ error: "Add PIXABAY_API_KEY to the server environment" }, { status: 500 });
  }

  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const rawType = params.get("type") ?? "vector";
  const imageType: PixabayImageType = isPixabayImageType(rawType) ? rawType : "vector";
  const order = params.get("order") === "latest" ? "latest" : "popular";

  try {
    const { res, payload } = await pixabayFetchJson(
      buildPixabaySearchUrl({ key, query, page, imageType, order }),
    );
    if (!res.ok) {
      const message =
        typeof payload === "string" && payload.trim()
          ? payload.trim().slice(0, 200)
          : res.status === 429
            ? "Pixabay rate limit exceeded"
            : "Pixabay search failed";
      return NextResponse.json({ error: message }, { status: res.status === 429 ? 429 : 502 });
    }

    return NextResponse.json(readPixabayPage(payload, page, PIXABAY_PER_PAGE));
  } catch (err) {
    console.error("pixabay search:", err);
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json(
      { error: timedOut ? "Pixabay search timed out" : "Couldn't reach Pixabay" },
      { status: 502 },
    );
  }
}
