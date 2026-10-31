/** In-memory cover stash for generate intents (data URLs are too large for sessionStorage). */
const covers = new Map<string, string>();

export function stashPendingCover(projectId: string, cover: string): void {
  const trimmed = cover.trim();
  if (!trimmed) {
    covers.delete(projectId);
    return;
  }
  covers.set(projectId, trimmed);
}

export function takePendingCover(projectId: string): string {
  const value = covers.get(projectId) ?? "";
  covers.delete(projectId);
  return value;
}

export function peekPendingCover(projectId: string): string {
  return covers.get(projectId) ?? "";
}
