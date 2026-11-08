import { httpGetBlob, httpPostForm } from "@/lib/api/http";

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

async function sourceToFile(source: string, filename = "image.png"): Promise<File> {
  const blob = await httpGetBlob(source);
  return new File([blob], filename, { type: blob.type || "image/png" });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Couldn't encode the result"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Couldn't read the result"));
    reader.readAsDataURL(blob);
  });
}

async function postImageTool(
  path: string,
  source: string,
  extra?: Record<string, string>,
  responseType: "json" | "blob" = "blob",
) {
  const file = await sourceToFile(source);
  const form = new FormData();
  form.append("file", file);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) form.append(key, value);
  }

  return httpPostForm(path, form, {
    responseType,
    fallbackError: "Image tool request failed",
    timeoutMs: 180_000,
  });
}

/** Remove background via deckva-tools. Returns a PNG data URL with alpha. */
export async function removeImageBackground(source: string): Promise<string> {
  const blob = await postImageTool("/api/tools/remove-bg", source);
  return blobToDataUrl(blob as Blob);
}

/** Upscale via deckva-tools. Returns a PNG data URL. */
export async function upscaleImage(source: string, scale: UpscaleScale = 2): Promise<string> {
  const blob = await postImageTool("/api/tools/upscale", source, {
    scale: String(scale),
  });
  return blobToDataUrl(blob as Blob);
}

/** Split image into layers via deckva-tools. Prefers embedded data URLs. */
export async function magicLayerImage(source: string): Promise<MagicLayerResult> {
  const payload = (await postImageTool(
    "/api/tools/magic-layer",
    source,
    undefined,
    "json",
  )) as MagicLayerResult;
  if (!payload?.layers?.length) throw new Error("No layers returned");
  return payload;
}
