import { ActiveSelection, type Canvas, type FabricObject } from "fabric";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import type { ObjectFactory } from "./objects";

const PASTE_NUDGE = 20;

let clipboardPromise: Promise<FabricObject> | null = null;
let externalNudge = 0;

export function hasRememberedSelection(): boolean {
  return clipboardPromise !== null;
}

export function canCopySelection(canvas: Canvas): boolean {
  return canvas.getActiveObjects().some((obj) => !obj.excludeFromExport);
}

/** Snapshot the current selection. The clone reads object data synchronously, then finishes async. */
export function rememberSelection(canvas: Canvas): void {
  const active = canvas.getActiveObject();
  if (!active || !canCopySelection(canvas)) return;
  externalNudge = 0;
  clipboardPromise = active.clone();
}

export async function pasteRemembered(canvas: Canvas): Promise<void> {
  const pending = clipboardPromise;
  if (!pending) return;

  const source = await pending;
  if (!canvas.contextTop) return;

  const cloned = await source.clone();
  if (!canvas.contextTop) return;

  canvas.discardActiveObject();
  cloned.set({
    left: (cloned.left ?? 0) + PASTE_NUDGE,
    top: (cloned.top ?? 0) + PASTE_NUDGE,
    evented: true,
  });

  if (cloned instanceof ActiveSelection) {
    cloned.canvas = canvas;
    cloned.forEachObject((obj) => {
      canvas.add(obj);
    });
    cloned.setCoords();
  } else {
    canvas.add(cloned);
  }

  canvas.setActiveObject(cloned);
  canvas.requestRenderAll();

  if (clipboardPromise === pending) {
    source.set({
      left: (source.left ?? 0) + PASTE_NUDGE,
      top: (source.top ?? 0) + PASTE_NUDGE,
    });
    source.setCoords();
  }
}

export async function pasteImageFiles(
  objects: ObjectFactory,
  files: File[],
): Promise<void> {
  for (const file of files) {
    const nudge = takeExternalNudge();
    try {
      const url = await fileToDataUrl(file);
      await objects.addImage(url, { dx: nudge, dy: nudge });
    } catch (error) {
      reportError(error, messages.errors.pasteImage);
    }
  }
}

export async function pasteImageUrl(objects: ObjectFactory, url: string): Promise<void> {
  const nudge = takeExternalNudge();
  try {
    await objects.addImage(url, { dx: nudge, dy: nudge });
  } catch (error) {
    reportError(error, messages.errors.pasteImage);
    const center = objects.getLogicalCenter();
    objects.addText(url, center.x + nudge, center.y + nudge);
  }
}

export function pasteClipboardText(objects: ObjectFactory, text: string): void {
  const nudge = takeExternalNudge();
  const center = objects.getLogicalCenter();
  objects.addText(text, center.x + nudge, center.y + nudge);
}

function takeExternalNudge(): number {
  const nudge = externalNudge;
  externalNudge = (externalNudge + PASTE_NUDGE) % (PASTE_NUDGE * 8);
  return nudge;
}
