import { Canvas, Rect, Image, filters, Pattern, Gradient, type FabricObject } from "fabric";

export type ImageAdjustments = {
  blur: number; // 0–40 px
  brightness: number; // -1..1
  contrast: number; // -1..1
  saturation: number; // -1..1
  hue: number; // -1..1
};

const IMAGE_FILTER_CTORS = [
  filters.Blur,
  filters.Brightness,
  filters.Contrast,
  filters.Saturation,
  filters.HueRotation,
  filters.Grayscale,
] as const;

export class EffectsManager {
  private canvas: Canvas;
  private vignetteRect: Rect | null = null;
  private noiseRect: Rect | null = null;
  private warmthRect: Rect | null = null;
  private static noisePattern: Pattern | null = null;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    void this.generateNoisePattern();
  }

  /** Logical (unzoomed) canvas size — objects live in this space. */
  private getLogicalSize() {
    const zoom = this.canvas.getZoom() || 1;
    return {
      width: (this.canvas.getWidth() || 1080) / zoom,
      height: (this.canvas.getHeight() || 1080) / zoom,
    };
  }

  private markEffect(obj: FabricObject) {
    // @ts-expect-error custom flag for effect layers
    obj.isEffectLayer = true;
  }

  private async generateNoisePattern() {
    if (EffectsManager.noisePattern) return;

    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 150;
    patternCanvas.height = 150;
    const ctx = patternCanvas.getContext("2d")!;
    const imageData = ctx.createImageData(150, 150);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.random() * 255;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    EffectsManager.noisePattern = new Pattern({
      source: patternCanvas,
      repeat: "repeat",
    });
  }

  private ensureOverlay(
    current: Rect | null,
    opts: {
      opacity: number;
      fill: Rect["fill"];
      globalCompositeOperation?: GlobalCompositeOperation;
    },
  ): Rect {
    const { width, height } = this.getLogicalSize();

    if (!current) {
      const rect = new Rect({
        left: 0,
        top: 0,
        width,
        height,
        selectable: false,
        evented: false,
        hoverCursor: "default",
        opacity: opts.opacity,
        fill: opts.fill,
        globalCompositeOperation: opts.globalCompositeOperation,
      });
      this.markEffect(rect);
      this.canvas.add(rect);
      this.canvas.bringObjectToFront(rect);
      return rect;
    }

    current.set({
      width,
      height,
      opacity: opts.opacity,
      fill: opts.fill,
      globalCompositeOperation: opts.globalCompositeOperation,
    });
    this.canvas.bringObjectToFront(current);
    return current;
  }

  private removeOverlay(rect: Rect | null): null {
    if (rect) this.canvas.remove(rect);
    return null;
  }

  public setVignette(intensity: number) {
    if (intensity <= 0.01) {
      this.vignetteRect = this.removeOverlay(this.vignetteRect);
      this.canvas.requestRenderAll();
      return;
    }

    const { width, height } = this.getLogicalSize();
    const cornerRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

    const vignetteFill = new Gradient({
      type: "radial",
      coords: {
        r1: 0,
        r2: cornerRadius,
        x1: width / 2,
        y1: height / 2,
        x2: width / 2,
        y2: height / 2,
      },
      colorStops: [
        { offset: 0, color: "rgba(0,0,0,0)" },
        { offset: 0.55, color: "rgba(0,0,0,0)" },
        { offset: 1, color: "rgb(0,0,0)" },
      ],
    });

    this.vignetteRect = this.ensureOverlay(this.vignetteRect, {
      opacity: intensity,
      fill: vignetteFill,
    });
    this.canvas.requestRenderAll();
  }

  public async setNoise(intensity: number) {
    if (intensity <= 0) {
      this.noiseRect = this.removeOverlay(this.noiseRect);
      this.canvas.requestRenderAll();
      return;
    }

    await this.generateNoisePattern();
    this.noiseRect = this.ensureOverlay(this.noiseRect, {
      opacity: intensity,
      fill: EffectsManager.noisePattern,
      globalCompositeOperation: "overlay",
    });
    this.canvas.requestRenderAll();
  }

  /** Warmth: -1 cool … 0 … +1 warm. Slide overlay. */
  public setWarmth(value: number) {
    if (Math.abs(value) < 0.01) {
      this.warmthRect = this.removeOverlay(this.warmthRect);
      this.canvas.requestRenderAll();
      return;
    }

    const warm = value > 0;
    this.warmthRect = this.ensureOverlay(this.warmthRect, {
      opacity: Math.min(0.55, Math.abs(value) * 0.5),
      fill: warm ? "rgb(255, 140, 50)" : "rgb(60, 120, 220)",
      globalCompositeOperation: "soft-light",
    });
    this.canvas.requestRenderAll();
  }

  /** Active Fabric image only — never falls back to slide background. */
  resolveImageTarget(): Image | null {
    const active = this.canvas.getActiveObject();
    return active instanceof Image ? active : null;
  }

  public setImageAdjustments(adj: ImageAdjustments): boolean {
    const target = this.resolveImageTarget();
    if (!target) return false;

    const next = (target.filters ?? []).filter(
      (f) => !IMAGE_FILTER_CTORS.some((Ctor) => f instanceof Ctor),
    );

    const blurValue = Math.min(1, Math.max(0, adj.blur / 40));
    if (blurValue > 0.001) next.push(new filters.Blur({ blur: blurValue }));
    if (Math.abs(adj.brightness) > 0.001) {
      next.push(new filters.Brightness({ brightness: adj.brightness }));
    }
    if (Math.abs(adj.contrast) > 0.001) {
      next.push(new filters.Contrast({ contrast: adj.contrast }));
    }
    if (Math.abs(adj.saturation) > 0.001) {
      next.push(new filters.Saturation({ saturation: adj.saturation }));
    }
    if (Math.abs(adj.hue) > 0.001) {
      next.push(new filters.HueRotation({ rotation: adj.hue }));
    }

    target.filters = next;
    target.applyFilters();
    this.canvas.requestRenderAll();
    return true;
  }

  /** @deprecated use setImageAdjustments — only updates Blur filter */
  public setBlur(amount: number) {
    const target = this.resolveImageTarget();
    if (!target) return;

    const blurValue = Math.min(1, Math.max(0, amount / 40));
    const next = (target.filters ?? []).filter(
      (f) => !(f instanceof filters.Blur),
    );
    if (blurValue > 0.001) next.push(new filters.Blur({ blur: blurValue }));
    target.filters = next;
    target.applyFilters();
    this.canvas.requestRenderAll();
  }

  public clearAll() {
    this.setVignette(0);
    void this.setNoise(0);
    this.setWarmth(0);
    this.setImageAdjustments({
      blur: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
    });
  }

  public onCanvasResize() {
    if (this.vignetteRect) this.setVignette(this.vignetteRect.opacity || 0.5);
    if (this.noiseRect) void this.setNoise(this.noiseRect.opacity || 0.5);
    if (this.warmthRect) {
      const warm =
        typeof this.warmthRect.fill === "string" &&
        this.warmthRect.fill.includes("255");
      const sign = warm ? 1 : -1;
      this.setWarmth(sign * ((this.warmthRect.opacity || 0.25) / 0.5));
    }
  }
}
