import { Canvas as FabricCanvas } from "fabric";

import { withRemoteImageCors } from "@/lib/canvas/image-cors";
import {
  downloadBlob,
  renderSlidesToImages,
  type RenderedSlide,
} from "@/lib/export/carousel";
import type { FabricCanvasJSON } from "@/lib/types";

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

export type FigmaExportFormat = "svg" | "png";

export async function renderSlidesToSvg(
  slides: Array<{ id: number; canvasJSON: FabricCanvasJSON }>,
  size: { width: number; height: number },
  options: {
    onProgress?: (done: number, total: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<Array<{ index: number; id: number; svg: string }>> {
  const el = document.createElement("canvas");
  el.width = size.width;
  el.height = size.height;

  const canvas = new FabricCanvas(el, {
    width: size.width,
    height: size.height,
    renderOnAddRemove: false,
    enableRetinaScaling: false,
  });

  const results: Array<{ index: number; id: number; svg: string }> = [];

  try {
    for (let i = 0; i < slides.length; i++) {
      if (options.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const slide = slides[i]!;
      await canvas.loadFromJSON(withRemoteImageCors(slide.canvasJSON));
      if (!canvas.backgroundColor) canvas.backgroundColor = "#ffffff";
      canvas.requestRenderAll();
      const svg = canvas.toSVG({ suppressPreamble: false });
      results.push({ index: i, id: slide.id, svg });
      options.onProgress?.(i + 1, slides.length);
    }
  } finally {
    canvas.dispose();
  }

  return results;
}

export async function downloadSlidesForFigma(input: {
  slides: Array<{ id: number; canvasJSON: FabricCanvasJSON }>;
  size: { width: number; height: number };
  projectTitle: string;
  format: FigmaExportFormat;
  multiplier?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const base = slugify(input.projectTitle);
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  if (input.format === "svg") {
    const rows = await renderSlidesToSvg(input.slides, input.size, {
      onProgress: input.onProgress,
      signal: input.signal,
    });
    rows.forEach((row) => {
      const name = `${base}-${String(row.index + 1).padStart(2, "0")}.svg`;
      zip.file(name, row.svg);
    });
  } else {
    const rows: RenderedSlide[] = await renderSlidesToImages(
      input.slides,
      input.size,
      {
        format: "png",
        multiplier: input.multiplier ?? 2,
        onProgress: input.onProgress,
        signal: input.signal,
      },
    );
    rows.forEach((row) => {
      const name = `${base}-${String(row.index + 1).padStart(2, "0")}.png`;
      zip.file(name, row.blob);
    });
  }

  const readme = [
    "Deckva → Figma",
    "",
    "1. Open your Figma file.",
    "2. Drag the SVG (or PNG) files onto the canvas — one frame per slide.",
    "3. Keep slide order from the filenames (01, 02, …).",
    "",
    "SVG keeps vectors editable where Fabric could serialize them.",
    "PNG is a pixel-perfect handoff of the finished slides.",
  ].join("\n");
  zip.file("README-figma.txt", readme);

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${base}-figma.zip`);
}
