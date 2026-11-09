/** Recently used photos in Elements → Photos (persisted lightly in localStorage). */

export type RecentPhoto = {
  id: string;
  /** Display / place source (http URL or compact data URL thumb). */
  src: string;
  /** Original source used when placing (may equal src). */
  placeSrc: string;
  addedAt: number;
};

const KEY = "deckva.recent-photos";
const MAX = 12;
const MAX_STORE_CHARS = 180_000;
export const RECENT_PHOTOS_CHANGED = "deckva:recent-photos";

/** Full-resolution sources for the current tab (localStorage keeps thumbs). */
const sessionPlaceSrc = new Map<string, string>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readRecentPhotos(): RecentPhoto[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentPhoto[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.src === "string" &&
        typeof item.placeSrc === "string",
    );
  } catch {
    return [];
  }
}

function writeRecentPhotos(items: RecentPhoto[]) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Quota — drop oldest until it fits.
    let next = items.slice();
    while (next.length > 1) {
      next = next.slice(0, -1);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        break;
      } catch {
        /* keep trimming */
      }
    }
  }
  window.dispatchEvent(new Event(RECENT_PHOTOS_CHANGED));
}

function makeId(src: string) {
  return `rp_${Math.abs(hash(src)).toString(36)}_${Date.now().toString(36)}`;
}

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return h;
}

/** Shrink large data URLs so localStorage stays healthy. */
async function compactSrc(src: string): Promise<{ thumb: string; place: string }> {
  if (/^https?:\/\//i.test(src)) {
    return { thumb: src, place: src };
  }
  if (!src.startsWith("data:image/") || src.length < 24_000) {
    return { thumb: src, place: src };
  }

  try {
    const img = await loadImage(src);
    const maxEdge = 160;
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { thumb: src, place: src };
    ctx.drawImage(img, 0, 0, w, h);
    const thumb = canvas.toDataURL("image/jpeg", 0.72);
    // Keep full source for re-place when it still fits the store budget.
    const place = src.length <= MAX_STORE_CHARS ? src : thumb;
    return { thumb, place };
  } catch {
    return { thumb: src, place: src };
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

/** Prefer in-memory full source when available (same session after upload). */
export function resolveRecentPlaceSrc(item: RecentPhoto) {
  return sessionPlaceSrc.get(item.id) ?? item.placeSrc;
}

/** Record a photo after it was added to the canvas. */
export async function rememberRecentPhoto(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return readRecentPhotos();

  const { thumb, place } = await compactSrc(trimmed);
  const prev = readRecentPhotos().filter(
    (item) => item.placeSrc !== place && item.src !== thumb && item.src !== trimmed,
  );
  const id = makeId(place);
  sessionPlaceSrc.set(id, trimmed);
  const next: RecentPhoto[] = [
    {
      id,
      src: thumb,
      placeSrc: place,
      addedAt: Date.now(),
    },
    ...prev,
  ].slice(0, MAX);

  writeRecentPhotos(next);
  return next;
}

export function clearRecentPhotos() {
  sessionPlaceSrc.clear();
  writeRecentPhotos([]);
}
