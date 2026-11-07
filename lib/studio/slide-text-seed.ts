import type { FabricCanvasJSON, SlideItem } from "@/lib/types";

function collectTextFromObjects(objects: unknown[]): string[] {
  const out: string[] = [];
  for (const raw of objects) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.objects)) {
      out.push(...collectTextFromObjects(obj.objects));
      continue;
    }
    const text = typeof obj.text === "string" ? obj.text.trim() : "";
    if (!text) continue;
    const style = typeof obj.swibpStyle === "string" ? obj.swibpStyle : "";
    const role = typeof obj.swibpRole === "string" ? obj.swibpRole : "";
    // Prefer headings / body copy; skip chrome like handle / swipe cues.
    if (role === "handle" || role === "swipe" || role === "number" || role === "social") {
      continue;
    }
    if (style === "heading" || style === "subtitle" || style === "body" || !role) {
      out.push(text);
    }
  }
  return out;
}

/** Build a seed string for /text from slide Fabric JSON (headings first). */
export function buildCaptionSeedFromSlides(
  slides: SlideItem[],
  fallbackTitle = "",
): string {
  const lines: string[] = [];
  for (const slide of slides) {
    const canvas = slide.canvasJSON as FabricCanvasJSON | null;
    if (!canvas?.objects?.length) continue;
    const texts = collectTextFromObjects(canvas.objects);
    if (texts[0]) lines.push(texts[0]);
    if (lines.length >= 6) break;
  }
  if (lines.length === 0 && fallbackTitle.trim()) {
    return fallbackTitle.trim();
  }
  return lines.join("\n");
}
