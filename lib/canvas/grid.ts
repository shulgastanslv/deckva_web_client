import {
  Canvas,
  Line,
  Rect,
  Pattern,
  Object as FabricObject,
  Point,
  util,
} from "fabric";
import { LayoutManager } from "./layouts";
import { isPinnedRole } from "./roles";
import { splitFrame, type CanvasSplit } from "./splits";

type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export interface GridSettings {
  columns: number;
  rows: number;
  margin: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
}

/**
 * Figma-style layout grid (columns × rows + margin) + smart guides.
 * While an object is dragged it snaps to the edges and centers of its
 * neighbors, and to the slide. When snap is on and the grid is visible,
 * objects also snap to layout lines.
 */
export class GridManager {
  private canvas: Canvas;
  public isGridVisible = false;
  private gridColumns = 4;
  private gridRows = 4;
  private gridMargin = 64;
  private gridColor = "#9747FF";
  private gridOpacity = 0.16;
  private snapToGrid = true;
  private gridOverlay: Rect | null = null;
  private guideLines: Line[] = [];
  private snapThreshold = 8;
  private layoutManager: LayoutManager | null = null;
  private disposed = false;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.setupSmartGuides();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clearGuides();
    this.hideGrid();
  }

  public setLayoutManager(manager: LayoutManager) {
    this.layoutManager = manager;
  }

  /** Image area for a screen split, using the same size and margin as the layout grid. */
  public splitBounds(split: CanvasSplit) {
    const { width, height } = this.getLogicalSize();
    return splitFrame(split, { width, height }, this.gridMargin);
  }

  public applySettings(settings: Partial<GridSettings>) {
    if (settings.columns != null) {
      this.gridColumns = Math.max(0, Math.min(24, Math.round(settings.columns)));
    }
    if (settings.rows != null) {
      this.gridRows = Math.max(0, Math.min(24, Math.round(settings.rows)));
    }
    if (settings.margin != null) {
      this.gridMargin = Math.max(0, Math.round(settings.margin));
    }
    if (settings.color != null) this.gridColor = settings.color;
    if (settings.opacity != null) {
      this.gridOpacity = Math.min(1, Math.max(0, settings.opacity));
    }
    if (settings.snapToGrid != null) this.snapToGrid = settings.snapToGrid;
    if (this.isGridVisible) this.refreshGrid();
  }

  public setSnapToGrid(enabled: boolean) {
    this.snapToGrid = enabled;
  }

  public setSnapThreshold(px: number) {
    this.snapThreshold = Math.max(2, px);
  }

  public toggleGrid() {
    if (this.isGridVisible) this.hideGrid();
    else this.showGrid();
  }

  public showGrid() {
    this.isGridVisible = true;
    this.refreshGrid();
  }

  public setVisible(visible: boolean) {
    if (visible) this.showGrid();
    else this.hideGrid();
  }

  /** Canvas content was replaced (loadFromJSON/clear) and the grid overlay is gone. */
  public redraw() {
    if (this.isGridVisible) this.refreshGrid();
  }

  public hideGrid() {
    this.isGridVisible = false;
    if (this.gridOverlay) {
      this.canvas.remove(this.gridOverlay);
      this.gridOverlay = null;
    }
    this.canvas.requestRenderAll();
  }

  /** Instantly center the active object on the canvas. */
  public centerObject(
    obj: FabricObject,
    axis: "horizontal" | "vertical" | "both" = "both",
  ): void {
    const { width, height } = this.getLogicalSize();
    const center = obj.getCenterPoint();
    const next = new Point(
      axis === "vertical" ? center.x : width / 2,
      axis === "horizontal" ? center.y : height / 2,
    );
    this.setCenter(obj, next.x, next.y);
    this.canvas.requestRenderAll();
  }

  private getLogicalSize() {
    const zoom = this.canvas.getZoom() || 1;
    return {
      width: (this.canvas.getWidth() || 1080) / zoom,
      height: (this.canvas.getHeight() || 1080) / zoom,
      zoom,
    };
  }

  private getBounds(obj: FabricObject): Bounds {
    const center = obj.getCenterPoint();
    const width = obj.getScaledWidth();
    const height = obj.getScaledHeight();
    return {
      left: center.x - width / 2,
      top: center.y - height / 2,
      right: center.x + width / 2,
      bottom: center.y + height / 2,
      width,
      height,
      centerX: center.x,
      centerY: center.y,
    };
  }

  private setCenter(obj: FabricObject, x: number, y: number) {
    const scene = new Point(x, y);
    // Grouped objects store left/top in the parent plane. Snap math is in
    // scene space, so write it back through the group's transform.
    const local = obj.group
      ? scene.transform(util.invertTransform(obj.group.calcTransformMatrix()))
      : scene;
    obj.setPositionByOrigin(local, "center", "center");
    obj.setCoords();
  }

  private isSnapTarget(obj: FabricObject): boolean {
    if (obj === this.gridOverlay) return false;
    if (obj.excludeFromExport) return false;
    if (obj.selectable === false && obj.evented === false) return false;
    return true;
  }

  private resolvedColor(): string {
    const hex = this.gridColor.replace("#", "");
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex.slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16) || 0;
    const g = parseInt(full.slice(2, 4), 16) || 0;
    const b = parseInt(full.slice(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${this.gridOpacity})`;
  }

  private getLayoutMetrics(width: number, height: number) {
    const margin = Math.min(
      this.gridMargin,
      Math.floor(width / 2),
      Math.floor(height / 2),
    );
    const innerW = Math.max(0, width - margin * 2);
    const innerH = Math.max(0, height - margin * 2);
    const columns = this.gridColumns;
    const rows = this.gridRows;

    const xs: number[] = [];
    const ys: number[] = [];

    if (columns > 0) {
      for (let i = 0; i <= columns; i++) {
        xs.push(margin + (innerW * i) / columns);
      }
    }
    if (rows > 0) {
      for (let i = 0; i <= rows; i++) {
        ys.push(margin + (innerH * i) / rows);
      }
    }

    return { margin, innerW, innerH, columns, rows, xs, ys };
  }

  /** Full-canvas layout grid (Figma-style columns / rows + margin). */
  private createLayoutSource(width: number, height: number): HTMLCanvasElement {
    const tile = document.createElement("canvas");
    tile.width = Math.max(1, Math.round(width));
    tile.height = Math.max(1, Math.round(height));
    const ctx = tile.getContext("2d");
    if (!ctx) return tile;

    const { margin, innerW, innerH, columns, rows, xs, ys } =
      this.getLayoutMetrics(tile.width, tile.height);
    const fill = this.resolvedColor();
    const line = fill.replace(
      /rgba\((\d+),(\d+),(\d+),([0-9.]+)\)/,
      (_, r, g, b, a) =>
        `rgba(${r},${g},${b},${Math.min(1, Number(a) * 1.6)})`,
    );

    // Column bands (zebra) — Figma-like.
    if (columns > 0 && innerW > 0) {
      const colW = innerW / columns;
      for (let i = 0; i < columns; i++) {
        if (i % 2 === 1) continue;
        ctx.fillStyle = fill;
        ctx.fillRect(margin + i * colW, margin, colW, innerH);
      }
    }

    // Row bands (lighter zebra).
    if (rows > 0 && innerH > 0) {
      const rowH = innerH / rows;
      for (let i = 0; i < rows; i++) {
        if (i % 2 === 1) continue;
        ctx.fillStyle = fill;
        ctx.globalAlpha = 0.45;
        ctx.fillRect(margin, margin + i * rowH, innerW, rowH);
        ctx.globalAlpha = 1;
      }
    }

    // Division lines + margin frame.
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const x of xs) {
      ctx.moveTo(x + 0.5, margin);
      ctx.lineTo(x + 0.5, margin + innerH);
    }
    for (const y of ys) {
      ctx.moveTo(margin, y + 0.5);
      ctx.lineTo(margin + innerW, y + 0.5);
    }
    ctx.stroke();

    return tile;
  }

  private refreshGrid() {
    if (this.gridOverlay) {
      this.canvas.remove(this.gridOverlay);
      this.gridOverlay = null;
    }

    const { width, height } = this.getLogicalSize();
    if (this.gridColumns <= 0 && this.gridRows <= 0) {
      this.canvas.requestRenderAll();
      return;
    }

    const pattern = new Pattern({
      source: this.createLayoutSource(width, height),
      repeat: "no-repeat",
    });

    this.gridOverlay = new Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: pattern,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      objectCaching: false,
    });

    this.canvas.add(this.gridOverlay);
    this.canvas.sendObjectToBack(this.gridOverlay);
    this.canvas.requestRenderAll();
  }

  private setupSmartGuides() {
    this.canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj || obj.excludeFromExport) return;
      if (isPinnedRole(obj)) return;

      const guidesActive = true;
      const gridSnapActive = this.snapToGrid && this.isGridVisible;

      if (!guidesActive && !gridSnapActive) {
        this.clearGuides();
        return;
      }

      this.clearGuides();
      this.snapWhileMoving(obj, guidesActive, gridSnapActive);
    });

    this.canvas.on("mouse:up", () => this.clearGuides());
    this.canvas.on("selection:cleared", () => this.clearGuides());
  }

  private snapWhileMoving(
    obj: FabricObject,
    guidesActive: boolean,
    gridSnapActive: boolean,
  ) {
    const { width, height, zoom } = this.getLogicalSize();
    const threshold = this.snapThreshold / zoom;
    let bounds = this.getBounds(obj);

    let nextCX = bounds.centerX;
    let nextCY = bounds.centerY;
    let snappedX = false;
    let snappedY = false;

    if (guidesActive) {
      const canvasCX = width / 2;
      const canvasCY = height / 2;

      if (Math.abs(bounds.centerX - canvasCX) < threshold) {
        nextCX = canvasCX;
        snappedX = true;
        this.drawVerticalGuide(canvasCX);
      }
      if (Math.abs(bounds.centerY - canvasCY) < threshold) {
        nextCY = canvasCY;
        snappedY = true;
        this.drawHorizontalGuide(canvasCY);
      }

      if (!snappedX) {
        if (Math.abs(bounds.left) < threshold) {
          nextCX = bounds.width / 2;
          snappedX = true;
          this.drawVerticalGuide(0);
        } else if (Math.abs(bounds.right - width) < threshold) {
          nextCX = width - bounds.width / 2;
          snappedX = true;
          this.drawVerticalGuide(width);
        }
      }
      if (!snappedY) {
        if (Math.abs(bounds.top) < threshold) {
          nextCY = bounds.height / 2;
          snappedY = true;
          this.drawHorizontalGuide(0);
        } else if (Math.abs(bounds.bottom - height) < threshold) {
          nextCY = height - bounds.height / 2;
          snappedY = true;
          this.drawHorizontalGuide(height);
        }
      }

      const others = this.canvas
        .getObjects()
        .filter((o) => o !== obj && this.isSnapTarget(o));

      for (const other of others) {
        const o = this.getBounds(other);

        if (!snappedX) {
          if (Math.abs(bounds.centerX - o.centerX) < threshold) {
            nextCX = o.centerX;
            snappedX = true;
            this.drawVerticalGuide(o.centerX);
          } else if (Math.abs(bounds.left - o.left) < threshold) {
            nextCX = o.left + bounds.width / 2;
            snappedX = true;
            this.drawVerticalGuide(o.left);
          } else if (Math.abs(bounds.right - o.right) < threshold) {
            nextCX = o.right - bounds.width / 2;
            snappedX = true;
            this.drawVerticalGuide(o.right);
          } else if (Math.abs(bounds.left - o.right) < threshold) {
            nextCX = o.right + bounds.width / 2;
            snappedX = true;
            this.drawVerticalGuide(o.right);
          } else if (Math.abs(bounds.right - o.left) < threshold) {
            nextCX = o.left - bounds.width / 2;
            snappedX = true;
            this.drawVerticalGuide(o.left);
          }
        }

        if (!snappedY) {
          if (Math.abs(bounds.centerY - o.centerY) < threshold) {
            nextCY = o.centerY;
            snappedY = true;
            this.drawHorizontalGuide(o.centerY);
          } else if (Math.abs(bounds.top - o.top) < threshold) {
            nextCY = o.top + bounds.height / 2;
            snappedY = true;
            this.drawHorizontalGuide(o.top);
          } else if (Math.abs(bounds.bottom - o.bottom) < threshold) {
            nextCY = o.bottom - bounds.height / 2;
            snappedY = true;
            this.drawHorizontalGuide(o.bottom);
          } else if (Math.abs(bounds.top - o.bottom) < threshold) {
            nextCY = o.bottom + bounds.height / 2;
            snappedY = true;
            this.drawHorizontalGuide(o.bottom);
          } else if (Math.abs(bounds.bottom - o.top) < threshold) {
            nextCY = o.top - bounds.height / 2;
            snappedY = true;
            this.drawHorizontalGuide(o.top);
          }
        }
      }

      if (this.layoutManager?.getIsLayoutActive()) {
        const result = this.snapToLayoutFrames(
          obj,
          bounds,
          threshold,
          nextCX,
          nextCY,
          snappedX,
          snappedY,
        );
        nextCX = result.nextCX;
        nextCY = result.nextCY;
        snappedX = result.snappedX;
        snappedY = result.snappedY;
      }
    }

    if (gridSnapActive) {
      bounds = {
        ...this.getBounds(obj),
        // Use tentative center if we already snapped via guides
        centerX: snappedX ? nextCX : this.getBounds(obj).centerX,
        centerY: snappedY ? nextCY : this.getBounds(obj).centerY,
      };
      // Recompute edges from tentative center
      bounds.left = nextCX - bounds.width / 2;
      bounds.right = nextCX + bounds.width / 2;
      bounds.top = nextCY - bounds.height / 2;
      bounds.bottom = nextCY + bounds.height / 2;
      bounds.centerX = nextCX;
      bounds.centerY = nextCY;

      if (!snappedX) {
        const { xs } = this.getLayoutMetrics(width, height);
        for (const lineX of xs) {
          if (Math.abs(bounds.left - lineX) < threshold) {
            nextCX = lineX + bounds.width / 2;
            snappedX = true;
            this.drawVerticalGuide(lineX);
            break;
          }
          if (Math.abs(bounds.centerX - lineX) < threshold) {
            nextCX = lineX;
            snappedX = true;
            this.drawVerticalGuide(lineX);
            break;
          }
          if (Math.abs(bounds.right - lineX) < threshold) {
            nextCX = lineX - bounds.width / 2;
            snappedX = true;
            this.drawVerticalGuide(lineX);
            break;
          }
        }
      }

      if (!snappedY) {
        const { ys } = this.getLayoutMetrics(width, height);
        for (const lineY of ys) {
          if (Math.abs(bounds.top - lineY) < threshold) {
            nextCY = lineY + bounds.height / 2;
            snappedY = true;
            this.drawHorizontalGuide(lineY);
            break;
          }
          if (Math.abs(bounds.centerY - lineY) < threshold) {
            nextCY = lineY;
            snappedY = true;
            this.drawHorizontalGuide(lineY);
            break;
          }
          if (Math.abs(bounds.bottom - lineY) < threshold) {
            nextCY = lineY - bounds.height / 2;
            snappedY = true;
            this.drawHorizontalGuide(lineY);
            break;
          }
        }
      }
    }

    if (snappedX || snappedY) {
      this.setCenter(obj, nextCX, nextCY);
    }

    this.canvas.requestRenderAll();
  }

  private snapToLayoutFrames(
    _obj: FabricObject,
    bounds: Bounds,
    threshold: number,
    nextCX: number,
    nextCY: number,
    snappedX: boolean,
    snappedY: boolean,
  ) {
    if (!this.layoutManager) {
      return { nextCX, nextCY, snappedX, snappedY };
    }

    for (const boundary of this.layoutManager.getSnapBoundaries()) {
      if (boundary.type === "vertical" && !snappedX) {
        if (Math.abs(bounds.left - boundary.x) < threshold) {
          nextCX = boundary.x + bounds.width / 2;
          snappedX = true;
          this.drawVerticalGuide(boundary.x);
        } else if (Math.abs(bounds.right - boundary.x) < threshold) {
          nextCX = boundary.x - bounds.width / 2;
          snappedX = true;
          this.drawVerticalGuide(boundary.x);
        } else if (Math.abs(bounds.centerX - boundary.x) < threshold) {
          nextCX = boundary.x;
          snappedX = true;
          this.drawVerticalGuide(boundary.x);
        }
      } else if (boundary.type === "horizontal" && !snappedY) {
        if (Math.abs(bounds.top - boundary.y) < threshold) {
          nextCY = boundary.y + bounds.height / 2;
          snappedY = true;
          this.drawHorizontalGuide(boundary.y);
        } else if (Math.abs(bounds.bottom - boundary.y) < threshold) {
          nextCY = boundary.y - bounds.height / 2;
          snappedY = true;
          this.drawHorizontalGuide(boundary.y);
        } else if (Math.abs(bounds.centerY - boundary.y) < threshold) {
          nextCY = boundary.y;
          snappedY = true;
          this.drawHorizontalGuide(boundary.y);
        }
      }
    }

    return { nextCX, nextCY, snappedX, snappedY };
  }

  private clearGuides() {
    if (this.guideLines.length === 0) return;
    this.guideLines.forEach((line) => this.canvas.remove(line));
    this.guideLines = [];
  }

  private guideStrokeWidth() {
    return 1 / (this.canvas.getZoom() || 1);
  }

  private drawVerticalGuide(x: number) {
    const { height } = this.getLogicalSize();
    const line = new Line([x, 0, x, height], {
      stroke: "#ef4444",
      strokeWidth: this.guideStrokeWidth(),
      selectable: false,
      evented: false,
      excludeFromExport: true,
      opacity: 0.9,
    });
    this.guideLines.push(line);
    this.canvas.add(line);
  }

  private drawHorizontalGuide(y: number) {
    const { width } = this.getLogicalSize();
    const line = new Line([0, y, width, y], {
      stroke: "#ef4444",
      strokeWidth: this.guideStrokeWidth(),
      selectable: false,
      evented: false,
      excludeFromExport: true,
      opacity: 0.9,
    });
    this.guideLines.push(line);
    this.canvas.add(line);
  }
}
