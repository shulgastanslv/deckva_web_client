"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { Layers, X } from "lucide-react";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import {
  isObjectOutOfBounds,
  moveObjectBoundingRectTo,
  placeObjectOnNewSlide,
  resolveAutoFlowTargets,
} from "@/lib/canvas/auto-flow";
import { continuationForText, writeTextPart } from "@/lib/canvas/text-continue";

/**
 * When Auto Flow is on and an object leaves the slide, offer to create
 * the next slide. Text that runs past the bottom continues there; anything
 * else moves across as a whole object.
 */
export function AutoFlowPrompt() {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const autoFlowEnabled = useCanvasStore((s) => s.autoFlowEnabled);
  const autoFlowEdgeTolerance = useCanvasStore((s) => s.autoFlowEdgeTolerance);
  const autoFlowPadding = useCanvasStore((s) => s.autoFlowPadding);
  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);

  const [pending, setPending] = useState<FabricObject | null>(null);
  const dismissedFor = useRef<WeakSet<FabricObject>>(new WeakSet());
  const busy = useRef(false);

  useEffect(() => {
    if (!manager || !autoFlowEnabled) {
      setPending(null);
      return;
    }

    const onModified = (e?: { target?: FabricObject }) => {
      const target = e?.target ?? manager.getActiveObject();
      if (!target || busy.current) return;

      const { width, height } = canvasDimensions;
      if (isObjectOutOfBounds(target, width, height, autoFlowEdgeTolerance)) {
        if (dismissedFor.current.has(target)) return;
        setPending(target);
      } else {
        // Allow prompting again on the next excursion past the edge.
        dismissedFor.current.delete(target);
        setPending((prev) => (prev === target ? null : prev));
      }
    };

    manager.canvas.on("object:modified", onModified);
    const unsubscribeEdit = manager.on("edit", (target) => {
      onModified(target ? { target } : undefined);
    });
    return () => {
      unsubscribeEdit();
      manager.canvas.off("object:modified", onModified);
    };
  }, [manager, autoFlowEnabled, autoFlowEdgeTolerance, canvasDimensions]);

  if (!pending || !autoFlowEnabled || !manager) return null;

  const flowOpts = {
    edgeTolerance: autoFlowEdgeTolerance,
    padding: autoFlowPadding,
  };
  const continuing = Boolean(
    continuationForText(
      pending,
      canvasDimensions.width,
      canvasDimensions.height,
      flowOpts,
    ),
  );

  const dismiss = () => {
    dismissedFor.current.add(pending);
    setPending(null);
  };

  const accept = async () => {
    if (!manager || !slidesController || busy.current) return;
    busy.current = true;
    try {
      const source = pending;
      setPending(null);

      // Expand multi-select and restore scene coords before cloning.
      const targets = resolveAutoFlowTargets(source);
      if (targets.length === 0) return;

      manager.canvas.discardActiveObject();

      const { width, height } = canvasDimensions;
      const split =
        targets.length === 1
          ? continuationForText(targets[0]!, width, height, flowOpts)
          : null;
      if (split && targets[0]) {
        const textObj = targets[0];
        const clone = await textObj.clone();
        writeTextPart(textObj, split.keptText, split.keptStyles);
        manager.canvas.requestRenderAll();
        manager.commit();

        await slidesController.add();

        writeTextPart(clone, split.restText, split.restStyles);
        moveObjectBoundingRectTo(clone, split.left, autoFlowPadding);
        manager.canvas.add(clone);
        manager.canvas.setActiveObject(clone);
        manager.canvas.requestRenderAll();
        manager.commit();
        return;
      }

      const clones = await Promise.all(targets.map((obj) => obj.clone()));

      for (const obj of targets) {
        manager.canvas.remove(obj);
      }
      manager.canvas.requestRenderAll();
      manager.commit();

      await slidesController.add();

      for (const cloned of clones) {
        placeObjectOnNewSlide(cloned, width, height, autoFlowPadding);
        manager.canvas.add(cloned);
      }
      if (clones.length === 1) {
        manager.canvas.setActiveObject(clones[0]!);
      }
      manager.canvas.requestRenderAll();
      manager.commit();
    } catch (err) {
      console.error("Auto Flow failed:", err);
    } finally {
      busy.current = false;
    }
  };

  return (
    <div className="pointer-events-none absolute bottom-20 left-1/2 z-30 -translate-x-1/2 px-3">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border/60 bg-background/95 px-3 py-2 backdrop-blur-md">
        <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="max-w-[280px] text-[13px] text-foreground">
          {continuing
            ? "This text runs past the slide. Continue it on the next slide?"
            : "This object runs past the slide edge. Create the next slide and move it?"}
        </p>
        <Button
          size="sm"
          className="h-7 shrink-0 rounded-xl px-2.5 text-[13px]"
          onClick={() => void accept()}
        >
          {continuing ? "Continue" : "Create"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full shrink-0"
          onClick={dismiss}
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
