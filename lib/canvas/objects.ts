import {
  Canvas,
  Rect,
  Circle,
  Ellipse,
  Triangle,
  Line,
  Textbox,
  Text,
  IText,
  Polygon,
  Group,
  Object as FabricObject,
  Image,
  loadSVGFromString,
  util,
} from "fabric";
import { useCanvasStore } from "@/store/useCanvasStore";
import { formatSlideNumber, type ChromeRole, type SlideNumberStyle } from "@/lib/canvas/chrome";
import type { PaletteSlot, TextStyleDef, TextStyleId } from "@/lib/canvas/document";
import "./fabric-props";
import { isFrameKind, type FrameKind } from "@/lib/canvas/frames";
import { MOCKUP_SCALE, renderDeviceMockup } from "@/lib/canvas/device-mockup";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  buildCodeBlockGroup,
  DEFAULT_CODE_OPTIONS,
  rebuildCodeBlock,
  type CodeBlockOptions,
} from "@/lib/canvas/code-block";

export type { SlideNumberStyle };
export { formatSlideNumber };

export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type Side = "left" | "right";

const IMAGE_SHAPES = new Set(["rect", "circle", "triangle", "ellipse", "polygon", "path"]);

function polygonPoints(sides: number, radius: number) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / sides;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

function starPoints(radius = 80) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const r = index % 2 === 0 ? radius : radius * 0.42;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
}

export function canFillShape(type: string | undefined) {
  return !!type && IMAGE_SHAPES.has(type);
}

const CORNER_MARGIN = 64;
const CORNER_FONT = "Inter, sans-serif";
const CORNER_MUTED = "#64748b";
const CORNER_INK = "#0f172a";

export class ObjectFactory {
  private canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  private getCenter() {
    return {
      x: (this.canvas.width || 1080) / 2,
      y: (this.canvas.height || 1080) / 2,
    };
  }

  private getPosition(x?: number, y?: number) {
    if (x !== undefined && y !== undefined) {
      return { left: x, top: y, originX: "center" as const, originY: "center" as const };
    }
    const c = this.getCenter();
    return { left: c.x, top: c.y, originX: "center" as const, originY: "center" as const };
  }

  /** Logical (unzoomed) slide size. */
  private getLogicalSize() {
    const zoom = this.canvas.getZoom() || 1;
    return {
      width: (this.canvas.width || 1080) / zoom,
      height: (this.canvas.height || 1080) / zoom,
    };
  }

  /** Center of the slide in logical coordinates (ignores viewport zoom). */
  getLogicalCenter() {
    const { width, height } = this.getLogicalSize();
    return { x: width / 2, y: height / 2 };
  }

  private mark(obj: FabricObject, props: Record<string, string>) {
    obj.set(props);
    return obj;
  }

  private removeRole(role: ChromeRole) {
    this.removeTagged(role);
  }

  private removeTagged(role: string) {
    for (const obj of [...this.canvas.getObjects()]) {
      if ((obj as FabricObject & { swibpRole?: string }).swibpRole === role) {
        this.canvas.remove(obj);
      }
    }
  }

  private slotColor(slot: PaletteSlot, fallback: string) {
    return useCanvasStore.getState().palette?.[slot] ?? fallback;
  }

  private textStyle(id: TextStyleId): TextStyleDef {
    const styles = useCanvasStore.getState().textStyles;
    return (
      styles?.[id] ?? {
        fontFamily: "Inter",
        fontSize: id === "heading" ? 80 : id === "subtitle" ? 40 : 28,
        fontWeight: id === "heading" ? "bold" : "400",
        lineHeight: 0.8,
      }
    );
  }

  /** Position + origin so an object hugs the given corner with CORNER_MARGIN inset. */
  private getCornerPosition(corner: Corner) {
    const { width, height } = this.getLogicalSize();
    const isRight = corner.endsWith("right");
    const isBottom = corner.startsWith("bottom");
    return {
      left: isRight ? width - CORNER_MARGIN : CORNER_MARGIN,
      top: isBottom ? height - CORNER_MARGIN : CORNER_MARGIN,
      originX: (isRight ? "right" : "left") as "left" | "right",
      originY: (isBottom ? "bottom" : "top") as "top" | "bottom",
    };
  }

  // ── CORNER BLOCKS ──────────────────────────────────────────────────

