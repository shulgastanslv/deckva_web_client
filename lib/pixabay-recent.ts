import type { PixabayHit, PixabayImageType } from "@/lib/pixabay";
import { isPixabayImageType } from "@/lib/pixabay";

export const RECENT_LIMIT = 24;
export const RECENT_PREVIEW = 6;
export const RECENT_STORAGE_KEY = "swibp.pixabay.recent";

export interface RecentIcon extends Pick<PixabayHit, "id" | "name" | "previewUrl" | "pageUrl"> {
  type: PixabayImageType;
}

export function rememberIcon(items: RecentIcon[], next: RecentIcon): RecentIcon[] {
  return [
    {
      id: next.id,
      name: next.name,
      previewUrl: next.previewUrl,
      pageUrl: next.pageUrl,
      type: next.type,
    },
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
      if (
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        typeof item.previewUrl !== "string" ||
        typeof item.pageUrl !== "string" ||
        typeof item.type !== "string" ||
        !isPixabayImageType(item.type)
      ) {
        continue;
      }
      items.push({
        id: item.id,
        name: item.name,
        previewUrl: item.previewUrl,
        pageUrl: item.pageUrl,
        type: item.type,
      });
    }
    return items.slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}
