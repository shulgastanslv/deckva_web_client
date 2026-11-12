export type ParsedFigmaUrl = {
  fileKey: string;
  nodeId: string | null;
};

/** Accepts design/file/proto/board links and bare file keys. */
export function parseFigmaUrl(input: string): ParsedFigmaUrl | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9]{10,}$/.test(raw) && !raw.includes("/")) {
    return { fileKey: raw, nodeId: null };
  }

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host !== "figma.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  // /design/:key/... | /file/:key/... | /proto/:key/... | /board/:key/...
  const kind = parts[0];
  const key = parts[1];
  if (
    !key ||
    !["design", "file", "proto", "board", "slides"].includes(kind ?? "")
  ) {
    return null;
  }

  const nodeParam =
    url.searchParams.get("node-id") || url.searchParams.get("nodeId");
  const nodeId = nodeParam ? normalizeFigmaNodeId(nodeParam) : null;

  return { fileKey: key, nodeId };
}

/** Figma URLs use `1-2`; the REST API expects `1:2`. */
export function normalizeFigmaNodeId(id: string): string {
  return id.trim().replace(/-/g, ":");
}

export function figmaNodeIdToUrlParam(id: string): string {
  return id.replace(/:/g, "-");
}
