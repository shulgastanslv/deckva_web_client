import type { FabricObject } from "fabric";
import {
  EDGE_TOLERANCE,
  getSceneBoundingRect,
  PLACE_PADDING,
} from "./auto-flow";
import {
  continuationKeepCount,
  paragraphIndex,
  splitStyledText,
  type TextStyles,
} from "./text-flow";
import { refreshMask } from "./object-appearance";

type FlowText = FabricObject & {
  text?: string;
  styles?: TextStyles;
  textLines?: string[];
  _textLines?: string[][];
  _styleMap?: Record<number, { line: number; offset: number }>;
  isEndOfWrapping?: (line: number) => boolean;
  missingNewlineOffset?: (line: number) => number;
  getHeightOfLine?: (line: number) => number;
  initDimensions?: () => void;
  dirty?: boolean;
};

export type TextContinuation = {
  keptText: string;
  keptStyles: TextStyles;
  restText: string;
  restStyles: TextStyles;
  left: number;
};

const TEXT_TYPES = new Set(["text", "i-text", "textbox"]);

function isFlowText(obj: FabricObject): obj is FlowText {
  return TEXT_TYPES.has(obj.type ?? "");
}

/** Character index where visual line `line` begins. */
export function visualLineStart(obj: FlowText, line: number): number {
  const text = obj.text ?? "";
  const mapped = obj._styleMap?.[line];
  if (mapped) return paragraphIndex(text, mapped.line, mapped.offset);

  const graphemes = obj._textLines;
  const visual = obj.textLines ?? [];
  let index = 0;
  for (let i = 0; i < line; i++) {
    index += graphemes?.[i]?.length ?? visual[i]?.length ?? 0;
    const hardBreak = obj.missingNewlineOffset?.(i) ?? (obj.isEndOfWrapping?.(i) ? 1 : 0);
    index += hardBreak;
  }
  return index;
}

/**
 * When text runs past the bottom of the slide, split off the lines that still fit.
 * Returns null when the object should move to the next slide as a whole.
 */
export function continuationForText(
  obj: FabricObject,
  _slideW: number,
  slideH: number,
  options?: { edgeTolerance?: number; padding?: number },
): TextContinuation | null {
  if (!isFlowText(obj) || !obj.getHeightOfLine) return null;
  const text = obj.text ?? "";
  const lines = obj.textLines ?? [];
  if (!text || lines.length < 2) return null;

  const edge = options?.edgeTolerance ?? EDGE_TOLERANCE;
  const padding = options?.padding ?? PLACE_PADDING;
  const rect = getSceneBoundingRect(obj);
  const overflowsBottom = rect.top + rect.height > slideH + edge;
  if (!overflowsBottom) return null;

  const scaleY = obj.scaleY ?? 1;
  const heights = lines.map((_, index) => obj.getHeightOfLine!(index) * scaleY);
  const room = slideH - padding - rect.top;
  const keep = continuationKeepCount(heights, room);
  if (keep == null) return null;

  const split = splitStyledText(text, obj.styles, visualLineStart(obj, keep));
  if (!split) return null;
  return { ...split, left: rect.left };
}

export function writeTextPart(obj: FabricObject, text: string, styles: TextStyles): void {
  const textObj = obj as FlowText;
  textObj.set({ text, styles } as Partial<FabricObject>);
  textObj.initDimensions?.();
  textObj.dirty = true;
  refreshMask(textObj);
  textObj.setCoords();
}
