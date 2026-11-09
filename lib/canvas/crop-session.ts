import {
  Point,
  Rect,
  type Canvas,
  type FabricObject,
  type TPointerEventInfo,
} from "fabric";
import {
  clampImageCenterToCover,
  frameInSource,
  largestWindow,
  sceneDelta,
  sourceDelta,
  windowAtZoom,
} from "./crop";

const MAX_ZOOM = 4;
const MIN_WINDOW = 8;

type CropImage = FabricObject & {
  cropX: number;
  cropY: number;
  getOriginalSize(): { width: number; height: number };
};

type Interaction = {
  lockMovementX: boolean;
  lockMovementY: boolean;
  lockScalingX: boolean;
  lockScalingY: boolean;
  lockRotation: boolean;
  hasControls: boolean;
  hasBorders: boolean;
  hoverCursor: string | undefined;
  selectable: boolean | undefined;
  evented: boolean | undefined;
};

type Snapshot = Interaction & {
  cropX: number;
  cropY: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  left: number;
  top: number;
  originX: string | undefined;
  originY: string | undefined;
  clipPath: FabricObject | undefined;
};

/**
 * Canva-style crop: expand the full photo, dim outside a fixed frame,
 * pan / zoom under the frame, then bake cropX/Y/width/height on Done.
 */
export class ImageCropSession {
  image: CropImage | null = null;
  zoom = 1;
  maxZoom = MAX_ZOOM;