  /** Slide counter pinned to a corner (default: top-left). */
  addSlideNumber(
    style: SlideNumberStyle,
    index: number,
    total: number,
    corner: Corner = "top-left",
  ): IText {
    const textValue = formatSlideNumber(style, index, total);
    const existing = this.canvas
      .getObjects()
      .find((obj) => (obj as FabricObject & { swibpRole?: string }).swibpRole === "number");
    if (existing) {
      existing.set({
        text: textValue,
        swibpNumberStyle: style,
        ...this.getCornerPosition(corner),
      });
      existing.setCoords();
      this.canvas.requestRenderAll();
      this.canvas.fire("object:modified", { target: existing });
      return existing as IText;
    }

    const text = new IText(textValue, {
      ...this.getCornerPosition(corner),
      fontSize: 25,
      fontFamily: CORNER_FONT,
      fontWeight: "400",
      fill: this.slotColor("text", CORNER_MUTED),
    });
    this.mark(text, { swibpRole: "number", swibpNumberStyle: style, swibpSlot: "text" });
    this.addToCanvas(text);
    return text;
  }

  /**
   * Author chip at the top edge.
   * Avatar on the left, channel name above, and the handle in parentheses beside it.
   */
  async addCornerHandle(
    handle = "@username",
    side: Side = "right",
    platform?: string,
    avatarUrl?: string | null,
  ): Promise<Group> {
    const corner: Corner = side === "right" ? "top-right" : "top-left";
    const pos = this.getCornerPosition(corner);
    const ink = this.slotColor("text", CORNER_INK);
    const size = 64;
    const gap = 14;
    const textLeft = size + gap;
    const initial = (handle.replace(/^@/, "").trim()[0] || "?").toUpperCase();

    const avatar = new Circle({
      radius: size / 2,
      fill: this.slotColor("card", "#e2e8f0"),
      originX: "left",
      originY: "top",
      left: 0,
      top: 0,
      evented: false,
      selectable: false,
    });
    const letter = new Text(initial, {
      fontSize: 26,
      fontFamily: CORNER_FONT,
      fontWeight: "600",
      fill: ink,
      originX: "center",
      originY: "center",
      left: size / 2,
      top: size / 2,
      evented: false,
      selectable: false,
    });

    const photo = avatarUrl ? await this.circlePhoto(avatarUrl, size) : null;
    const parts: FabricObject[] = photo ? [photo] : [avatar, letter];
    const channelName = platform?.trim();

    if (channelName) {
      const channel = new IText(channelName, {
        originX: "left",
        originY: "top",
        left: textLeft,
        top: 6,
        fontSize: 26,
        fontFamily: CORNER_FONT,
        fontWeight: "600",
        fill: ink,
      });
      this.mark(channel, { swibpSlot: "text" });
      parts.push(channel);
    }

    const caption = new IText(`(${handle})`, {
      originX: "left",
      originY: "top",
      left: textLeft,
      top: channelName ? 36 : (size - 24) / 2,
      fontSize: 22,
      fontFamily: CORNER_FONT,
      fontWeight: "400",
      fill: CORNER_MUTED,
    });
    this.mark(caption, { swibpSlot: "text" });
    parts.push(caption);

    this.removeRole("handle");
    const group = new Group(parts, {
      ...pos,
      subTargetCheck: true,
      interactive: true,
    });
    this.mark(group, { swibpRole: "handle" });
    this.addToCanvas(group);
    return group;
  }

  private async circlePhoto(url: string, size: number): Promise<FabricObject | null> {
    try {
      const img = await Image.fromURL(url);
      const width = img.width || 1;
      const height = img.height || 1;
      const cover = size / Math.min(width, height);
      img.set({
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        scaleX: cover,
        scaleY: cover,
        evented: false,
        selectable: false,
        clipPath: new Circle({
          radius: Math.min(width, height) / 2,
          originX: "center",
          originY: "center",
        }),
      });
      return img;
    } catch {
      return null;
    }
  }

