import type { FabricObject } from "fabric";

/** Figma-like text resizing. Height always hugs content for auto-* modes. */
export type TextResizeMode = "auto-width" | "auto-height" | "fixed";

type TextFitFields = {
  type?: string;
  swibpTextResize?: TextResizeMode;
  swibpFitWidth?: boolean;
  swibpStyle?: string;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  fontSize?: number;
  fontStyle?: string;
  minWidth?: number;
  dynamicMinWidth?: number;
  lockScalingY?: boolean;
  lockScalingFlip?: boolean;
  initDimensions?: () => void;
  calcTextWidth?: () => number;
  setControlsVisibility?: (options: Record<string, boolean>) => unknown;
};

type TextFitNode = FabricObject & TextFitFields;

const TEXTBOX = "textbox";

function asText(node: FabricObject): TextFitNode {
  return node as TextFitNode;
}

export function isTextbox(obj: FabricObject | null | undefined): obj is TextFitNode {
  return (obj?.type || "").toLowerCase() === TEXTBOX;
}

export function getTextResizeMode(node: FabricObject): TextResizeMode {
  const t = asText(node);
  const mode = t.swibpTextResize;
  if (mode === "auto-width" || mode === "auto-height" || mode === "fixed") return mode;
  if (t.swibpFitWidth === true) return "auto-width";
  return "auto-height";
}

export function setTextResizeMode(node: FabricObject, mode: TextResizeMode): void {
  node.set({
    swibpTextResize: mode,
    swibpFitWidth: mode === "auto-width",
  });
  configureTextboxControls(node);
}

/** Side handles change width; height hugs. Corners/vertical hidden so text never stretches. */
export function configureTextboxControls(node: FabricObject): void {
  if (!isTextbox(node)) return;
  const t = asText(node);
  t.set({
    lockScalingY: true,
    lockScalingFlip: true,
  });
  t.setControlsVisibility?.({
    tl: false,
    tr: false,
    bl: false,
    br: false,
    mt: false,
    mb: false,
    ml: true,
    mr: true,
    mtr: true,
  });
}

export function configureTextboxesInTree(objects: FabricObject[]): void {
  for (const obj of objects) {
    if (isTextbox(obj)) {
      bakeTextboxScale(obj);
      configureTextboxControls(obj);
    }
    const group = obj as FabricObject & { getObjects?: () => FabricObject[] };
    if (typeof group.getObjects === "function") {
      configureTextboxesInTree(group.getObjects());
    }
  }
}

/**
 * Convert any leftover scale into width and reset scale to 1.
 * Manual width change leaves auto-width and becomes auto-height (Figma).
 */
export function bakeTextboxScale(node: FabricObject): boolean {
  if (!isTextbox(node)) return false;
  const t = asText(node);
  const scaleX = Number(t.scaleX) || 1;
  const scaleY = Number(t.scaleY) || 1;
  const scaled = Math.abs(scaleX - 1) > 1e-4 || Math.abs(scaleY - 1) > 1e-4;
  if (!scaled) return false;

  const nextWidth = Math.max(
    Number(t.minWidth) || 20,
    Math.ceil((Number(t.width) || 0) * Math.abs(scaleX)),
  );
  t.set({
    width: nextWidth,
    scaleX: 1,
    scaleY: 1,
  });
  if (getTextResizeMode(t) === "auto-width") {
    setTextResizeMode(t, "auto-height");
  } else {
    configureTextboxControls(t);
  }
  t.initDimensions?.();
  t.setCoords();
  return true;
}

/** After a side-handle resize (Fabric changeWidth), pin to auto-height. */
export function onTextboxResized(node: FabricObject): void {
  if (!isTextbox(node)) return;
  const t = asText(node);
  bakeTextboxScale(t);
  if (getTextResizeMode(t) === "auto-width") {
    setTextResizeMode(t, "auto-height");
  }
  t.initDimensions?.();
  t.setCoords();
}

function italicPad(fontSize: number, fontStyle?: string): number {
  const italic = fontStyle === "italic" || fontStyle === "oblique";
  return italic ? Math.ceil(fontSize * 0.3) : 4;
}

/**
 * Remeasure after font/size/content changes.
 * auto-width hugs content; auto-height/fixed keep width and hug height.
 */
export function relayoutText(node: FabricObject): void {
  const t = asText(node) as TextFitNode & {
    dirty?: boolean;
    _forceClearCache?: boolean;
  };
  t._forceClearCache = true;
  t.dirty = true;

  const type = (t.type || "").toLowerCase();
  if (type === TEXTBOX && typeof t.calcTextWidth === "function") {
    const fontSize = Number(t.fontSize) || 16;
    const pad = italicPad(fontSize, t.fontStyle);
    const prevWidth = Number(t.width) || 0;
    const mode = getTextResizeMode(t);

    if (mode === "auto-width") {
      t.set({ width: Math.max(prevWidth, 1e5) });
      t.initDimensions?.();
      const next = Math.max(1, Math.ceil(t.calcTextWidth()) + pad);
      t.set({ width: next });
      t.initDimensions?.();
    } else {
      t.initDimensions?.();
      const minWord = Math.ceil(Number(t.dynamicMinWidth) || 0) + pad;
      if (minWord > prevWidth) {
        t.set({ width: minWord });
        t.initDimensions?.();
      }
    }
  } else {
    t.initDimensions?.();
  }

  // Never leave stretched text on the canvas.
  if (type === TEXTBOX) {
    const sx = Number(t.scaleX) || 1;
    const sy = Number(t.scaleY) || 1;
    if (Math.abs(sx - 1) > 1e-4 || Math.abs(sy - 1) > 1e-4) {
      bakeTextboxScale(t);
      return;
    }
    configureTextboxControls(t);
  }

  t.setCoords();
}
