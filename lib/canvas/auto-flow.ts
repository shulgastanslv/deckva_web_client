import type { FabricObject } from "fabric";
import { ActiveSelection } from "fabric";

export const EDGE_TOLERANCE = 8;
export const PLACE_PADDING = 40;

export type SceneRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** True when any part of the rect leaves the logical slide area. */
export function rectIsOutOfBounds(
  rect: SceneRect,
  slideW: number,
  slideH: number,
  tolerance = EDGE_TOLERANCE,
): boolean {
  return (
    rect.left < -tolerance ||
    rect.top < -tolerance ||
    rect.left + rect.width > slideW + tolerance ||
    rect.top + rect.height > slideH + tolerance
  );
}

/**
 * Map an overflowing rect onto the next slide.
 * Objects that left through an edge re-enter from the opposite side.
 * Uses scene (logical) coordinates — Fabric 6 aCoords / getBoundingRect.
 */
export function flowRectOntoSlide(
  rect: SceneRect,
  slideW: number,
  slideH: number,
  padding = PLACE_PADDING,
): { left: number; top: number } {
  const maxW = Math.max(0, slideW - padding * 2);
  const maxH = Math.max(0, slideH - padding * 2);

  let left: number;
  let top: number;

  const edge = EDGE_TOLERANCE;

  if (rect.width >= maxW) {
    left = (slideW - rect.width) / 2;
  } else if (rect.left + rect.width > slideW + edge) {
    left = padding;
  } else if (rect.left < -edge) {
    left = slideW - padding - rect.width;
  } else {
    left = Math.min(
      Math.max(rect.left, padding),
      slideW - padding - rect.width,
    );
  }

  if (rect.height >= maxH) {
    top = (slideH - rect.height) / 2;
  } else if (rect.top + rect.height > slideH + edge) {
    top = padding;
  } else if (rect.top < -edge) {
    top = slideH - padding - rect.height;
  } else {
    top = Math.min(
      Math.max(rect.top, padding),
      slideH - padding - rect.height,
    );
  }

  return { left, top };
}

export function isAutoFlowSkippable(obj: FabricObject): boolean {
  // @ts-expect-error custom effect flag used by EffectsManager
  if (obj.isEffectLayer || obj.excludeFromExport) return true;
  return false;
}

/**
 * Fabric 6: getBoundingRect() is already in scene (logical) space and must
 * NOT be divided by viewport zoom — that was the main Auto Flow false-positive bug.
 */
export function getSceneBoundingRect(obj: FabricObject): SceneRect {
  obj.setCoords();
  const rect = obj.getBoundingRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function isObjectOutOfBounds(
  obj: FabricObject,
  slideW: number,
  slideH: number,
  tolerance = EDGE_TOLERANCE,
): boolean {
  if (isAutoFlowSkippable(obj)) return false;
  return rectIsOutOfBounds(getSceneBoundingRect(obj), slideW, slideH, tolerance);
}

export function resolveAutoFlowTargets(obj: FabricObject): FabricObject[] {
  if (obj instanceof ActiveSelection) {
    return obj.getObjects().filter((o) => !isAutoFlowSkippable(o));
  }
  return isAutoFlowSkippable(obj) ? [] : [obj];
}

/** Shift an object so its bounding rect lands at the given scene position. */
export function moveObjectBoundingRectTo(
  obj: FabricObject,
  targetLeft: number,
  targetTop: number,
): void {
  const rect = getSceneBoundingRect(obj);
  obj.set({
    left: (obj.left ?? 0) + (targetLeft - rect.left),
    top: (obj.top ?? 0) + (targetTop - rect.top),
  });
  obj.setCoords();
}

export function placeObjectOnNewSlide(
  obj: FabricObject,
  slideW: number,
  slideH: number,
  padding = PLACE_PADDING,
): void {
  const rect = getSceneBoundingRect(obj);
  const { left, top } = flowRectOntoSlide(rect, slideW, slideH, padding);
  moveObjectBoundingRectTo(obj, left, top);
}
