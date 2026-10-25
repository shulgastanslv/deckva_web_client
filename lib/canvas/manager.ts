import { ActiveSelection, Canvas, FabricObject, Pattern, PencilBrush, Shadow } from "fabric";
import { drawPatternTile, type BackgroundPatternId } from "./background-patterns";
import type { BackgroundConfig, CanvasState } from "./types";
import { CanvasCore } from "./core";
import { GridManager } from "./grid";
import { HistoryStack } from "./history";
import { ImportExportManager } from "./import_export";
import { ObjectFactory } from "./objects";
import { EffectsManager } from "./effects";
import { LayoutManager } from "./layouts";
import { Emitter } from "./events";
import { captureCanvasThumbnail } from "./thumbnail";
import { recolorIcon } from "./recolor-icon";
import { withRemoteImageCors } from "./image-cors";
import { ImageCropSession } from "./crop-session";
import { refreshMask } from "./object-appearance";
import { fitCanvasJSON, fitGeometry, type FrameSize } from "./fit-frame";
import { isAutoFlowSkippable } from "./auto-flow";
import { stabilizeGroups } from "./group";
import { refreshCanvasFonts } from "./paint-live";

const DEFAULT_BACKGROUND = "#ffffff";

export interface CanvasManagerEvents {
  /** The document was changed by the user or by undo/redo and should be persisted. */
  change: CanvasState;
  /** The whole document was replaced via `loadState` (e.g. slide switch). */
  load: CanvasState;
  selection: FabricObject | null;
}

/**
 * Facade over a single Fabric canvas.
 *
 * Feature modules are exposed as-is (`manager.objects.addCircle()`), the manager itself
 * only owns what spans the whole document: state load/save, history, events, selection.
 *
 * Any mutation that does not fire Fabric's `object:added|modified|removed`
 * (background, reordering, etc.) must be followed by `commit()`.
 */
export class CanvasManager {
  readonly canvas: Canvas;
  readonly core: CanvasCore;
  readonly grid: GridManager;
  readonly objects: ObjectFactory;
  readonly io: ImportExportManager;
  readonly effects: EffectsManager;
  readonly layouts: LayoutManager;
  readonly crop: ImageCropSession;

  private readonly history = new HistoryStack<CanvasState>();
  private readonly events = new Emitter<CanvasManagerEvents>();
  private silentDepth = 0;
  private disposed = false;
  private loadAbort: AbortController | null = null;
  private viewportNativeWidth = 0;
  private viewportNativeHeight = 0;
  private readonly onFontsLoaded = () => {
    if (this.disposed) return;
    refreshCanvasFonts(this.canvas);
  };

