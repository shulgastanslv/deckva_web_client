import type { FabricCanvasJSON, SlideItem } from "@/lib/types";
import type { CarouselSlideSpec } from "./carousel-types";

type CanvasObject = Record<string, unknown>;

function isRecord(value: unknown): value is CanvasObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isTextObject(obj: CanvasObject): boolean {
  const type = String(obj.type ?? "").toLowerCase();
  return type === "textbox" || type === "i-text" || type === "text";
}

function cloneSlide(slide: FabricCanvasJSON): FabricCanvasJSON {
  return JSON.parse(JSON.stringify(slide)) as FabricCanvasJSON;
}

/** Replace heading/body textboxes inside a template slide; keep layout & colors. */
export function fillTemplateSlide(
  templateSlide: FabricCanvasJSON,
  spec: CarouselSlideSpec,
): FabricCanvasJSON {
  const slide = cloneSlide(templateSlide);
  const objects = Array.isArray(slide.objects) ? (slide.objects as CanvasObject[]) : [];
  const textObjects = objects.filter(isTextObject);

  const heading =
    textObjects.find((obj) => obj.swibpStyle === "heading") ??
    textObjects
      .slice()
      .sort((a, b) => Number(b.fontSize ?? 0) - Number(a.fontSize ?? 0))[0];

  const body =
    textObjects.find((obj) => obj.swibpStyle === "body") ??
    textObjects
      .filter((obj) => obj !== heading)
      .sort((a, b) => Number(b.fontSize ?? 0) - Number(a.fontSize ?? 0))[0];

  if (heading) heading.text = spec.heading;
  if (body && spec.body) body.text = spec.body;

  return {
    ...slide,
    objects,
  };
}

/** Map AI slides onto template frames (cycles template if AI returns more slides). */
export function buildSlidesFromTemplate(input: {
  templateSlides: FabricCanvasJSON[];
  specs: CarouselSlideSpec[];
  thumbnails?: Array<string | null>;
}): SlideItem[] {
  const frames = input.templateSlides;
  if (frames.length === 0) return [];

  return input.specs.map((spec, index) => {
    const frame = frames[index % frames.length]!;
    return {
      id: index + 1,
      thumbnail: input.thumbnails?.[index % frames.length] ?? null,
      canvasJSON: fillTemplateSlide(frame, spec),
    };
  });
}
