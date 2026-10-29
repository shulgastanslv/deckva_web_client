const SEARCH_URL = "https://pixabay.com/api/";
const PER_PAGE = 24;
const TIMEOUT_MS = 15_000;
/** Pixabay asks clients to cache API responses for 24h. */
const CACHE_SECONDS = 86_400;

export type PixabayImageType = "vector" | "illustration" | "photo";

export interface PixabayHit {
  id: string;
  name: string;
  previewUrl: string;
  pageUrl: string;
  type: PixabayImageType | "all";
}

export interface PixabayPage {
  items: PixabayHit[];
  page: number;
  lastPage: number;
  total: number;
}

export interface PixabayAssetUrls {
  id: string;
  name: string;
  pageUrl: string;
  previewUrl: string;
  vectorUrl: string | null;
  /** Preferred download candidates (CDN first; get/ URLs last — they rate-limit). */
  imageUrls: string[];
}

const IMAGE_TYPES = new Set<string>(["vector", "illustration", "photo"]);

export function isPixabayImageType(value: string): value is PixabayImageType {
  return IMAGE_TYPES.has(value);
}

export function isPixabayId(value: string): boolean {
  return /^\d{1,12}$/.test(value);
}

export function isPixabayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    return host === "pixabay.com" || host.endsWith(".pixabay.com");
  } catch {
    return false;
  }
}

export function pixabayApiKey(): string {
  return process.env.PIXABAY_API_KEY?.trim() ?? "";
}

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function nameFromTags(tags: string | null, id: string): string {
  if (!tags) return `Pixabay ${id}`;
  const first = tags
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);
  if (!first) return `Pixabay ${id}`;
  return first.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function readType(value: unknown): PixabayImageType | "all" {
  return typeof value === "string" && isPixabayImageType(value) ? value : "all";
}

function readHit(row: Record<string, unknown>): PixabayHit | null {
  const idValue = row.id;
  const id =
    typeof idValue === "number" && Number.isFinite(idValue)
      ? String(Math.trunc(idValue))
      : typeof idValue === "string" && isPixabayId(idValue.trim())
        ? idValue.trim()
        : null;
  if (!id) return null;

  const previewUrl = readString(row.previewURL, row.webformatURL);
  if (!previewUrl || !isPixabayUrl(previewUrl)) return null;

  const pageUrl = readString(row.pageURL) ?? `https://pixabay.com/`;
  const tags = readString(row.tags);
  return {
    id,
    name: nameFromTags(tags, id),
    previewUrl,
    pageUrl: isPixabayUrl(pageUrl) ? pageUrl : "https://pixabay.com/",
    type: readType(row.type),
  };
}

/** Prefer stable CDN sizes over pixabay.com/get/* (those 429 under server download). */
export function cdnSizeVariants(previewUrl: string): string[] {
  if (!isPixabayUrl(previewUrl) || !previewUrl.includes("cdn.pixabay.com")) return [];
  const variants: string[] = [];
  for (const size of ["_1280", "_640", "_150"] as const) {
    const next = previewUrl.replace(/_(?:150|180|340|640|960|1280)(\.[a-z0-9]+)$/i, `${size}$1`);
    if (isPixabayUrl(next) && !variants.includes(next)) variants.push(next);
  }
  if (!variants.includes(previewUrl)) variants.push(previewUrl);
  return variants;
}

function uniqueUrls(...values: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (!value || !isPixabayUrl(value) || out.includes(value)) continue;
    out.push(value);
  }
  return out;
}

function readAssetUrls(row: Record<string, unknown>): PixabayAssetUrls | null {
  const hit = readHit(row);
  if (!hit) return null;

  const vectorUrl = readString(row.vectorURL);
  const large = readString(row.largeImageURL);
  const web = readString(row.webformatURL);
  const preview = readString(row.previewURL) ?? hit.previewUrl;

  return {
    id: hit.id,
    name: hit.name,
    pageUrl: hit.pageUrl,
    previewUrl: hit.previewUrl,
    vectorUrl: vectorUrl && isPixabayUrl(vectorUrl) ? vectorUrl : null,
    imageUrls: uniqueUrls(...cdnSizeVariants(preview), large, web, preview),
  };
}