  constructor(canvasElement: HTMLCanvasElement) {
    this.core = new CanvasCore(canvasElement);
    this.canvas = this.core.canvas;
    this.grid = new GridManager(this.canvas);
    this.objects = new ObjectFactory(this.canvas);
    this.io = new ImportExportManager(this.canvas);
    this.effects = new EffectsManager(this.canvas);
    this.layouts = new LayoutManager(this.canvas);
    this.crop = new ImageCropSession(this.canvas, (changed) => {
      if (this.disposed || this.silentDepth > 0) return;
      if (changed) this.commit();
      this.events.emit("selection", this.getActiveObject());
    });
    this.grid.setLayoutManager(this.layouts);

    this.history.reset(this.getState());
    this.bindCanvasEvents();
    if (typeof document !== "undefined") {
      document.fonts.addEventListener("loadingdone", this.onFontsLoaded);
    }
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  on<K extends keyof CanvasManagerEvents>(
    event: K,
    handler: (payload: CanvasManagerEvents[K]) => void,
  ): () => void {
    return this.events.on(event, handler);
  }

  getState(): CanvasState {
    return this.io.toJSON();
  }

  /** Replaces the document without recording history or emitting `change`. */
  async loadState(state: CanvasState | null): Promise<void> {
    if (this.disposed) return;
    await this.replaceContent(state);
    if (this.disposed) return;
    const loaded = this.getState();
    this.history.reset(loaded);
    this.events.emit("load", loaded);
  }

  /**
   * Several canvas mutations as one undo step.
   * A function that returns false is treated as a no-op and is not recorded.
   */
  transact(run: () => boolean | void): void {
    if (this.disposed) return;
    this.silentDepth++;
    let changed = true;
    try {
      changed = run() !== false;
    } finally {
      this.silentDepth--;
    }
    if (!changed || this.disposed) return;
    this.canvas.requestRenderAll();
    this.commit();
    this.events.emit("selection", this.getActiveObject());
  }

  /**
   * Async multi-step mutations as one undo step (skips intermediate object:added/modified commits).
   */
  async runBatched(run: () => void | Promise<void>): Promise<void> {
    if (this.disposed) return;
    this.silentDepth++;
    try {
      await run();
    } finally {
      this.silentDepth--;
    }
    if (this.disposed) return;
    this.canvas.requestRenderAll();
    this.commit();
    this.events.emit("selection", this.getActiveObject());
  }

  /** Records the current document as a new history step and notifies subscribers. */
  commit(): void {
    if (this.silentDepth > 0) return;
    const state = this.getState();
    this.history.push(state);
    this.events.emit("change", state);
  }

  async undo(): Promise<void> {
    const state = this.history.undo();
    if (state) await this.restoreFromHistory(state);
  }

  async redo(): Promise<void> {
    const state = this.history.redo();
    if (state) await this.restoreFromHistory(state);
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
  }

  getActiveObject(): FabricObject | null {
    return this.canvas.getActiveObject() ?? null;
  }

  updateActiveObject(updates: Partial<FabricObject>): FabricObject | null {
    const active = this.getActiveObject();
    if (!active) return null;

    const targets =
      active instanceof ActiveSelection ? active.getObjects() : [active];
    for (const target of targets) this.paintObject(target, updates);
    if (targets.length > 1) active.setCoords();

    this.canvas.renderAll();
    this.commit();
    this.events.emit("selection", active);
    return active;
  }

  /** Applies a property patch to one object, including each member of a multi-selection. */
  private paintObject(target: FabricObject, updates: Partial<FabricObject>): void {
    const textKeys = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "underline",
      "linethrough",
      "lineHeight",
      "charSpacing",
      "textAlign",
      "backgroundColor",
      "text",
    ] as const;
    const isText = target.type === "textbox" || target.type === "text" || target.type === "i-text";
    const patch = { ...updates } as Partial<FabricObject> & { fill?: unknown; swibpSlot?: string };
    if (!isText) {
      for (const key of textKeys) delete patch[key];
    }

    const icon = target as FabricObject & { swibpIcon?: boolean };
    if (icon.swibpIcon && typeof patch.fill === "string") {
      const fill = patch.fill;
      const slot = "swibpSlot" in patch ? patch.swibpSlot : undefined;
      delete patch.fill;
      delete patch.swibpSlot;
      if (Object.keys(patch).length > 0) target.set(this.cloneShadow(patch));
      recolorIcon(target, fill, slot);
    } else {
      target.set(this.cloneShadow(patch));
    }

    if (!isText) {
      refreshMask(target);
      target.setCoords();
      return;
    }

    const textLike = target as FabricObject & {
      initDimensions?: () => void;
      dirty?: boolean;
      _forceClearCache?: boolean;
    };
    if (
      "fontFamily" in updates ||
      "fontSize" in updates ||
      "fontWeight" in updates ||
      "fontStyle" in updates ||
      "lineHeight" in updates ||
      "charSpacing" in updates ||
      "text" in updates
    ) {
      textLike._forceClearCache = true;
      textLike.dirty = true;
      textLike.initDimensions?.();
    }
    refreshMask(target);
    target.setCoords();
  }

  private cloneShadow(patch: Partial<FabricObject>): Partial<FabricObject> {
    if (!patch.shadow || typeof patch.shadow !== "object") return patch;
    return { ...patch, shadow: new Shadow(patch.shadow) };
  }

  selectObject(obj: FabricObject): void {
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
  }

