import dns from "node:dns";

/** IconScout's IPv6 path hangs from some networks; prefer IPv4. */
dns.setDefaultResultOrder("ipv4first");

const PREVIEW_KEYS = ["png_256", "png_128", "png_512", "png_64", "thumb"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type IconScoutAsset = "icon" | "illustration" | "3d";

export interface IconScoutHit {
  id: string;
  name: string;
  previewUrl: string;
}

export interface IconScoutPage {
  items: IconScoutHit[];
  page: number;
  lastPage: number;
  total: number;
}

export function isIconScoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "iconscout.com" || url.hostname.endsWith(".iconscout.com"));
  } catch {
    return false;
  }
}

export function isIconScoutUuid(value: string): boolean {
  return UUID.test(value);
}

function previewOf(item: Record<string, unknown>): string | null {
  const urls = item.urls && typeof item.urls === "object" ? (item.urls as Record<string, unknown>) : {};
  for (const key of PREVIEW_KEYS) {
    const value = urls[key];
    if (typeof value === "string" && isIconScoutUrl(value)) return value;
  }
  if (typeof item.image === "string" && isIconScoutUrl(item.image)) return item.image;
  return null;
}

function pageNumber(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) && number >= 1 ? Math.floor(number) : fallback;
}

export function readIconScoutPage(payload: unknown): IconScoutPage {
  const response =
    payload && typeof payload === "object" ? (payload as { response?: unknown }).response : null;
  const itemsNode =
    response && typeof response === "object" ? (response as { items?: unknown }).items : null;

  const rows = Array.isArray(itemsNode)
    ? itemsNode
    : itemsNode && typeof itemsNode === "object" && Array.isArray((itemsNode as { data?: unknown }).data)
      ? (itemsNode as { data: unknown[] }).data
      : [];

  const items: IconScoutHit[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = typeof item.uuid === "string" ? item.uuid : "";
    const previewUrl = previewOf(item);
    if (!id || !previewUrl) continue;
    const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Asset";
    items.push({ id, name, previewUrl });
  }

  const meta = itemsNode && typeof itemsNode === "object" ? (itemsNode as Record<string, unknown>) : {};
  const page = pageNumber(meta.current_page, 1);
  return {
    items,
    page,
    lastPage: pageNumber(meta.last_page, page),
    total: pageNumber(meta.total, items.length),
  };
}

export function readIconScoutDownloadUrl(payload: unknown): string | null {
  const response =
    payload && typeof payload === "object" ? (payload as { response?: unknown }).response : null;
  const download =
    response && typeof response === "object" ? (response as { download?: unknown }).download : null;
  const url =
    download && typeof download === "object" ? (download as { download_url?: unknown }).download_url : null;
  return typeof url === "string" && isIconScoutUrl(url) ? url : null;
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

export function readIconScoutHits(payload: unknown): IconScoutHit[] {
  return readIconScoutPage(payload).items;
}
