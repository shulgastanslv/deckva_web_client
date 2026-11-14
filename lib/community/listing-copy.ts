import type { FabricCanvasJSON } from "@/lib/types";

const TEXT_TYPES = new Set([
  "text",
  "i-text",
  "textbox",
  "itext",
]);

const SKIP_ROLES = new Set([
  "handle",
  "swipe",
  "pageNumber",
  "page-number",
  "chrome",
]);

function walkText(
  objects: unknown[],
  out: string[],
): void {
  for (const raw of objects) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as {
      type?: string;
      text?: string;
      swibpRole?: string;
      objects?: unknown[];
    };
    const type = String(obj.type ?? "").toLowerCase();
    const role = typeof obj.swibpRole === "string" ? obj.swibpRole : "";
    if (
      TEXT_TYPES.has(type) &&
      typeof obj.text === "string" &&
      !SKIP_ROLES.has(role)
    ) {
      const text = obj.text.replace(/\s+/g, " ").trim();
      if (text) out.push(text);
    }
    if (Array.isArray(obj.objects)) walkText(obj.objects, out);
  }
}

/** First meaningful text line from a Fabric slide JSON. */
export function primaryTextFromSlide(canvasJSON: FabricCanvasJSON | null | undefined): string {
  if (!canvasJSON || !Array.isArray(canvasJSON.objects)) return "";
  const texts: string[] = [];
  walkText(canvasJSON.objects, texts);
  return texts[0] ?? "";
}

/** Suggest listing description + key moments from the live carousel. */
export function suggestListingCopy(input: {
  title: string;
  slides: Array<{ canvasJSON: FabricCanvasJSON }>;
}): { description: string; keyMoments: string[] } {
  const title = input.title.trim();
  const lines = input.slides
    .map((slide) => primaryTextFromSlide(slide.canvasJSON))
    .map((line) => line.trim())
    .filter(Boolean);

  const unique: string[] = [];
  for (const line of lines) {
    if (unique.some((u) => u.toLowerCase() === line.toLowerCase())) continue;
    unique.push(line);
    if (unique.length >= 6) break;
  }

  const description =
    unique.find((line) => line !== title)?.slice(0, 280) ||
    (title
      ? `A ${input.slides.length}-slide carousel: ${title}`
      : "");

  const keyMoments = unique
    .filter((line) => line !== description)
    .slice(0, 5)
    .map((line) => line.slice(0, 120));

  return { description, keyMoments };
}

export function normalizeKeyMoments(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const text = item.replace(/\s+/g, " ").trim().slice(0, 160);
    if (!text) continue;
    if (out.some((u) => u.toLowerCase() === text.toLowerCase())) continue;
    out.push(text);
    if (out.length >= 8) break;
  }
  return out;
}
