import { Canvas as FabricCanvas } from "fabric";
import type { FabricCanvasJSON } from "@/lib/types";
import { withRemoteImageCors } from "@/lib/canvas/image-cors";

export type ExportFormat = "png" | "jpeg" | "pdf";
export type ImageExportFormat = Exclude<ExportFormat, "pdf">;

export interface RenderedSlide {
  index: number;
  id: number;
  dataUrl: string;
  blob: Blob;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "carousel"
  );
}

export async function renderSlidesToImages(
  slides: Array<{ id: number; canvasJSON: FabricCanvasJSON }>,
  size: { width: number; height: number },
  options: {
    format?: ImageExportFormat;
    quality?: number;
    multiplier?: number;
    onProgress?: (done: number, total: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<RenderedSlide[]> {
  const {
    format = "png",
    quality = 1,
    multiplier = 1,
    onProgress,
    signal,
  } = options;

  const el = document.createElement("canvas");
  el.width = size.width;
  el.height = size.height;

  const canvas = new FabricCanvas(el, {
    width: size.width,
    height: size.height,
    renderOnAddRemove: false,
    enableRetinaScaling: false,
  });

  const results: RenderedSlide[] = [];

  try {
    for (let i = 0; i < slides.length; i++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const slide = slides[i];
      await canvas.loadFromJSON(withRemoteImageCors(slide.canvasJSON));
      if (!canvas.backgroundColor) canvas.backgroundColor = "#ffffff";
      canvas.requestRenderAll();

      let dataUrl: string;
      try {
        dataUrl = canvas.toDataURL({ format, quality, multiplier });
      } catch (err) {
        if (err instanceof DOMException && err.name === "SecurityError") {
          onProgress?.(i + 1, slides.length);
          continue;
        }
        throw err;
      }
      results.push({
        index: i,
        id: slide.id,
        dataUrl,
        blob: dataUrlToBlob(dataUrl),
      });
      onProgress?.(i + 1, slides.length);
    }
  } finally {
    canvas.dispose();
  }

  return results;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadSlidesAsZip(
  slides: RenderedSlide[],
  projectTitle: string,
  format: ImageExportFormat,
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const base = slugify(projectTitle);
  const ext = format === "jpeg" ? "jpg" : "png";

  slides.forEach((slide) => {
    const name = `${base}-${String(slide.index + 1).padStart(2, "0")}.${ext}`;
    zip.file(name, slide.blob);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${base}-carousel.zip`);
}

export function downloadSlidesSeparately(
  slides: RenderedSlide[],
  projectTitle: string,
  format: ImageExportFormat,
) {
  const base = slugify(projectTitle);
  const ext = format === "jpeg" ? "jpg" : "png";
  slides.forEach((slide) => {
    downloadBlob(
      slide.blob,
      `${base}-${String(slide.index + 1).padStart(2, "0")}.${ext}`,
    );
  });
}

/** One slide per page; page size matches rendered pixel size. */
export async function downloadSlidesAsPdf(
  slides: RenderedSlide[],
  projectTitle: string,
  pageSize: { width: number; height: number },
): Promise<void> {
  if (slides.length === 0) return;

  const { jsPDF } = await import("jspdf");
  const base = slugify(projectTitle);
  const { width, height } = pageSize;
  const orientation = width >= height ? "landscape" : "portrait";

  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [width, height],
    hotfixes: ["px_scaling"],
    compress: true,
  });

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage([width, height], orientation);
    const slide = slides[i];
    const imageFormat = slide.blob.type.includes("jpeg") ? "JPEG" : "PNG";
    pdf.addImage(slide.dataUrl, imageFormat, 0, 0, width, height, undefined, "FAST");
  }

  downloadBlob(pdf.output("blob"), `${base}-carousel.pdf`);
}

export async function copyImageToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error("Clipboard is unavailable");
  }
  await navigator.clipboard.write([
    new ClipboardItem({ [blob.type || "image/png"]: blob }),
  ]);
}
