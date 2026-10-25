import {
  Image as FabricImage,
  Point,
  util,
  type Canvas,
  type FabricObject,
  type TPointerEventInfo,
} from "fabric";

type SavedInteraction = {
  selectable: boolean | undefined;
  evented: boolean | undefined;
  hoverCursor: string | undefined;
};

const DEFAULT_RADIUS = 22;

/**
 * Brush-erase alpha on Fabric images (destination-out).
 * One mouse stroke = one undo step after pointer up.
 */
export class ImageEraserSession {
  private enabled = false;
  private drawing = false;
  private dirty = false;
  private radius = DEFAULT_RADIUS;
  private image: FabricImage | null = null;
  private working: HTMLCanvasElement | null = null;
  private lastLocal: Point | null = null;
  private readonly saved = new Map<FabricObject, SavedInteraction>();
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly canvas: Canvas,
    private readonly onStrokeEnd: (changed: boolean) => void,
  ) {}

  get active() {
    return this.enabled;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setRadius(radius: number) {
    this.radius = Math.max(4, Math.min(120, radius));
    this.notify();
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.canvas.discardActiveObject();
    this.canvas.selection = false;
    this.canvas.defaultCursor = "cell";
    this.canvas.hoverCursor = "cell";

    for (const obj of this.canvas.getObjects()) {
      this.saved.set(obj, {
        selectable: obj.selectable,
        evented: obj.evented,
        hoverCursor: obj.hoverCursor,
      });
      const isImage = obj.type === "image";
      obj.set({
        selectable: false,
        evented: isImage,
        hoverCursor: isImage ? "cell" : "default",
      });
    }

    this.canvas.on("mouse:down", this.onDown);
    this.canvas.on("mouse:move", this.onMove);
    this.canvas.on("mouse:up", this.onUp);
    this.canvas.requestRenderAll();
    this.notify();
  }

  disable() {
    if (!this.enabled) return;
    if (this.drawing) void this.endStroke();
    this.enabled = false;
    this.canvas.off("mouse:down", this.onDown);
    this.canvas.off("mouse:move", this.onMove);
    this.canvas.off("mouse:up", this.onUp);
    this.canvas.selection = true;
    this.canvas.defaultCursor = "default";
    this.canvas.hoverCursor = "move";

    for (const obj of this.canvas.getObjects()) {
      const snap = this.saved.get(obj);
      if (!snap) continue;
      obj.set({
        selectable: snap.selectable,
        evented: snap.evented,
        hoverCursor: snap.hoverCursor,
      });
    }
    this.saved.clear();
    this.canvas.requestRenderAll();
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }

  private onDown = (event: TPointerEventInfo) => {
    if (!this.enabled || this.drawing) return;
    const target = event.target;
    if (!target || target.type !== "image") return;
    void this.beginStroke(target as FabricImage, event.scenePoint);
  };

  private onMove = (event: TPointerEventInfo) => {
    if (!this.drawing || !this.image || !this.working || !this.lastLocal) return;
    const local = this.toImagePoint(this.image, event.scenePoint);
    if (!local) return;
    this.stampLine(this.lastLocal, local);
    this.lastLocal = local;
    this.paintLive();
  };

  private onUp = () => {
    if (!this.drawing) return;
    void this.endStroke();
  };

  private async beginStroke(img: FabricImage, scene: Point) {
    const local = this.toImagePoint(img, scene);
    if (!local) return;

    const working = rasterizeImage(img);
    if (!working) return;

    this.drawing = true;
    this.dirty = false;
    this.image = img;
    this.working = working;
    this.lastLocal = local;
    this.stamp(local.x, local.y);
    this.paintLive();
  }

  private async endStroke() {
    const img = this.image;
    const working = this.working;
    const changed = this.dirty;
    this.drawing = false;
    this.image = null;
    this.working = null;
    this.lastLocal = null;

    if (!img || !working) {
      this.onStrokeEnd(false);
      return;
    }

    try {
      const dataUrl = working.toDataURL("image/png");
      await img.setSrc(dataUrl, { crossOrigin: "anonymous" });
      img.set({
        cropX: 0,
        cropY: 0,
        width: working.width,
        height: working.height,
        dirty: true,
      });
      img.setCoords();
      this.canvas.requestRenderAll();
    } catch (err) {
      console.error("eraser finalize:", err);
      this.onStrokeEnd(false);
      return;
    }

    this.onStrokeEnd(changed);
  }

  private paintLive() {
    if (!this.image || !this.working) return;
    this.image.setElement(this.working);
    this.image.set({
      cropX: 0,
      cropY: 0,
      width: this.working.width,
      height: this.working.height,
      dirty: true,
    });
    this.canvas.requestRenderAll();
  }

  private stampLine(from: Point, to: Point) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(1, this.radius * 0.35);
    const count = Math.max(1, Math.ceil(dist / step));
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      this.stamp(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  }

  private stamp(x: number, y: number) {
    if (!this.working) return;
    const ctx = this.working.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.dirty = true;
  }

  private toImagePoint(img: FabricImage, scene: Point): Point | null {
    const inv = util.invertTransform(img.calcTransformMatrix());
    const local = util.transformPoint(scene, inv);
    const x = local.x + (img.width || 0) / 2;
    const y = local.y + (img.height || 0) / 2;
    if (x < -this.radius || y < -this.radius) return null;
    if (x > (img.width || 0) + this.radius || y > (img.height || 0) + this.radius) return null;
    return new Point(x, y);
  }
}

function rasterizeImage(img: FabricImage): HTMLCanvasElement | null {
  const el = img.getElement();
  if (!el) return null;
  const width = Math.max(1, Math.round(img.width || 1));
  const height = Math.max(1, Math.round(img.height || 1));
  const cropX = img.cropX || 0;
  const cropY = img.cropY || 0;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(el, cropX, cropY, width, height, 0, 0, width, height);
  } catch (err) {
    console.error("eraser rasterize:", err);
    return null;
  }
  return canvas;
}
