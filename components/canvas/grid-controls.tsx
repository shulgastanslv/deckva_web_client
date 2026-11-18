"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useCanvasManager } from "@/context/canvas-manager";

/** Keeps fabric grid in sync with store — mount once from editor chrome. */
export function useSyncLayoutGrid() {
  const manager = useCanvasManager();
  const isGridVisible = useCanvasStore((s) => s.isGridVisible);
  const gridColumns = useCanvasStore((s) => s.gridColumns);
  const gridRows = useCanvasStore((s) => s.gridRows);
  const gridMargin = useCanvasStore((s) => s.gridMargin);
  const gridColor = useCanvasStore((s) => s.gridColor);
  const gridOpacity = useCanvasStore((s) => s.gridOpacity);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);

  useEffect(() => {
    if (!manager) return;
    manager.grid.applySettings({
      columns: gridColumns,
      rows: gridRows,
      margin: gridMargin,
      color: gridColor,
      opacity: gridOpacity,
      snapToGrid,
    });
    manager.grid.setVisible(isGridVisible);
  }, [
    manager,
    isGridVisible,
    gridColumns,
    gridRows,
    gridMargin,
    gridColor,
    gridOpacity,
    snapToGrid,
  ]);

  // After slide switch, manager.grid.redraw() already ran — only re-stack if needed.
  useEffect(() => {
    if (!manager) return;
    const off = manager.on("load", () => {
      if (!useCanvasStore.getState().isGridVisible) return;
      manager.grid.redraw();
    });
    return off;
  }, [manager]);
}
