import type { IconScoutAsset, IconScoutHit } from "@/lib/iconscout";

export const RECENT_LIMIT = 24;
export const RECENT_PREVIEW = 6;
export const RECENT_STORAGE_KEY = "swibp.iconscout.recent";

const ASSETS = new Set<string>(["icon", "illustration", "3d"]);

export interface RecentIcon extends IconScoutHit {
  asset: IconScoutAsset;
}

export function rememberIcon(items: RecentIcon[], next: RecentIcon): RecentIcon[] {
  return [
    { id: next.id, name: next.name, previewUrl: next.previewUrl, asset: next.asset },
    ...items.filter((item) => item.id !== next.id),
  ].slice(0, RECENT_LIMIT);
}

export function readRecentIcons(raw: string | null): RecentIcon[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: RecentIcon[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const item = row as Record<string, unknown>;
      if (typeof item.id !== "string" || typeof item.name !== "string" || typeof item.previewUrl !== "string") {
        continue;
      }
      if (typeof item.asset !== "string" || !ASSETS.has(item.asset)) continue;
      items.push({
        id: item.id,
        name: item.name,
        previewUrl: item.previewUrl,
        asset: item.asset as IconScoutAsset,
      });
    }
    return items.slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}
