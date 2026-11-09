export function canNativeShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({
      files: [new File([""], "slide.png", { type: "image/png" })],
    });
  } catch {
    return false;
  }
}

export async function nativeShareFiles(
  files: File[],
  opts?: { title?: string; text?: string },
): Promise<"shared" | "cancelled" | "unavailable"> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unavailable";
  }
  try {
    if (navigator.canShare && !navigator.canShare({ files })) {
      return "unavailable";
    }
    await navigator.share({
      files,
      title: opts?.title,
      text: opts?.text,
    });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    return "unavailable";
  }
}

export function blobToShareFile(blob: Blob, name: string): File {
  const type = blob.type || "image/png";
  return new File([blob], name, { type });
}
