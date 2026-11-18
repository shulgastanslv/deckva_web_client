import {
  downloadSlidesAsPdf,
  downloadSlidesAsZip,
  renderSlidesToImages,
  type ExportFormat,
  type ImageExportFormat,
} from "@/lib/export/carousel";
import type { FabricCanvasJSON } from "@/lib/types";

export type QuickExportFormat = ExportFormat;

/** PNG / JPEG ZIP or PDF @2x — shared by File menu and project card menu. */
export async function quickExportSlides(input: {
  slides: Array<{ id: number; canvasJSON: FabricCanvasJSON }>;
  size: { width: number; height: number };
  title: string;
  format: QuickExportFormat;
}): Promise<void> {
  const imageFormat: ImageExportFormat =
    input.format === "pdf" ? "png" : input.format;
  const rendered = await renderSlidesToImages(input.slides, input.size, {
    format: imageFormat,
    quality: imageFormat === "jpeg" ? 0.92 : 1,
    multiplier: 2,
  });
  if (rendered.length === 0) {
    throw new Error("Nothing to export");
  }

  if (input.format === "pdf") {
    await downloadSlidesAsPdf(rendered, input.title, {
      width: input.size.width * 2,
      height: input.size.height * 2,
    });
    return;
  }

  await downloadSlidesAsZip(rendered, input.title, imageFormat);
}
