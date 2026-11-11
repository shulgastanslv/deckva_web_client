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
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";

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
    return () => {
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
      reportError(err, messages.errors.autoFlow);
    } finally {
      busy.current = false;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center p-2">
      <div className="pointer-events-auto flex max-w-[min(420px,calc(100vw-24px))] items-center gap-2 rounded-md bg-popover p-2 text-popover-foreground shadow-sm dark:border dark:border-border/50">
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
            <Layers className="size-3.5" />
          </span>
          <p className="min-w-0 truncate text-[13px] leading-snug text-foreground">
            {continuing
              ? "Text runs past the slide — continue on the next one?"
              : "Object past the edge — move it to a new slide?"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-9 shrink-0 rounded-md px-3.5 text-[13px] font-medium"
          onClick={() => void accept()}
        >
          {continuing ? "Continue" : "Create"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={dismiss}
          title="Dismiss"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
