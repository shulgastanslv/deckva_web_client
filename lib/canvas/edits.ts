import { Rect, Shadow, type FabricObject } from "fabric";

/**
 * Inspector writes that are not a plain `object.set(patch)`.
 * Run them inside `CanvasManager.edit` so the document is saved once,
 * without firing Fabric's `object:modified` (that event is for pointer drags).
 */

export interface ShadowValues {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export function scaleToMeasuredWidth(obj: FabricObject, width: number): void {
  if (width > 0) obj.scaleToWidth(width);
}

export function scaleToMeasuredHeight(obj: FabricObject, height: number): void {
  if (height > 0) obj.scaleToHeight(height);
}

/** Rectangle radius is a property. Image radius is a centered clip. */
export function setCornerRadius(obj: FabricObject, radius: number): void {
  if (obj.type === "rect") {
    obj.set({ rx: radius, ry: radius });
    return;
  }
  if (obj.type !== "image") return;
  obj.set({ rx: radius } as Partial<FabricObject>);
  if (radius > 0) {
    obj.set({
      clipPath: new Rect({
        width: obj.width,
        height: obj.height,
        rx: radius,
        ry: radius,
        originX: "center",
        originY: "center",
      }),
    });
    return;
  }
  obj.set({ clipPath: undefined });
}

export function paintShadow(objects: readonly FabricObject[], shadow: ShadowValues | null): void {
  for (const obj of objects) {
    obj.set({
      shadow: shadow
        ? new Shadow({
            color: shadow.color,
            blur: shadow.blur,
            offsetX: shadow.offsetX,
            offsetY: shadow.offsetY,
          })
        : null,
    });
  }
}

export function setMovementLock(objects: readonly FabricObject[], locked: boolean): void {
  for (const obj of objects) {
    obj.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      lockSkewingX: locked,
      lockSkewingY: locked,
      hasControls: !locked,
    });
  }
}