  /** Text swipe cue (e.g. "->") pinned bottom-right. */
  addSwipeArrow(text = "→", corner: Corner = "bottom-right"): IText {
    this.removeTagged("swipe");
    this.removeTagged("cue");
    const arrow = new IText(text, {
      ...this.getCornerPosition(corner),
      fontSize: 56,
      fontFamily: "Consolas, 'Courier New', monospace",
      fontWeight: "700",
      fill: this.slotColor("accent", CORNER_INK),
    });
    this.mark(arrow, { swibpRole: "swipe", swibpSlot: "accent" });
    this.addToCanvas(arrow);
    return arrow;
  }

  /** Swipe caption in a corner. Replaces the previous swipe. */
  addSwipeCue(text: string, corner: Corner = "bottom-right"): IText {
    this.removeTagged("swipe");
    this.removeTagged("cue");
    const label = new IText(text, {
      ...this.getCornerPosition(corner),
      fontSize: 28,
      fontFamily: CORNER_FONT,
      fontWeight: "600",
      fill: this.slotColor("accent", CORNER_INK),
      textAlign: corner.endsWith("right") ? "right" : "left",
    });
    this.mark(label, { swibpRole: "swipe", swibpSlot: "accent" });
    this.addToCanvas(label);
    return label;
  }

  /** Corner line such as "Telegram: @name". */
  addSocials(
    entries: readonly { label: string; value: string }[],
    corner: Corner = "bottom-left",
  ): IText | null {
    const lines = entries
      .map((entry) => ({ label: entry.label.trim(), value: entry.value.trim() }))
      .filter((entry) => entry.label && entry.value)
      .map((entry) => `${entry.label}: ${entry.value}`);
    if (lines.length === 0) return null;

    this.removeTagged("social");
    const label = new IText(lines.join("\n"), {
      ...this.getCornerPosition(corner),
      fontSize: 26,
      fontFamily: CORNER_FONT,
      fontWeight: "500",
      fill: this.slotColor("text", CORNER_INK),
      lineHeight: 1.28,
      textAlign: corner.endsWith("right") ? "right" : "left",
    });
    this.mark(label, { swibpRole: "social", swibpSlot: "text" });
    this.addToCanvas(label);
    return label;
  }

  /** Bottom-left "// info" caption plus a bottom-right swipe arrow. */
  addSwipeInfo(
    info = "info",
    arrowText = "->",
  ): { info: IText; arrow: IText } {
    const caption = new IText(`// ${info}`, {
      ...this.getCornerPosition("bottom-left"),
      fontSize: 28,
      fontFamily: "Consolas, 'Courier New', monospace",
      fontWeight: "500",
      fill: CORNER_MUTED,
    });
    this.canvas.add(caption);
    const arrow = this.addSwipeArrow(arrowText);
    return { info: caption, arrow };
  }

  // ── EXISTING METHODS (keep exactly as before) ──────────────────────

  addLine(x?: number, y?: number): Line {
    const pos = this.getPosition(x, y);
    const length = 200;
    const line = new Line([-length / 2, 0, length / 2, 0], {
      stroke: "#000000",
      strokeWidth: 3,
      left: pos.left,
      top: pos.top,
    });
    this.addToCanvas(line);
    return line;
  }

  async addImage(
    url: string,
    options?: { maxSize?: number; dx?: number; dy?: number },
  ): Promise<void> {
    const isRemote = /^https?:\/\//i.test(url);
    const img = await Image.fromURL(
      url,
      isRemote ? { crossOrigin: "anonymous" } : undefined,
    );
    const { width, height } = this.getLogicalSize();
    const center = this.getLogicalCenter();
    const scale = options?.maxSize
      ? Math.min(
          options.maxSize / (img.width || 1),
          options.maxSize / (img.height || 1),
          1,
        )
      : Math.min(
          (width * 0.8) / (img.width || 1),
          (height * 0.8) / (img.height || 1),
          1,
        );
    img.set({
      left: center.x + (options?.dx ?? 0),
      top: center.y + (options?.dy ?? 0),
      originX: "center",
      originY: "center",
      scaleX: scale,
      scaleY: scale,
    });
    this.canvas.add(img);
    this.canvas.setActiveObject(img);
    this.canvas.renderAll();
  }

