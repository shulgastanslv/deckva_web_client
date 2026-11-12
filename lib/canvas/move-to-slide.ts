import { ActiveSelection, type FabricObject } from "fabric";
import {
  getSceneBoundingRect,
  isAutoFlowSkippable,
  moveObjectBoundingRectTo,
  resolveAutoFlowTargets,
  type SceneRect,
} from "@/lib/canvas/auto-flow";
import type { CanvasManager } from "@/lib/canvas/manager";
import type { SlidesController } from "@/lib/canvas/slides";
import { useCanvasStore } from "@/store/useCanvasStore";
import { scheduleSlideThumbnailHydration } from "@/lib/canvas/thumbnail";

export type OverflowSide = "left" | "right" | "top" | "bottom";

/** Which edge the object mostly left through (by center). */
export function overflowSide(
  obj: FabricObject,
  slideW: number,
  slideH: number,
  tolerance = 8,
): OverflowSide | null {
  if (isAutoFlowSkippable(obj)) return null;
  const rect = getSceneBoundingRect(obj);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const pastLeft = cx < -tolerance;
  const pastRight = cx > slideW + tolerance;
  const pastTop = cy < -tolerance;
  const pastBottom = cy > slideH + tolerance;
  if (!pastLeft && !pastRight && !pastTop && !pastBottom) return null;

  const dx = pastLeft ? -cx : pastRight ? cx - slideW : 0;
  const dy = pastTop ? -cy : pastBottom ? cy - slideH : 0;
  if (Math.abs(dx) >= Math.abs(dy)) return pastLeft ? "left" : "right";
  return pastTop ? "top" : "bottom";
}

export function neighborSlideId(side: OverflowSide): number | null {
  if (side !== "left" && side !== "right") return null;
  const { slides, currentSlideId } = useCanvasStore.getState();
  const index = slides.findIndex((slide) => slide.id === currentSlideId);
  if (index < 0) return null;
  const next = slides[index + (side === "right" ? 1 : -1)];
  return next?.id ?? null;
}

/** Keep the drag continuous: map source scene rect onto the neighbor slide. */
function enterContinuous(
  obj: FabricObject,
  slideW: number,
  fromSide: "left" | "right",
  sourceRect: SceneRect,
): void {
  const left =
    fromSide === "right" ? sourceRect.left - slideW : sourceRect.left + slideW;
  moveObjectBoundingRectTo(obj, left, sourceRect.top);
}

/**
 * Moves the active selection onto an existing neighbor slide.
 * Keeps screen position continuous and avoids double thumbnail work.
 */
export async function moveSelectionToSlide(input: {
  manager: CanvasManager;
  slides: SlidesController;
  targetId: number;
  fromSide: "left" | "right";
  padding?: number;
}): Promise<boolean> {
  const { manager, slides, targetId, fromSide } = input;
  const active = manager.getActiveObject();
  if (!active) return false;

  const targets = resolveAutoFlowTargets(active);
  if (targets.length === 0) return false;

  const { width } = useCanvasStore.getState().canvasDimensions;
  const sourceId = useCanvasStore.getState().currentSlideId;
  const placements = targets.map((obj) => getSceneBoundingRect(obj));

  // Clone while sources are still mounted (images stay warm).
  const clones = await Promise.all(targets.map((obj) => obj.clone()));

  // One undo step on the source: drop the moved objects.
  await manager.runBatched(() => {
    manager.canvas.discardActiveObject();
    for (const obj of targets) manager.canvas.remove(obj);
  });

  // Switch without re-capturing a JPEG thumb mid-flight.
  await slides.switchTo(targetId, { thumbnail: false });

  // One undo step on the target: place with continuous coords.
  await manager.runBatched(() => {
    for (let i = 0; i < clones.length; i++) {
      const cloned = clones[i]!;
      const rect = placements[i]!;
      enterContinuous(cloned, width, fromSide, rect);
      manager.canvas.add(cloned);
    }

    if (clones.length === 1) {
      manager.canvas.setActiveObject(clones[0]!);
    } else if (clones.length > 1) {
      const selection = new ActiveSelection(clones, { canvas: manager.canvas });
      manager.canvas.setActiveObject(selection);
    }
  });

  // Neighbor strip thumbs only — current slide is refreshed by navigator.
  scheduleSlideThumbnailHydration([sourceId]);
  return true;
}