  private snapshot: Snapshot | null = null;
  private frameCenter = new Point(0, 0);
  private frame = { w: 1, h: 1 };
  private cover = { width: 1, height: 1 };
  private natural = { width: 1, height: 1 };
  private angle = 0;
  private flipX = false;
  private flipY = false;
  private veil: Rect | null = null;
  private frameStroke: Rect | null = null;
  private dragging = false;
  private last: { x: number; y: number } | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly canvas: Canvas,
    private readonly onFinish: (changed: boolean) => void,
  ) {}

  get active() {
    return this.image != null;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(target: FabricObject | null) {
    if (!target || target.type !== "image") return false;
    if (this.image === target) return true;
    if (this.image) this.apply();

    const img = target as CropImage;
    const natural = img.getOriginalSize();
    if (!natural.width || !natural.height || !img.width || !img.height) return false;

    const scaleX = img.scaleX || 1;
    const scaleY = img.scaleY || 1;
    const cropX = img.cropX || 0;
    const cropY = img.cropY || 0;
    const cropW = img.width;
    const cropH = img.height;

    this.snapshot = {
      cropX,
      cropY,
      width: cropW,
      height: cropH,
      scaleX,
      scaleY,
      left: img.left ?? 0,
      top: img.top ?? 0,
      originX: img.originX as string | undefined,
      originY: img.originY as string | undefined,
      lockMovementX: Boolean(img.lockMovementX),
      lockMovementY: Boolean(img.lockMovementY),
      lockScalingX: Boolean(img.lockScalingX),
      lockScalingY: Boolean(img.lockScalingY),
      lockRotation: Boolean(img.lockRotation),
      hasControls: img.hasControls !== false,
      hasBorders: img.hasBorders !== false,
      hoverCursor: img.hoverCursor,
      selectable: img.selectable,
      evented: img.evented,
      clipPath: img.clipPath as FabricObject | undefined,
    };

    this.frame = {
      w: Math.abs(cropW * scaleX),
      h: Math.abs(cropH * scaleY),
    };
    const center = img.getCenterPoint();
    this.frameCenter = new Point(center.x, center.y);
    this.natural = natural;
    this.angle = img.angle || 0;
    this.flipX = Boolean(img.flipX);
    this.flipY = Boolean(img.flipY);

    const ratio = this.frame.w / this.frame.h;
    this.cover = largestWindow(natural.width, natural.height, ratio);
    this.zoom = this.cover.width / cropW;
    this.maxZoom = Math.max(1, Math.min(MAX_ZOOM, this.cover.width / MIN_WINDOW));

    this.image = img;
    img.set({
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      hasBorders: false,
      hoverCursor: "grab",
      selectable: true,
      evented: true,
      // Expand to the full bitmap for live reframing.
      cropX: 0,
      cropY: 0,
      width: natural.width,
      height: natural.height,
      originX: "center",
      originY: "center",
      clipPath: undefined,
    });

    this.applyZoomTransform(this.zoom, {
      // Keep the previous crop window under the frame.
      srcFocusX: cropX + cropW / 2,
      srcFocusY: cropY + cropH / 2,
    });

    this.mountChrome();
    this.canvas.setActiveObject(img);
    this.canvas.on("mouse:down", this.onDown);
    this.canvas.on("mouse:move", this.onMove);
    this.canvas.on("mouse:up", this.onUp);
    this.canvas.on("mouse:wheel", this.onWheel);
    this.canvas.requestRenderAll();
    this.notify();
    return true;
  }

  setZoom(next: number) {
    if (!this.image) return;
    const zoom = Math.min(this.maxZoom, Math.max(1, next));
    if (Math.abs(zoom - this.zoom) < 0.0001) return;
    this.applyZoomTransform(zoom);
    this.zoom = zoom;
    this.canvas.requestRenderAll();
    this.notify();
  }

  apply() {
    if (!this.image || !this.snapshot) return;
    const img = this.image;
    const snap = this.snapshot;
    const center = img.getCenterPoint();
    const scaleX = img.scaleX || 1;
    const scaleY = img.scaleY || 1;

    const placed = frameInSource(
      { x: center.x, y: center.y },
      this.frameCenter,
      this.frame.w,
      this.frame.h,
      this.natural.width,
      this.natural.height,
      this.angle,
      scaleX,
      scaleY,
      this.flipX,
      this.flipY,
    );

    img.set({
      cropX: placed.cropX,
      cropY: placed.cropY,
      width: placed.width,
      height: placed.height,
      scaleX: this.frame.w / placed.width,
      scaleY: this.frame.h / placed.height,
      originX: "center",
      originY: "center",
      left: this.frameCenter.x,
      top: this.frameCenter.y,
      dirty: true,
    });

    this.restoreClipPath(snap.clipPath, placed.width, placed.height, snap.width, snap.height);
    img.setCoords();

    const changed = this.changedFromSnapshot(snap, placed);
    this.restoreInteraction();
    this.end();
    this.canvas.requestRenderAll();
    this.onFinish(changed);
  }

  cancel() {
    if (!this.image || !this.snapshot) return;
    const img = this.image;
    const snap = this.snapshot;
    img.set({
      cropX: snap.cropX,
      cropY: snap.cropY,
      width: snap.width,
      height: snap.height,
      scaleX: snap.scaleX,
      scaleY: snap.scaleY,
      left: snap.left,
      top: snap.top,
      originX: snap.originX,
      originY: snap.originY,
      clipPath: snap.clipPath,
      dirty: true,
    });
    img.setCoords();
    this.restoreInteraction();
    this.end();
    this.canvas.requestRenderAll();
    this.onFinish(false);
  }

  private onDown = (event: TPointerEventInfo) => {
    if (!this.image) return;
    if (event.target !== this.image) {
      this.apply();
      return;
    }
    this.dragging = true;
    this.last = { x: event.scenePoint.x, y: event.scenePoint.y };
    this.image.set({ hoverCursor: "grabbing" });
  };

  private onMove = (event: TPointerEventInfo) => {
    if (!this.dragging || !this.image || !this.last) return;
    const point = event.scenePoint;
    const dx = point.x - this.last.x;
    const dy = point.y - this.last.y;
    this.last = { x: point.x, y: point.y };

    const center = this.image.getCenterPoint();
    const next = {
      x: center.x + dx,
      y: center.y + dy,
    };
    const clamped = clampImageCenterToCover(
      next,
      this.frameCenter,
      this.frame.w,
      this.frame.h,
      this.natural.width,
      this.natural.height,
      this.angle,
      this.image.scaleX || 1,
      this.image.scaleY || 1,
      this.flipX,
      this.flipY,
    );
    this.image.set({ left: clamped.x, top: clamped.y, originX: "center", originY: "center" });
    this.image.setCoords();
    this.canvas.requestRenderAll();
  };

  private onUp = () => {
    this.dragging = false;
    this.last = null;
    this.image?.set({ hoverCursor: "grab" });
  };

  private onWheel = (event: TPointerEventInfo & { e: WheelEvent }) => {
    if (!this.image || !this.active) return;
    const e = event.e;
    if (!e) return;
    e.preventDefault();
    e.stopPropagation();
    const pixels =
      e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    this.setZoom(this.zoom * Math.exp(-pixels * 0.0018));
  };

  private applyZoomTransform(
    zoom: number,
    focus?: { srcFocusX: number; srcFocusY: number },
  ) {
    const img = this.image;
    if (!img) return;

    const size = windowAtZoom(this.cover, zoom);
    const scaleX = this.frame.w / size.width;
    const scaleY = this.frame.h / size.height;

    let srcFocusX: number;
    let srcFocusY: number;
    if (focus) {
      srcFocusX = focus.srcFocusX;
      srcFocusY = focus.srcFocusY;
    } else {
      const center = img.getCenterPoint();
      const placed = frameInSource(
        { x: center.x, y: center.y },
        this.frameCenter,
        this.frame.w,
        this.frame.h,
        this.natural.width,
        this.natural.height,
        this.angle,
        img.scaleX || 1,
        img.scaleY || 1,
        this.flipX,
        this.flipY,
      );
      srcFocusX = placed.cropX + placed.width / 2;
      srcFocusY = placed.cropY + placed.height / 2;
    }

    // Image center should map source point (srcFocus) onto frameCenter.
    const srcOffsetX = srcFocusX - this.natural.width / 2;
    const srcOffsetY = srcFocusY - this.natural.height / 2;
    const shift = sceneDelta(
      -srcOffsetX,
      -srcOffsetY,
      this.angle,
      scaleX,
      scaleY,
      this.flipX,
      this.flipY,
    );

    let left = this.frameCenter.x + shift.x;
    let top = this.frameCenter.y + shift.y;
    const clamped = clampImageCenterToCover(
      { x: left, y: top },
      this.frameCenter,
      this.frame.w,
      this.frame.h,
      this.natural.width,
      this.natural.height,
      this.angle,
      scaleX,
      scaleY,
      this.flipX,
      this.flipY,
    );

    img.set({
      scaleX,
      scaleY,
      left: clamped.x,
      top: clamped.y,
      originX: "center",
      originY: "center",
      dirty: true,
    });
    img.setCoords();
    this.zoom = zoom;
  }

  private mountChrome() {
    this.unmountChrome();
    const zoom = this.canvas.getZoom() || 1;
    const cw = (this.canvas.getWidth() || 1080) / zoom;
    const ch = (this.canvas.getHeight() || 1080) / zoom;

    const hole = new Rect({
      left: this.frameCenter.x,
      top: this.frameCenter.y,
      originX: "center",
      originY: "center",
      width: this.frame.w,
      height: this.frame.h,
      angle: this.angle,
      absolutePositioned: true,
      inverted: true,
    });

    // Oversized so viewport pan still covers.
    this.veil = new Rect({
      left: cw / 2,
      top: ch / 2,
      originX: "center",
      originY: "center",
      width: Math.max(cw, ch) * 4,
      height: Math.max(cw, ch) * 4,
      fill: "rgba(0,0,0,0.45)",
      selectable: false,
      evented: false,
      excludeFromExport: true,
      hoverCursor: "default",
      objectCaching: false,
    });
    this.veil.clipPath = hole;

    this.frameStroke = new Rect({
      left: this.frameCenter.x,
      top: this.frameCenter.y,
      originX: "center",
      originY: "center",
      width: this.frame.w,
      height: this.frame.h,
      angle: this.angle,
      fill: "transparent",
      stroke: "rgba(255,255,255,0.95)",
      strokeWidth: 2,
      strokeUniform: true,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      objectCaching: false,
    });

    // Added last → sit above the expanded photo; inverted hole keeps the frame clear.
    this.canvas.add(this.veil, this.frameStroke);
  }

  private unmountChrome() {
    if (this.veil) {
      this.canvas.remove(this.veil);
      this.veil = null;
    }
    if (this.frameStroke) {
      this.canvas.remove(this.frameStroke);
      this.frameStroke = null;
    }
  }

  private restoreClipPath(
    clip: FabricObject | undefined,
    nextW: number,
    nextH: number,
    prevW: number,
    prevH: number,
  ) {
    if (!this.image) return;
    if (!clip) {
      this.image.clipPath = undefined;
      return;
    }
    clip.set({
      scaleX: (clip.scaleX || 1) * (nextW / (prevW || 1)),
      scaleY: (clip.scaleY || 1) * (nextH / (prevH || 1)),
      dirty: true,
    });
    this.image.clipPath = clip;
  }

  private restoreInteraction() {
    const snap = this.snapshot;
    if (!this.image || !snap) return;
    this.image.set({
      lockMovementX: snap.lockMovementX,
      lockMovementY: snap.lockMovementY,
      lockScalingX: snap.lockScalingX,
      lockScalingY: snap.lockScalingY,
      lockRotation: snap.lockRotation,
      hasControls: snap.hasControls,
      hasBorders: snap.hasBorders,
      hoverCursor: snap.hoverCursor,
      selectable: snap.selectable,
      evented: snap.evented,
    });
  }

  private changedFromSnapshot(
    snap: Snapshot,
    placed: { cropX: number; cropY: number; width: number; height: number },
  ) {
    return (
      Math.abs(placed.cropX - snap.cropX) > 0.5 ||
      Math.abs(placed.cropY - snap.cropY) > 0.5 ||
      Math.abs(placed.width - snap.width) > 0.5 ||
      Math.abs(placed.height - snap.height) > 0.5
    );
  }

  private end() {
    this.canvas.off("mouse:down", this.onDown);
    this.canvas.off("mouse:move", this.onMove);
    this.canvas.off("mouse:up", this.onUp);
    this.canvas.off("mouse:wheel", this.onWheel);
    this.unmountChrome();
    this.image = null;
    this.snapshot = null;
    this.dragging = false;
    this.last = null;
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}
