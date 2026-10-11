import { ActiveSelection, type FabricObject } from "fabric";

import type { CanvasManager } from "@/lib/canvas/manager";

function isTextObject(obj: FabricObject): boolean {
  const type = String(obj.type ?? "").toLowerCase();
  return type === "textbox" || type === "i-text" || type === "text";
}

/** Selected text objects in stable canvas order. */
export function getSelectedTextObjects(manager: CanvasManager): FabricObject[] {
  const active = manager.getActiveObject();
  if (!active) return [];
  const targets =
    active instanceof ActiveSelection ? active.getObjects() : [active];
  return targets.filter(isTextObject);
}

export function readSelectedTexts(manager: CanvasManager): string[] {
  return getSelectedTextObjects(manager).map((obj) => {
    const text = (obj as FabricObject & { text?: string }).text;
    return typeof text === "string" ? text : "";
  });
}

/** Write rewritten strings back onto the current text selection (1:1 order). */
export function applyTextsToSelection(manager: CanvasManager, texts: string[]): number {
  const targets = getSelectedTextObjects(manager);
  if (targets.length === 0) return 0;

  let applied = 0;
  targets.forEach((obj, index) => {
    const next = texts[index];
    if (typeof next !== "string") return;
    obj.set({ text: next });
    obj.setCoords();
    applied += 1;
  });

  manager.canvas.requestRenderAll();
  manager.commit();
  return applied;
}
