export function formatBoardDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function studioGreeting(name?: string | null) {
  const first =
    name?.trim().split(/\s+/)[0] || name?.trim() || "there";
  return `Hello , ${first}`;
}
