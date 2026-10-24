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

export function studioGreeting(_name?: string | null) {
  return "New carousel";
}
