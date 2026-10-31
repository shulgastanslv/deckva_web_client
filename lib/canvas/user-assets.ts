export const ASSETS_STORAGE_KEY = "deckva.user-assets";
export const ASSETS_LIMIT = 48;

export type UserAsset = {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
};

export function readUserAssets(raw: string | null): UserAsset[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: UserAsset[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const item = row as Record<string, unknown>;
      if (
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        typeof item.dataUrl !== "string" ||
        typeof item.createdAt !== "number"
      ) {
        continue;
      }
      items.push({
        id: item.id,
        name: item.name,
        dataUrl: item.dataUrl,
        createdAt: item.createdAt,
      });
    }
    return items.slice(0, ASSETS_LIMIT);
  } catch {
    return [];
  }
}

export function rememberAsset(items: UserAsset[], next: UserAsset): UserAsset[] {
  return [
    next,
    ...items.filter((item) => item.id !== next.id && item.dataUrl !== next.dataUrl),
  ].slice(0, ASSETS_LIMIT);
}

export function removeAsset(items: UserAsset[], id: string): UserAsset[] {
  return items.filter((item) => item.id !== id);
}
