export type SocialNetwork =
  | "x"
  | "telegram"
  | "linkedin"
  | "threads"
  | "facebook"
  | "whatsapp";

export const SOCIAL_NETWORKS: {
  id: SocialNetwork;
  label: string;
}[] = [
  { id: "x", label: "X" },
  { id: "telegram", label: "Telegram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "threads", label: "Threads" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
];

/** Build an intent URL that opens a compose / share sheet for the network. */
export function socialShareUrl(
  network: SocialNetwork,
  input: { url: string; text?: string },
): string {
  const url = input.url;
  const text = input.text?.trim() || "Check out this carousel";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const combined = encodeURIComponent(`${text} ${url}`);

  switch (network) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${combined}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "whatsapp":
      return `https://wa.me/?text=${combined}`;
  }
}

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
