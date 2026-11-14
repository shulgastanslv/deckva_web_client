/**
 * In-memory media for generate intents (data URLs are too large for sessionStorage).
 * Text seed stays on the intent; images live here until the editor takes them.
 */

export type PendingGenerateMedia = {
  /** First / cover image data URL. */
  cover: string;
  /** All image data URLs in attach order (cover first when present). */
  images: string[];
  /** Concatenated text attachments for CORA seedText. */
  seedText: string;
};

const media = new Map<string, PendingGenerateMedia>();

export function stashPendingMedia(
  projectId: string,
  next: PendingGenerateMedia,
): void {
  const cover = next.cover.trim();
  const images = next.images.map((u) => u.trim()).filter(Boolean);
  const seedText = next.seedText.trim();
  if (!cover && images.length === 0 && !seedText) {
    media.delete(projectId);
    return;
  }
  media.set(projectId, {
    cover,
    images: images.length > 0 ? images : cover ? [cover] : [],
    seedText,
  });
}

export function takePendingMedia(projectId: string): PendingGenerateMedia {
  const value = media.get(projectId) ?? {
    cover: "",
    images: [],
    seedText: "",
  };
  media.delete(projectId);
  return value;
}

export function peekPendingMedia(projectId: string): PendingGenerateMedia {
  return (
    media.get(projectId) ?? {
      cover: "",
      images: [],
      seedText: "",
    }
  );
}
