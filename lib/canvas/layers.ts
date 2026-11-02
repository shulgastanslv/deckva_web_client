import { type Canvas, type FabricObject, type Group } from "fabric";
import { isPinnedRole } from "./roles";
import { stabilizeGroup } from "./group";

export type LayerObject = FabricObject & {
  swibpName?: string;
  swibpId?: string;
  swibpLocked?: boolean;
  swibpRole?: string;
};

type Stack = {
  getObjects(): FabricObject[];
  moveObjectTo(object: FabricObject, index: number): boolean;
  insertAt(index: number, ...objects: FabricObject[]): number;
  remove(...objects: FabricObject[]): FabricObject[];
};

export function isUserLayer(obj: FabricObject) {
  return obj.selectable !== false && !obj.excludeFromExport;
}

export function isLayerGroup(obj: FabricObject): obj is Group {
  return obj.type === "group";
}

export function ensureLayerId(obj: FabricObject): string {
  const layer = obj as LayerObject;
  if (!layer.swibpId) layer.swibpId = globalThis.crypto.randomUUID();
  return layer.swibpId;
}

export function layerLabel(obj: FabricObject): string {
  const named = (obj as LayerObject).swibpName?.trim();
  if (named) return named;
  const text = (obj as FabricObject & { text?: unknown }).text;
  if (typeof text === "string" && text.trim()) {
    const value = text.trim().replace(/\s+/g, " ");
    return value.length > 32 ? `${value.slice(0, 32)}…` : value;
  }
  const labels: Record<string, string> = {
    rect: "Rectangle",
    circle: "Circle",
    ellipse: "Ellipse",
    triangle: "Triangle",
    line: "Line",
    path: "Shape",
    polygon: "Polygon",
    image: "Image",
    group: "Group",
    text: "Text",
    "i-text": "Text",
    textbox: "Text",
  };
  const type = obj.type ?? "object";
  return labels[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

export function layerParent(obj: FabricObject): Group | null {
  return (obj.group as Group | undefined) ?? null;
}

function stackOf(canvas: Canvas, parent: Group | null): Stack {
  return (parent ?? canvas) as unknown as Stack;
}

export function isInside(ancestor: FabricObject, obj: FabricObject): boolean {
  let current: FabricObject | undefined = obj;
  while (current) {
    if (current === ancestor) return true;
    current = current.group as FabricObject | undefined;
  }
  return false;
}

/** Move `obj` to `destIndex` in `destParent` (null = the canvas). Index is in that stack, 0 = back. */
export function placeLayer(
  canvas: Canvas,
  obj: FabricObject,
  destParent: Group | null,
  destIndex: number,
): boolean {
  if (destParent && (destParent === obj || isInside(obj, destParent))) return false;

  const srcParent = layerParent(obj);
  const srcStack = stackOf(canvas, srcParent);
  const from = srcStack.getObjects().indexOf(obj);
  if (from < 0) return false;

  if (srcParent === destParent) {
    let to = destIndex;
    if (from < to) to -= 1;
    const max = Math.max(0, srcStack.getObjects().length - 1);
    to = Math.max(0, Math.min(to, max));
    if (to === from) return false;
    srcStack.moveObjectTo(obj, to);
    return true;
  }

  srcStack.remove(obj);
  const destStack = stackOf(canvas, destParent);
  const to = Math.max(0, Math.min(destIndex, destStack.getObjects().length));
  destStack.insertAt(to, obj);
  srcParent?.set({ dirty: true });
  srcParent?.setCoords();
  destParent?.set({ dirty: true });
  destParent?.setCoords();
  return true;
}

export function moveLayerStep(
  canvas: Canvas,
  obj: FabricObject,
  where: "front" | "forward" | "backward" | "back",
): boolean {
  const parent = layerParent(obj);
  const full = stackOf(canvas, parent).getObjects();
  const users = full.filter(isUserLayer);
  const pos = users.indexOf(obj);
  if (pos < 0) return false;

  const target =
    where === "forward"
      ? users[pos + 1]
      : where === "backward"
        ? users[pos - 1]
        : where === "front"
          ? users[users.length - 1]
          : users[0];
  if (!target || target === obj) return false;

  const at = full.indexOf(target);
  const destIndex = where === "forward" || where === "front" ? at + 1 : at;
  return placeLayer(canvas, obj, parent, destIndex);
}

export function removeLayer(canvas: Canvas, obj: FabricObject) {
  if (canvas.getActiveObjects().includes(obj)) canvas.discardActiveObject();
  const parent = layerParent(obj);
  if (parent) {
    parent.remove(obj);
    parent.set({ dirty: true });
    parent.setCoords();
  } else {
    canvas.remove(obj);
  }
}

export function setLayerVisible(obj: FabricObject, visible: boolean) {
  obj.set({ visible, dirty: true });
  obj.group?.set({ dirty: true });
}

export function isLayerLocked(obj: FabricObject) {
  return Boolean((obj as LayerObject).swibpLocked);
}

export function setLayerLocked(obj: FabricObject, locked: boolean) {
  const layer = obj as LayerObject;
  const pin = isPinnedRole(layer);
  obj.set({
    swibpLocked: locked,
    lockMovementX: locked || pin,
    lockMovementY: locked || pin,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hasControls: !locked,
  } as Partial<FabricObject>);
}

export function setLayerName(obj: FabricObject, name: string) {
  const trimmed = name.trim();
  obj.set({ swibpName: trimmed || undefined } as Partial<FabricObject>);
}

export function prepareGroups(objects: FabricObject[]) {
  for (const obj of objects) {
    ensureLayerId(obj);
    if (!isLayerGroup(obj)) continue;
    stabilizeGroup(obj);
    prepareGroups(obj.getObjects());
  }
}