  /** Place an SVG icon as vectors so the fill control can recolor it. */
  async addSvgIcon(svg: string, options?: { maxSize?: number }): Promise<void> {
    const parsed = await loadSVGFromString(svg);
    const parts = parsed.objects.filter((obj): obj is FabricObject => Boolean(obj));
    if (parts.length === 0) throw new Error("IconScout SVG had no shapes");
    const icon = util.groupSVGElements(parts, parsed.options);
    const maxSize = options?.maxSize ?? 280;
    const scale = Math.min(maxSize / (icon.width || 1), maxSize / (icon.height || 1), 1);
    const center = this.getLogicalCenter();
    icon.set({
      left: center.x,
      top: center.y,
      originX: "center",
      originY: "center",
      scaleX: scale,
      scaleY: scale,
      swibpIcon: true,
    });
    this.canvas.add(icon);
    this.canvas.setActiveObject(icon);
    this.canvas.renderAll();
  }

  private isSplit(obj: FabricObject) {
    return (obj as FabricObject & { swibpRole?: string }).swibpRole === "split";
  }

  private findSplit() {
    return this.canvas.getObjects().find((obj) => this.isSplit(obj)) ?? null;
  }

  private lockInPlace(obj: FabricObject) {
    obj.set({
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      hasBorders: true,
      hoverCursor: "pointer",
    });
  }

  /** Fills one grid-aligned region. Replaces the previous split image. */
  placeSplitImage(frame: { left: number; top: number; width: number; height: number }) {
    for (const obj of [...this.canvas.getObjects()]) {
      if (this.isSplit(obj)) this.canvas.remove(obj);
    }
    const rect = new Rect({
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      fill: this.slotColor("card", "#e2e8f0"),
      originX: "left",
      originY: "top",
      rx: 0,
      ry: 0,
    });
    this.mark(rect, { swibpRole: "split", swibpSlot: "card" });
    this.lockInPlace(rect);
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();
    return rect;
  }

