/** Read a local image file as a data URL suitable for Fabric / project save. */
export async function fileToDataUrl(
  file: File,
  options?: {
    maxEdge?: number;
    quality?: number;
  },
): Promise<string> {
  // Canvas work needs headroom: Figma-like crop zooms into the bitmap.
  // Only downscale when the source is truly huge.
  const maxEdge = options?.maxEdge ?? 4096;
  const quality = options?.quality ?? 0.92;

  // SVG stays vector; GIF would lose animation if rasterized.
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return readFileAsDataUrl(file);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return readFileAsDataUrl(file);
  }

  try {
    const needsResize =
      bitmap.width > maxEdge || bitmap.height > maxEdge;

    // Already within budget — keep the original bytes (no JPEG re-encode).
    if (!needsResize) {
      return readFileAsDataUrl(file);
    }

    const scale = Math.min(1, maxEdge / bitmap.width, maxEdge / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return readFileAsDataUrl(file);

    ctx.drawImage(bitmap, 0, 0, width, height);

    const keepAlpha = file.type === "image/png" || file.type === "image/webp";
    if (keepAlpha) {
      return canvas.toDataURL("image/png");
    }
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Couldn't read the file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read the file"));
    reader.readAsDataURL(file);
  });
}