  removeObject(obj: FabricObject): void {
    this.canvas.remove(obj);
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  moveObjectTo(obj: FabricObject, index: number): void {
    this.canvas.moveObjectTo(obj, index);
    this.canvas.requestRenderAll();
    this.commit();
  }

  async setBackground(config: BackgroundConfig): Promise<void> {
    await this.io.setBackground(config);
    this.commit();
  }

  /** Repeating pattern painted over the current slide color. */
  applyBackgroundPattern(
    id: BackgroundPatternId,
    options?: { fallback?: string; scale?: number; opacity?: number; color?: string | null; commit?: boolean },
  ): void {
    const current = this.canvas.backgroundColor;
    const base = typeof current === "string" ? current : (options?.fallback ?? "#ffffff");
    const tile = drawPatternTile(id, base, {
      scale: options?.scale,
      opacity: options?.opacity,
      color: options?.color,
    });
    this.canvas.backgroundImage = undefined;
    this.canvas.backgroundColor = new Pattern({ source: tile, repeat: "repeat" });
    this.canvas.requestRenderAll();
    if (options?.commit !== false) this.commit();
  }

  /**
   * Keeps the layout when the slide frame changes.
   * Call this before the store updates `canvasDimensions`.
   */
  fitToFrame(from: FrameSize, to: FrameSize): void {
    if (from.width <= 0 || from.height <= 0) return;
    if (from.width === to.width && from.height === to.height) return;

    this.silentDepth++;
    try {
      for (const obj of this.canvas.getObjects()) {
        if (isAutoFlowSkippable(obj)) continue;
        const fitted = fitGeometry(
          {
            type: obj.type,
            left: obj.left,
            top: obj.top,
            width: obj.width,
            height: obj.height,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            originX: obj.originX,
            originY: obj.originY,
            angle: obj.angle,
            strokeWidth: obj.strokeWidth,
          },
          from,
          to,
        );
        obj.set({
          left: fitted.left,
          top: fitted.top,
          scaleX: fitted.scaleX,
          scaleY: fitted.scaleY,
          ...(fitted.width != null ? { width: fitted.width } : {}),
          ...(fitted.strokeWidth != null ? { strokeWidth: fitted.strokeWidth } : {}),
        });
        const shadow = obj.shadow;
        if (shadow && typeof shadow === "object") {
          shadow.blur *= fitted.shadowScale;
          shadow.offsetX *= fitted.shadowScale;
          shadow.offsetY *= fitted.shadowScale;
        }
        if (fitted.width != null && "initDimensions" in obj) {
          const text = obj as { initDimensions?: () => void };
          text.initDimensions?.();
        }
        obj.setCoords();
      }

      const background = this.canvas.backgroundImage;
      if (background && typeof background !== "string") {
        const fitted = fitCanvasJSON(
          {
            version: "6.0.0",
            objects: [],
            backgroundImage: {
              type: background.type,
              left: background.left,
              top: background.top,
              width: background.width,
              height: background.height,
              scaleX: background.scaleX,
              scaleY: background.scaleY,
            },
          },
          from,
          to,
        ).backgroundImage as { left?: number; top?: number; scaleX?: number; scaleY?: number } | undefined;
        if (fitted) {
          background.set({
            left: fitted.left,
            top: fitted.top,
            scaleX: fitted.scaleX,
            scaleY: fitted.scaleY,
          });
        }
      }
      this.canvas.requestRenderAll();
    } finally {
      this.silentDepth--;
    }

    const state = this.getState();
    this.history.rewrite((snap) => fitCanvasJSON(snap, from, to), state);
    this.events.emit("change", state);
    this.events.emit("selection", this.getActiveObject());
  }

  /** Fits the logical canvas (nativeW × nativeH) into the screen at `scale`. */
  setViewportScale(scale: number, nativeW: number, nativeH: number): void {
    const sizeChanged =
      this.viewportNativeWidth !== nativeW || this.viewportNativeHeight !== nativeH;
    this.core.setZoom(scale, nativeW, nativeH);
    if (!sizeChanged) return;
    this.viewportNativeWidth = nativeW;
    this.viewportNativeHeight = nativeH;
    this.effects.onCanvasResize();
    // Overlay was drawn for the previous frame size; rebuild for the new ratio.
    this.grid.redraw();
    this.canvas.renderAll();
  }

  /** Snapshot used for slide strips and project cards. Keeps the previous thumb if export fails. */
  captureThumbnail(): string | null {
    return captureCanvasThumbnail(this.canvas, this.disposed);
  }

  exportThumbnail(multiplier = 1): string {
    const canvas = this.canvas;
    const currentZoom = canvas.getZoom();
    const nativeW = (canvas.width || 1080) / currentZoom;
    const nativeH = (canvas.height || 1080) / currentZoom;

    canvas.setZoom(1);
    canvas.setDimensions({ width: nativeW, height: nativeH });
    canvas.renderAll();

    const dataURL = canvas.toDataURL({ format: "png", multiplier, quality: 1 });

    canvas.setZoom(currentZoom);
    canvas.setDimensions({
      width: Math.round(nativeW * currentZoom),
      height: Math.round(nativeH * currentZoom),
    });
    canvas.renderAll();

    return dataURL;
  }

  enableDrawingMode(): void {
    this.canvas.isDrawingMode = true;
    const brush = new PencilBrush(this.canvas);
    brush.width = 5;
    brush.color = "#000000";
    this.canvas.freeDrawingBrush = brush;
  }

  disableDrawingMode(): void {
    this.canvas.isDrawingMode = false;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (typeof document !== "undefined") {
      document.fonts.removeEventListener("loadingdone", this.onFontsLoaded);
    }
    this.loadAbort?.abort();
    this.loadAbort = null;
    this.events.clear();
    this.grid.dispose();
    this.core.dispose();
  }

  private async restoreFromHistory(state: CanvasState): Promise<void> {
    if (this.disposed) return;
    await this.replaceContent(state);
    if (this.disposed) return;
    this.events.emit("change", this.getState());
  }

  private async replaceContent(state: CanvasState | null): Promise<void> {
    // Fabric's InteractiveCanvas.clear() calls clearContext(contextTop). After dispose
    // (or while upper.ctx is temporarily unset) that throws "clearRect of undefined".
    if (this.disposed || !this.canvas.contextTop) return;

    this.loadAbort?.abort();
    const abort = new AbortController();
    this.loadAbort = abort;

    this.silentDepth++;
    this.crop.cancel();
    try {
      this.canvas.discardActiveObject();
      if (state) {
        await this.canvas.loadFromJSON(withRemoteImageCors(state), undefined, { signal: abort.signal });
      } else if (this.canvas.contextTop) {
        this.canvas.clear();
      }
      if (this.disposed || abort.signal.aborted || !this.canvas.contextTop) return;
      stabilizeGroups(this.canvas.getObjects());
      if (!this.canvas.backgroundColor) {
        this.canvas.backgroundColor = DEFAULT_BACKGROUND;
      }
      this.grid.redraw();
      this.canvas.requestRenderAll();
      this.events.emit("selection", null);
    } catch (error) {
      if (this.disposed || abort.signal.aborted) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      throw error;
    } finally {
      if (this.loadAbort === abort) this.loadAbort = null;
      this.silentDepth--;
    }
  }

  private bindCanvasEvents(): void {
    // Callers also fire "object:modified" manually without a payload.
    const onMutation = (e?: { target?: FabricObject }) => {
      if (e?.target?.excludeFromExport) return;
      this.commit();
    };
    const onSelection = () => {
      if (this.silentDepth > 0) return;
      if (this.crop.active && this.getActiveObject() !== this.crop.image) this.crop.apply();
      this.events.emit("selection", this.getActiveObject());
    };

    this.canvas.on("mouse:dblclick", (e) => {
      if (this.crop.active) return;
      const target = e.target as FabricObject & { swibpRole?: string } | undefined;
      if (target?.swibpRole === "split") this.objects.pickSplitImage();
      else if (target?.swibpRole === "frame") this.objects.pickFrameImage(target);
      else if (target) this.objects.pickShapeImage(target);
    });

    this.canvas.on("object:added", (e) => {
      if (e.target?.type === "group") stabilizeGroups([e.target]);
      onMutation(e);
    });
    this.canvas.on("object:removed", onMutation);
    this.canvas.on("object:modified", onMutation);
    this.canvas.on("selection:created", onSelection);
    this.canvas.on("selection:updated", onSelection);
    this.canvas.on("selection:cleared", onSelection);
  }
}
