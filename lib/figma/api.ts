import { normalizeFigmaNodeId } from "@/lib/figma/url";

const FIGMA_API = "https://api.figma.com/v1";

export type FigmaFrameNode = {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnailUrl?: string | null;
};

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  children?: FigmaNode[];
};

type FigmaFileResponse = {
  name: string;
  document: FigmaNode;
  err?: string;
};

type FigmaImagesResponse = {
  err?: string;
  images: Record<string, string | null>;
};

async function figmaFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${FIGMA_API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "X-Figma-Token": token,
    },
    cache: "no-store",
  });

  if (res.status === 403 || res.status === 401) {
    throw new Error("FIGMA_UNAUTHORIZED");
  }
  if (res.status === 404) {
    throw new Error("FIGMA_NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error(`FIGMA_HTTP_${res.status}`);
  }

  return (await res.json()) as T;
}

function collectFrames(
  node: FigmaNode,
  out: FigmaFrameNode[],
  depth: number,
): void {
  const box = node.absoluteBoundingBox;
  const isFrame =
    node.type === "FRAME" ||
    node.type === "COMPONENT" ||
    node.type === "COMPONENT_SET" ||
    (node.type === "GROUP" && depth <= 1);

  if (isFrame && box && box.width > 0 && box.height > 0) {
    // Prefer top-level frames; still collect nested FRAME only one level deep under PAGE.
    if (node.type === "FRAME" || node.type === "COMPONENT") {
      out.push({
        id: node.id,
        name: node.name || "Frame",
        width: Math.round(box.width),
        height: Math.round(box.height),
      });
    }
  }

  if (!node.children?.length) return;

  // Pages → walk children; for frames, do not recurse into their children for listing.
  if (node.type === "DOCUMENT" || node.type === "CANVAS") {
    for (const child of node.children) collectFrames(child, out, depth + 1);
    return;
  }

  if (node.type === "SECTION") {
    for (const child of node.children) collectFrames(child, out, depth + 1);
  }
}

export async function fetchFigmaFileMeta(
  fileKey: string,
  token: string,
): Promise<{ name: string; frames: FigmaFrameNode[] }> {
  const data = await figmaFetch<FigmaFileResponse>(
    `/files/${encodeURIComponent(fileKey)}?depth=3`,
    token,
  );
  if (data.err) throw new Error("FIGMA_FILE_ERROR");

  const frames: FigmaFrameNode[] = [];
  collectFrames(data.document, frames, 0);

  // De-dupe by id, keep order.
  const seen = new Set<string>();
  const unique = frames.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  return { name: data.name || "Figma file", frames: unique };
}

export async function resolveFigmaFrames(input: {
  fileKey: string;
  token: string;
  nodeId?: string | null;
}): Promise<{ name: string; frames: FigmaFrameNode[] }> {
  const meta = await fetchFigmaFileMeta(input.fileKey, input.token);
  if (!input.nodeId) return meta;

  const wanted = normalizeFigmaNodeId(input.nodeId);
  const match = meta.frames.find((f) => f.id === wanted);
  if (match) return { name: meta.name, frames: [match] };

  // Node may be deeper than depth=3 — still allow exporting that id.
  return {
    name: meta.name,
    frames: [
      {
        id: wanted,
        name: "Selected node",
        width: 1080,
        height: 1080,
      },
    ],
  };
}

export async function exportFigmaImages(input: {
  fileKey: string;
  token: string;
  nodeIds: string[];
  format?: "png" | "jpg" | "svg";
  scale?: number;
}): Promise<Record<string, string>> {
  const ids = input.nodeIds.map(normalizeFigmaNodeId).filter(Boolean);
  if (ids.length === 0) return {};

  const params = new URLSearchParams({
    ids: ids.join(","),
    format: input.format ?? "png",
    scale: String(input.scale ?? 2),
  });

  const data = await figmaFetch<FigmaImagesResponse>(
    `/images/${encodeURIComponent(input.fileKey)}?${params}`,
    input.token,
  );
  if (data.err) throw new Error("FIGMA_EXPORT_ERROR");

  const out: Record<string, string> = {};
  for (const [id, url] of Object.entries(data.images ?? {})) {
    if (url) out[id] = url;
  }
  return out;
}

export async function downloadUrlAsDataUrl(url: string): Promise<{
  dataUrl: string;
  mimeType: string;
  byteLength: number;
}> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("FIGMA_DOWNLOAD_FAILED");
  const mimeType = res.headers.get("content-type") || "image/png";
  const buf = Buffer.from(await res.arrayBuffer());
  // Cap ~8MB per frame to keep server action payloads sane.
  if (buf.byteLength > 8 * 1024 * 1024) {
    throw new Error("FIGMA_IMAGE_TOO_LARGE");
  }
  return {
    dataUrl: `data:${mimeType};base64,${buf.toString("base64")}`,
    mimeType,
    byteLength: buf.byteLength,
  };
}