  /** Opens a file picker and drops the picture into the locked split region. */
  pickSplitImage() {
    if (!this.findSplit()) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) this.fillSplitFromFile(file);
    };
    input.click();
  }

  fillSplitFromFile(file: File) {
    if (!file.type.startsWith("image/") || !this.findSplit()) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") void this.fillSplitImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  /** Covers the split region with a picture and keeps that region fixed. */
  async fillSplitImage(source: string) {
    const current = this.findSplit();
    if (!current) return;
    return this.fillFrameWithImage(current, source);
  }

  async addFrame(kind: FrameKind, x?: number, y?: number, screen?: string) {
    const png = await renderDeviceMockup(kind, screen);
    const img = await Image.fromURL(png);
    img.set({
      ...this.getPosition(x, y),
      scaleX: 1 / MOCKUP_SCALE,
      scaleY: 1 / MOCKUP_SCALE,
    });
    this.mark(img, { swibpRole: "frame", swibpFrameKind: kind });
    this.addToCanvas(img);
    return img;
  }

  private isFrame(obj: FabricObject | null | undefined): obj is Image {
    if (!(obj instanceof Image)) return false;
    return (obj as Image & { swibpRole?: string }).swibpRole === "frame";
  }

  private findFrame(prefer?: FabricObject | null) {
    const active = prefer ?? this.canvas.getActiveObject();
    if (this.isFrame(active)) return active;
    const frames = this.canvas.getObjects().filter((obj) => this.isFrame(obj));
    return frames[frames.length - 1] ?? null;
  }

  /** Opens a file picker and drops the picture into the device screen. */
  pickFrameImage(target?: FabricObject | null) {
    const frame = this.findFrame(target);
    if (!frame) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      void fileToDataUrl(file).then((source) => this.fillDeviceFrame(frame, source));
    };
    input.click();
  }

  /** Fills the selected device, or places a new iPhone when none is on the slide. */
  async fillActiveFrame(source: string) {
    const frame = this.findFrame();
    if (!frame) return this.addFrame("iphone", undefined, undefined, source);
    return this.fillDeviceFrame(frame, source);
  }

  /** Repaints the device with the picture covering its screen. */
  async fillDeviceFrame(frame: Image, source: string) {
    const kind = (frame as Image & { swibpFrameKind?: string }).swibpFrameKind;
    if (!kind || !isFrameKind(kind)) return;

    const png = await renderDeviceMockup(kind, source);
    const visualW = Math.max(1, frame.getScaledWidth());
    const visualH = Math.max(1, frame.getScaledHeight());
    const { left, top, originX, originY, angle } = frame;
    await frame.setSrc(png);
    frame.set({
      scaleX: visualW / (frame.width || 1),
      scaleY: visualH / (frame.height || 1),
      left,
      top,
      originX,
      originY,
      angle,
    });
    this.mark(frame, { swibpRole: "frame", swibpFrameKind: kind });
    frame.setCoords();
    this.canvas.setActiveObject(frame);
    this.canvas.requestRenderAll();
    return frame;
  }

  /** Opens a file picker and fills the selected shape with that picture. */
  pickShapeImage(target?: FabricObject | null) {
    const shape = target ?? this.canvas.getActiveObject();
    if (!shape || !canFillShape(shape.type)) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          void this.fillFrameWithImage(shape, reader.result);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  /**
   * Covers a shape with a picture and clips it to that shape.
   * A picture that is already clipped keeps its outline.
   */
  async fillFrameWithImage(target: FabricObject, source: string) {
    if (!target.canvas) return;

    const tagged = target as FabricObject & { swibpRole?: string; swibpSlot?: string };
    const keepLocked = this.isSplit(target) || Boolean(target.lockMovementX && target.lockMovementY);
    const center = target.getCenterPoint();
    const frameW = Math.max(1, Math.abs((target.width || 1) * (target.scaleX || 1)));
    const frameH = Math.max(1, Math.abs((target.height || 1) * (target.scaleY || 1)));
    const index = this.canvas.getObjects().indexOf(target);

    const img = await Image.fromURL(source);
    const sourceW = img.width || 1;
    const sourceH = img.height || 1;
    const scale = Math.max(frameW / sourceW, frameH / sourceH);
    const cropW = frameW / scale;
    const cropH = frameH / scale;

    img.set({
      left: center.x,
      top: center.y,
      originX: "center",
      originY: "center",
      angle: target.angle || 0,
      flipX: Boolean(target.flipX),
      flipY: Boolean(target.flipY),
      cropX: Math.max(0, (sourceW - cropW) / 2),
      cropY: Math.max(0, (sourceH - cropH) / 2),
      width: cropW,
      height: cropH,
      scaleX: scale,
      scaleY: scale,
    });

    const clip = await this.shapeClip(target, scale);
    if (clip) img.clipPath = clip;

    if (tagged.swibpRole || tagged.swibpSlot) {
      this.mark(img, {
        ...(tagged.swibpRole ? { swibpRole: tagged.swibpRole } : {}),
        ...(tagged.swibpSlot ? { swibpSlot: tagged.swibpSlot } : {}),
      });
    }
    if (keepLocked) this.lockInPlace(img);

    this.canvas.remove(target);
    this.canvas.insertAt(Math.max(0, index), img);
    this.canvas.setActiveObject(img);
    this.canvas.renderAll();
    return img;
  }

  /** Clip path in the picture's own coordinates, centered on it. */
  private async shapeClip(target: FabricObject, imageScale: number) {
    const existing = target.clipPath;
    const clip = existing
      ? await existing.clone()
      : canFillShape(target.type)
        ? await target.clone()
        : null;
    if (!clip) return null;

    const baseScaleX = existing
      ? (existing.scaleX || 1) * (target.scaleX || 1)
      : target.scaleX || 1;
    const baseScaleY = existing
      ? (existing.scaleY || 1) * (target.scaleY || 1)
      : target.scaleY || 1;

    clip.set({
      absolutePositioned: false,
      originX: "center",
      originY: "center",
      left: 0,
      top: 0,
      angle: 0,
      skewX: 0,
      skewY: 0,
      flipX: false,
      flipY: false,
      scaleX: baseScaleX / (imageScale || 1),
      scaleY: baseScaleY / (imageScale || 1),
      strokeWidth: 0,
      evented: false,
      selectable: false,
      objectCaching: false,
    });
    clip.clipPath = undefined;
    return clip;
  }

  addRectangle(x?: number, y?: number) {
    const pos = this.getPosition(x, y);
    const rect = new Rect({
      width: 200,
      height: 150,
      fill: this.slotColor("card", "#f1f5f9"),
      rx: 8,
      ry: 8,
      ...pos,
    });
    this.mark(rect, { swibpSlot: "card" });
    this.addToCanvas(rect);
    return rect;
  }

  addCircle(x?: number, y?: number) {
    const pos = this.getPosition(x, y);
    const circle = new Circle({
      radius: 75,
      fill: "#ef4444",
      ...pos,
    });
    this.addToCanvas(circle);
    return circle;
  }

  addTriangle(x?: number, y?: number) {
    const pos = this.getPosition(x, y);
    const triangle = new Triangle({
      width: 150,
      height: 150,
      fill: this.slotColor("accent", "#3b82f6"),
      ...pos,
    });
    this.mark(triangle, { swibpSlot: "accent" });
    this.addToCanvas(triangle);
    return triangle;
  }

  addDiamond(x?: number, y?: number) {
    return this.addFilledPolygon(polygonPoints(4, 80), x, y);
  }

  addStar(x?: number, y?: number) {
    return this.addFilledPolygon(starPoints(), x, y);
  }

  addHexagon(x?: number, y?: number) {
    return this.addFilledPolygon(polygonPoints(6, 80), x, y);
  }

  addEllipse(x?: number, y?: number) {
    const ellipse = new Ellipse({
      rx: 90,
      ry: 55,
      fill: this.slotColor("accent", "#3b82f6"),
      ...this.getPosition(x, y),
    });
    this.mark(ellipse, { swibpSlot: "accent" });
    this.addToCanvas(ellipse);
    return ellipse;
  }

  private addFilledPolygon(points: { x: number; y: number }[], x?: number, y?: number) {
    const shape = new Polygon(points, {
      fill: this.slotColor("accent", "#3b82f6"),
      ...this.getPosition(x, y),
    });
    this.mark(shape, { swibpSlot: "accent" });
    this.addToCanvas(shape);
    return shape;
  }

  addArrow(x?: number, y?: number) {
    const pos = this.getPosition(x, y);
    const length = 200;
    const headSize = 15;
    const line = new Line([-length / 2, 0, length / 2, 0], {
      stroke: "#000",
      strokeWidth: 4,
      strokeLineCap: "round",
    });
    const arrowHead = new Polygon(
      [
        { x: length / 2, y: 0 },
        { x: length / 2 - headSize, y: -headSize },
        { x: length / 2 - headSize, y: headSize },
      ],
      { fill: "#000" },
    );
    const group = new Group([line, arrowHead], pos);
    this.mark(group, { swibpRole: "arrow" });
    this.addToCanvas(group);
    return group;
  }

  /** Horizontal progress dots for “slide N of total”. */
  addProgressDots(total = 5, active = 0, y?: number): Group {
    const count = Math.min(12, Math.max(2, Math.round(total)));
    const index = Math.min(count - 1, Math.max(0, Math.round(active)));
    const gap = 28;
    const r = 7;
    const width = (count - 1) * gap;
    const center = this.getLogicalCenter();
    const dots = Array.from({ length: count }, (_, i) => {
      return new Circle({
        left: -width / 2 + i * gap,
        top: 0,
        radius: r,
        originX: "center",
        originY: "center",
        fill: i === index ? this.slotColor("accent", "#111111") : "#d4d4d8",
        selectable: false,
        evented: false,
      });
    });
    const group = new Group(dots, {
      left: center.x,
      top: y ?? center.y + this.getLogicalSize().height * 0.38,
      originX: "center",
      originY: "center",
    });
    this.mark(group, { swibpRole: "progress" });
    this.addToCanvas(group);
    return group;
  }

  addText(text: string, x?: number, y?: number) {
    const pos = this.getPosition(x, y);
    const textbox = new Textbox(text, {
      width: 300,
      fontSize: 32,
      fontFamily: "Inter",
      fill: "#000",
      ...pos,
    });
    this.addToCanvas(textbox);
    const actualWidth = textbox.calcTextWidth();
    if (actualWidth < textbox.width) {
      textbox.set({ width: actualWidth });
      this.canvas.renderAll();
    }
    return textbox;
  }

  deleteSelected() {
    const activeObjects = this.canvas.getActiveObjects();
    activeObjects.forEach((obj) => this.canvas.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  duplicateSelected() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (active.left || 0) + 20,
        top: (active.top || 0) + 20,
      });
      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.canvas.renderAll();
    });
  }


  addHeading(text = "New Heading", x?: number, y?: number): Textbox {
    const pos = this.getPosition(x, y);
    const style = this.textStyle("heading");

    const tb = new Textbox(text, {
      ...pos,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
      fill: this.slotColor("text", "#0f172a"),
      lineHeight: style.lineHeight,
    });
    this.mark(tb, { swibpStyle: "heading", swibpSlot: "text" });

    tb.initDimensions();

    const actualWidth = Math.ceil(tb.calcTextWidth()) + 4;

    tb.set({ width: actualWidth });
    tb.setCoords();

    this.addToCanvas(tb);
    this.canvas.renderAll();

    return tb;
  }

  addSubtitle(text = "Your subtitle goes here", x?: number, y?: number): Textbox {
    const pos = this.getPosition(x, y);
    const style = this.textStyle("subtitle");
    const tb = new Textbox(text, {
      ...pos,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fill: this.slotColor("text", "#0f172a"),
      width: 700,
      lineHeight: style.lineHeight,
    });
    this.mark(tb, { swibpStyle: "subtitle", swibpSlot: "text" });
    this.addToCanvas(tb);
    const actualWidth = tb.calcTextWidth();
    if (actualWidth < tb.width) {
      tb.set({ width: actualWidth });
      this.canvas.renderAll();
    }
    return tb;
  }

  addParagraph(text = "Your paragraph text goes here. Add supporting details and information.", x?: number, y?: number): Textbox {
    const pos = this.getPosition(x, y);
    const style = this.textStyle("body");
    const tb = new Textbox(text, {
      ...pos,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fill: this.slotColor("text", "#0f172a"),
      width: 700,
      lineHeight: style.lineHeight,
    });
    this.mark(tb, { swibpStyle: "body", swibpSlot: "text" });
    this.addToCanvas(tb);
    const actualWidth = tb.calcTextWidth();
    if (actualWidth < tb.width) {
      tb.set({ width: actualWidth });
      this.canvas.renderAll();
    }
    return tb;
  }

  addQuote(text = "First impressions are everything.", x?: number, y?: number): Textbox {
    const pos = this.getPosition(x, y);
    const tb = new Textbox(`❝  ${text}`, {
      ...pos,
      fontSize: 44,
      fontStyle: "italic",
      fontFamily: "Georgia, serif",
      fill: "#475569",
      width: 700,
      lineHeight: 1.5,
    });
    this.addToCanvas(tb);
    const actualWidth = tb.calcTextWidth();
    if (actualWidth < tb.width) {
      tb.set({ width: actualWidth });
      this.canvas.renderAll();
    }
    return tb;
  }

  addHandle(username = "@username", x?: number, y?: number): Group {
    const pos = this.getPosition(x, y);
    const w = 480;

    const handle = new Textbox(username, {
      left: -w / 2,
      top: -36,
      width: w,
      fontSize: 36,
      fontFamily: "Inter, sans-serif",
      fontWeight: "600",
      fill: "#111111",
      textAlign: "center",
    });

    const channel = new Textbox("Your channel", {
      left: -w / 2,
      top: 16,
      width: w,
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      fontWeight: "400",
      fill: "#737373",
      textAlign: "center",
    });

    const group = new Group([handle, channel], pos);
    this.mark(group, { swibpRole: "caption" });
    this.addToCanvas(group);
    return group;
  }

  addDividerLine(x?: number, y?: number): Line {
    const pos = this.getPosition(x, y);
    const w = (this.canvas.width || 1080) * 0.75;
    const line = new Line([0, 0, w, 0], {
      left: pos.left - w / 2,
      top: pos.top,
      stroke: "#cbd5e1",
      strokeWidth: 3,
    });
    this.addToCanvas(line);
    return line;
  }

  addCodeBlock(
    options: Partial<CodeBlockOptions> = {},
    x?: number,
    y?: number,
  ): Group {
    const pos = this.getPosition(x, y);
    const group = buildCodeBlockGroup({ ...DEFAULT_CODE_OPTIONS, ...options });
    group.set({ left: pos.left, top: pos.top });
    this.addToCanvas(group);
    return group;
  }

  updateCodeBlock(group: Group, options: CodeBlockOptions): Group {
    const next = rebuildCodeBlock(group, options);
    this.canvas.remove(group);
    this.canvas.add(next);
    this.canvas.setActiveObject(next);
    this.canvas.renderAll();
    return next;
  }

  private addToCanvas(obj: FabricObject) {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
  }
}
