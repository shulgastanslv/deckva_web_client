/**
 * Server-side helpers that talk to deckva-tools directly.
 * Call these from Server Actions — not from the browser.
 */
import { isAxiosError } from "axios";

import { http, isTimeoutError } from "@/lib/api/http";
import { toolsBaseUrl } from "@/lib/image/tools-proxy";

export type UpscaleScale = 2 | 3 | 4;

export type MagicLayer = {
  name: string;
  index: number;
  url: string;
  left: number;
  top: number;
  width: number;
  height: number;
  bbox: [number, number, number, number];
  mime: string;
  data_url?: string;
};

export type MagicLayerResult = {
  job_id: string;
  width: number;
  height: number;
  count: number;
  layers: MagicLayer[];
};

const TIMEOUT_MS = 180_000;

async function sourceToFile(source: string, filename = "image.png"): Promise<File> {
  if (source.startsWith("data:")) {
    const match = /^data:([^;]+);base64,(.+)$/i.exec(source);
    if (!match) throw new Error("Couldn't read the image");
    const bytes = Buffer.from(match[2], "base64");
    return new File([bytes], filename, { type: match[1] || "image/png" });
  }

  try {
    const { data, headers } = await http.get<ArrayBuffer>(source, {
      responseType: "arraybuffer",
      timeout: TIMEOUT_MS,
    });
    const type =
      (headers["content-type"] as string | undefined)?.split(";")[0] ||
      "image/png";
    return new File([data], filename, { type });
  } catch (error) {
    if (isTimeoutError(error)) throw new Error("Couldn't read the image timed out");
    throw new Error("Couldn't read the image");
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buf = Buffer.from(await blob.arrayBuffer());
  const type = blob.type || "image/png";
  return `data:${type};base64,${buf.toString("base64")}`;
}

function toolErrorMessage(error: unknown, fallback: string): string {
  if (isTimeoutError(error)) return "Image tool timed out";
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const detail = (data as { detail?: unknown; error?: unknown }).detail;
      const err = (data as { error?: unknown }).error;
      if (typeof detail === "string" && detail.trim()) return detail;
      if (typeof err === "string" && err.trim()) return err;
    }
    if (!error.response) return "Couldn't reach deckva-tools";
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

async function postTool(
  path: string,
  source: string,
  extra?: Record<string, string>,
  expect: "image" | "json" = "image",
) {
  const file = await sourceToFile(source);
  const form = new FormData();
  form.append("file", file, file.name);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) form.append(key, value);
  }

  try {
    const response = await http.post(`${toolsBaseUrl()}${path}`, form, {
      timeout: TIMEOUT_MS,
      responseType: expect === "json" ? "json" : "arraybuffer",
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300) {
      const payload =
        expect === "json"
          ? response.data
          : (() => {
              try {
                return JSON.parse(
                  Buffer.from(response.data as ArrayBuffer).toString("utf8"),
                );
              } catch {
                return null;
              }
            })();
      const detail =
        payload &&
        typeof payload === "object" &&
        typeof (payload as { detail?: unknown }).detail === "string"
          ? (payload as { detail: string }).detail
          : `Tool failed (${response.status})`;
      throw new Error(detail);
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Tool failed")) {
      throw error;
    }
    throw new Error(toolErrorMessage(error, "Image tool request failed"));
  }
}

/** Remove background via deckva-tools. Returns a PNG data URL with alpha. */
export async function removeImageBackground(source: string): Promise<string> {
  const bytes = (await postTool("/api/remove-bg", source, undefined, "image")) as ArrayBuffer;
  return blobToDataUrl(new Blob([bytes], { type: "image/png" }));
}

/** Upscale via deckva-tools. Returns a PNG data URL. */
export async function upscaleImage(
  source: string,
  scale: UpscaleScale = 2,
): Promise<string> {
  const bytes = (await postTool(
    "/api/upscale",
    source,
    { scale: String(scale) },
    "image",
  )) as ArrayBuffer;
  return blobToDataUrl(new Blob([bytes], { type: "image/png" }));
}

/** Split image into layers via deckva-tools. Prefers embedded data URLs. */
export async function magicLayerImage(source: string): Promise<MagicLayerResult> {
  const formExtra = {
    format: "json",
    include_data_url: "true",
  };
  const payload = (await postTool(
    "/api/magic-layer",
    source,
    formExtra,
    "json",
  )) as MagicLayerResult;
  if (!payload?.layers?.length) throw new Error("No layers returned");
  return payload;
}