export function readPixabayPage(payload: unknown, page: number, perPage: number): PixabayPage {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const rows = Array.isArray(root.hits) ? root.hits : [];
  const items: PixabayHit[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const hit = readHit(row as Record<string, unknown>);
    if (hit) items.push(hit);
  }

  const totalHits =
    typeof root.totalHits === "number" && Number.isFinite(root.totalHits)
      ? Math.max(0, Math.floor(root.totalHits))
      : items.length;
  const lastPage = Math.max(1, Math.ceil(totalHits / Math.max(1, perPage)));

  return {
    items,
    page: Math.max(1, page),
    lastPage,
    total: totalHits,
  };
}

export function readPixabayAsset(payload: unknown): PixabayAssetUrls | null {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const rows = Array.isArray(root.hits) ? root.hits : [];
  const row = rows[0];
  if (!row || typeof row !== "object") return null;
  return readAssetUrls(row as Record<string, unknown>);
}

export function sanitizeIconSvg(source: string): string | null {
  const text = source.trim();
  if (!text.includes("<svg") || text.length > 2_000_000) return null;
  const cleaned = text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");
  return cleaned.includes("<svg") ? cleaned : null;
}

export function buildPixabaySearchUrl(options: {
  key: string;
  query: string;
  page: number;
  imageType: PixabayImageType | "all";
  order?: "popular" | "latest";
  id?: string;
  perPage?: number;
}): string {
  const params = new URLSearchParams();
  params.set("key", options.key);
  params.set("safesearch", "true");
  params.set("per_page", String(options.perPage ?? PER_PAGE));
  params.set("page", String(Math.max(1, options.page)));
  params.set("image_type", options.imageType);
  params.set("order", options.order ?? "popular");
  if (options.id) {
    params.set("id", options.id);
  } else if (options.query.trim()) {
    params.set("q", options.query.trim().slice(0, 100));
  }
  return `${SEARCH_URL}?${params.toString()}`;
}

export async function pixabayFetchJson(url: string, signal?: AbortSignal): Promise<{ res: Response; payload: unknown }> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "deckva/1.0",
    },
    // Cache search/id lookups for 24h per Pixabay API guidance.
    next: { revalidate: CACHE_SECONDS },
    signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { res, payload: text || null };
  }

  const payload: unknown = await res.json().catch(() => null);
  return { res, payload };
}

export async function downloadPixabayBytes(
  url: string,
  signal?: AbortSignal,
): Promise<{ bytes: ArrayBuffer; contentType: string; finalUrl: string }> {
  if (!isPixabayUrl(url)) {
    throw new Error("Invalid Pixabay URL");
  }
  const res = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: "https://pixabay.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
    redirect: "follow",
    signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });
  // Followed redirects may leave pixabay hosts; keep the original allowlist on the request URL.
  if (!res.ok) {
    throw new Error(`Pixabay download failed (${res.status})`);
  }
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  if (!contentType.startsWith("image/") && !contentType.includes("svg") && !contentType.includes("octet-stream")) {
    throw new Error("Pixabay didn't return an image");
  }
  return {
    bytes: await res.arrayBuffer(),
    contentType,
    finalUrl: res.url,
  };
}

/** Try each candidate until one downloads; surfaces the last error. */
export async function downloadFirstPixabayBytes(
  urls: string[],
  signal?: AbortSignal,
): Promise<{ bytes: ArrayBuffer; contentType: string; finalUrl: string }> {
  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      return await downloadPixabayBytes(url, signal);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Couldn't download Pixabay asset");
    }
  }
  throw lastError ?? new Error("Couldn't download Pixabay asset");
}

export function bytesToDataUrl(bytes: ArrayBuffer, contentType: string): string {
  const type = contentType.split(";")[0]?.trim() || "application/octet-stream";
  return `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
}

export { PER_PAGE as PIXABAY_PER_PAGE, TIMEOUT_MS as PIXABAY_TIMEOUT_MS, CACHE_SECONDS as PIXABAY_CACHE_SECONDS };
