/** Shared deckva-tools base URL for server-side callers. */

const DEFAULT_TOOLS_URL = "http://127.0.0.1:8000";

export function toolsBaseUrl() {
  return (process.env.DECKVA_TOOLS_URL?.trim() || DEFAULT_TOOLS_URL).replace(
    /\/$/,
    "",
  );
}
