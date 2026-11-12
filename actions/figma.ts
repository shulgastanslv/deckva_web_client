"use server";

import { requireUserId } from "@/lib/auth/session";
import {
  downloadUrlAsDataUrl,
  exportFigmaImages,
  resolveFigmaFrames,
  type FigmaFrameNode,
} from "@/lib/figma/api";
import { parseFigmaUrl } from "@/lib/figma/url";
import { messages } from "@/lib/messages";

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

function mapFigmaError(err: unknown): string {
  const code = err instanceof Error ? err.message : "";
  switch (code) {
    case "FIGMA_UNAUTHORIZED":
      return "Invalid Figma token or missing file access.";
    case "FIGMA_NOT_FOUND":
      return "Figma file not found. Check the link.";
    case "FIGMA_EXPORT_ERROR":
    case "FIGMA_FILE_ERROR":
      return "Figma could not export that file.";
    case "FIGMA_DOWNLOAD_FAILED":
      return "Could not download the Figma frame image.";
    case "FIGMA_IMAGE_TOO_LARGE":
      return "One of the frames is too large to import.";
    default:
      return messages.errors.generic;
  }
}

export async function listFigmaFramesAction(input: {
  url: string;
  token: string;
}): Promise<
  ActionResult<{
    fileKey: string;
    fileName: string;
    frames: FigmaFrameNode[];
    focusedNodeId: string | null;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const token = input.token?.trim();
    if (!token) return { success: false, error: "Paste a Figma personal access token." };

    const parsed = parseFigmaUrl(input.url);
    if (!parsed) {
      return {
        success: false,
        error: "Paste a valid Figma file link (figma.com/design/… or /file/…).",
      };
    }

    const { name, frames } = await resolveFigmaFrames({
      fileKey: parsed.fileKey,
      token,
      nodeId: parsed.nodeId,
    });

    if (frames.length === 0) {
      return {
        success: false,
        error: "No frames found in that file. Select a frame in Figma and copy the link.",
      };
    }

    return {
      success: true,
      fileKey: parsed.fileKey,
      fileName: name,
      frames,
      focusedNodeId: parsed.nodeId,
    };
  } catch (err) {
    console.error("listFigmaFramesAction error:", err);
    return { success: false, error: mapFigmaError(err) };
  }
}

export async function importFigmaFramesAction(input: {
  fileKey: string;
  token: string;
  nodeIds: string[];
  /** Optional widths/heights from the listing step for ratio hints. */
  frames?: Array<{ id: string; name: string; width: number; height: number }>;
}): Promise<
  ActionResult<{
    slides: Array<{
      nodeId: string;
      name: string;
      width: number;
      height: number;
      dataUrl: string;
    }>;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const token = input.token?.trim();
    const fileKey = input.fileKey?.trim();
    const nodeIds = [...new Set(input.nodeIds.map((id) => id.trim()).filter(Boolean))];
    if (!token) return { success: false, error: "Paste a Figma personal access token." };
    if (!fileKey) return { success: false, error: messages.errors.generic };
    if (nodeIds.length === 0) {
      return { success: false, error: "Select at least one frame." };
    }
    if (nodeIds.length > 20) {
      return { success: false, error: "Import up to 20 frames at a time." };
    }

    const urls = await exportFigmaImages({
      fileKey,
      token,
      nodeIds,
      format: "png",
      scale: 2,
    });

    const metaById = new Map(
      (input.frames ?? []).map((f) => [f.id, f] as const),
    );

    const slides: Array<{
      nodeId: string;
      name: string;
      width: number;
      height: number;
      dataUrl: string;
    }> = [];

    for (const id of nodeIds) {
      const imageUrl = urls[id];
      if (!imageUrl) continue;
      const downloaded = await downloadUrlAsDataUrl(imageUrl);
      const meta = metaById.get(id);
      slides.push({
        nodeId: id,
        name: meta?.name || "Frame",
        width: meta?.width || 1080,
        height: meta?.height || 1080,
        dataUrl: downloaded.dataUrl,
      });
    }

    if (slides.length === 0) {
      return {
        success: false,
        error: "Figma returned no images for the selected frames.",
      };
    }

    return { success: true, slides };
  } catch (err) {
    console.error("importFigmaFramesAction error:", err);
    return { success: false, error: mapFigmaError(err) };
  }
}
