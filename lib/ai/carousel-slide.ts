import { applyChrome, type ChromeTemplate } from "@/lib/canvas/chrome";
import type { ProjectPalette } from "@/lib/canvas/document";
import type { FabricCanvasJSON, SlideItem } from "@/lib/types";
import type { CarouselSlideSpec } from "./carousel-types";
import {
  edgeLabelsForSlide,
  type CarouselGenerateOptions,
  DEFAULT_GENERATE_OPTIONS,
} from "./generate-options";

const FONT = "Montserrat";
const MARGIN = 56;
const HEADING_SIZE = 56;
const BODY_SIZE = 24;
const CONTENT_WIDTH_RATIO = 0.78;

function textObject(input: {
  text: string;
  styleId: "heading" | "body";
  fontSize: number;
  fontWeight: string | number;
  fill: string;
  left: number;
  top: number;
  width: number;
  originX?: "left" | "center" | "right";
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  charSpacing?: number;
  role?: string;
}) {
  return {
    type: "Textbox",
    originX: input.originX ?? "left",
    originY: "top",
    left: input.left,
    top: input.top,
    width: input.width,
    text: input.text,
    fill: input.fill,
    fontSize: input.fontSize,
    fontFamily: FONT,
    fontWeight: input.fontWeight,
    lineHeight: input.lineHeight ?? 1.05,
    textAlign: input.textAlign ?? "left",
    charSpacing: input.charSpacing ?? 0,
    swibpStyle: input.styleId,
    swibpSlot: "text",
    ...(input.role ? { swibpRole: input.role } : {}),
  };
}

function estimateTextHeight(text: string, fontSize: number, width: number, lineHeight: number) {
  const avgChar = fontSize * 0.52;
  const charsPerLine = Math.max(8, Math.floor(width / avgChar));
  const lines = text
    .split(/\n+/)
    .reduce((sum, paragraph) => sum + Math.max(1, Math.ceil(paragraph.length / charsPerLine)), 0);
  return Math.round(lines * fontSize * lineHeight);
}

const EDGE_SLOTS = [
  { left: () => MARGIN, top: () => 48, width: (cw: number) => Math.round(cw * 0.42), align: "left" as const, originX: "left" as const },
  { left: (w: number) => w - MARGIN, top: () => 48, width: (cw: number) => Math.round(cw * 0.42), align: "right" as const, originX: "right" as const },
  { left: () => MARGIN, top: (h: number) => h - 88, width: (cw: number) => Math.round(cw * 0.42), align: "left" as const, originX: "left" as const },
  { left: (w: number) => w - MARGIN, top: (h: number) => h - 120, width: (cw: number) => Math.round(cw * 0.36), align: "right" as const, originX: "right" as const },
];

export function buildCarouselSlide(input: {
  spec: CarouselSlideSpec;
  palette: ProjectPalette;
  chrome: ChromeTemplate[];
  width: number;
  height: number;
  slideIndex: number;
  slideCount: number;
  id: number;
  handle?: string;
  options?: CarouselGenerateOptions;
}): SlideItem {
  const { spec, palette, width, height, slideIndex, slideCount } = input;
  const options = input.options ?? DEFAULT_GENERATE_OPTIONS;
  const background = spec.background ?? palette.background;
  const contentW = Math.round(width * CONTENT_WIDTH_RATIO);
  const centerX = width / 2;
  const handle = (input.handle || "@deckva").replace(/^@/, "");
  const heading = spec.heading.replace(/^\s*\[?\d+\]?\s*[\/.]\s*/i, "").trim();
  const body = spec.body?.trim() || "";

  const headingLineHeight = 1.05;
  const bodyLineHeight = 1.28;
  const gap = 24;
  const headingH = estimateTextHeight(heading, HEADING_SIZE, contentW, headingLineHeight);
  const bodyH = body ? estimateTextHeight(body, BODY_SIZE, contentW, bodyLineHeight) : 0;
  const blockH = headingH + (body ? gap + bodyH : 0);

  const topPad = 120;
  const bottomPad = 130;
  let blockTop: number;
  if (options.headingPosition === "top") blockTop = topPad;
  else if (options.headingPosition === "bottom") blockTop = Math.max(topPad, height - bottomPad - blockH);
  else blockTop = Math.round((height - blockH) / 2);

  const objects: Record<string, unknown>[] = [];

  edgeLabelsForSlide({
    edgeCount: options.edgeCount,
    handle,
    slideIndex,
    slideCount,
    heading,
  }).forEach((label, i) => {
    const slot = EDGE_SLOTS[i];
    if (!slot) return;
    objects.push(
      textObject({
        text: label,
        styleId: "body",
        fontSize: 16,
        fontWeight: 500,
        fill: palette.text,
        left: slot.left(width),
        top: slot.top(height),
        width: slot.width(contentW),
        textAlign: slot.align,
        originX: slot.originX,
        charSpacing: 20,
        role: "edge",
      }),
    );
  });

  objects.push(
    textObject({
      text: heading,
      styleId: "heading",
      fontSize: HEADING_SIZE,
      fontWeight: "bold",
      fill: palette.text,
      left: centerX,
      top: blockTop,
      width: contentW,
      textAlign: "center",
      originX: "center",
      lineHeight: headingLineHeight,
    }),
  );

  if (body) {
    objects.push(
      textObject({
        text: body,
        styleId: "body",
        fontSize: BODY_SIZE,
        fontWeight: 400,
        fill: palette.text,
        left: centerX,
        top: blockTop + headingH + gap,
        width: contentW,
        textAlign: "center",
        originX: "center",
        lineHeight: bodyLineHeight,
      }),
    );
  }

  const canvasJSON: FabricCanvasJSON = {
    version: "6.0.0",
    background,
    objects,
  };

  return {
    id: input.id,
    thumbnail: null,
    canvasJSON: applyChrome(canvasJSON, input.chrome, input.slideIndex, input.slideCount),
  };
}
