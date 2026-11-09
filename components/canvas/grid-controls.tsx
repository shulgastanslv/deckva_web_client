"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useCanvasManager } from "@/context/canvas-manager";

function CountField({
  label,
  value,
  onChange,
  min = 0,
  max = 24,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="h-9 w-16 rounded-full border-none bg-muted/40 px-2 text-center text-[13px] tabular-nums shadow-none"
      />
    </div>
  );
}

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
}

/** Inline layout-grid settings for embedding in a parent dropdown. */
export function GridSettingsPanel({ className }: { className?: string }) {
  useSyncLayoutGrid();

  const isGridVisible = useCanvasStore((s) => s.isGridVisible);
  const gridColumns = useCanvasStore((s) => s.gridColumns);
  const gridRows = useCanvasStore((s) => s.gridRows);
  const gridMargin = useCanvasStore((s) => s.gridMargin);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);

  const setGridVisible = useCanvasStore((s) => s.setGridVisible);
  const setGridColumns = useCanvasStore((s) => s.setGridColumns);
  const setGridRows = useCanvasStore((s) => s.setGridRows);
  const setGridMargin = useCanvasStore((s) => s.setGridMargin);
  const setSnapToGrid = useCanvasStore((s) => s.setSnapToGrid);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">Layout grid</p>
          <p className="text-[13px] text-muted-foreground">Columns, rows, margin</p>
        </div>
        <Switch checked={isGridVisible} onCheckedChange={setGridVisible} />
      </div>

      <div
        className={cn(
          "flex flex-col gap-3 transition-opacity",
          !isGridVisible && "pointer-events-none opacity-50",
        )}
      >
        <CountField label="Columns" value={gridColumns} onChange={setGridColumns} />
        <CountField label="Rows" value={gridRows} onChange={setGridRows} />
        <CountField
          label="Margin"
          value={gridMargin}
          onChange={setGridMargin}
          min={0}
          max={400}
        />

        <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-foreground">Snap</p>
            <p className="text-[13px] text-muted-foreground">Snap to grid lines</p>
          </div>
          <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
        </div>
      </div>
    </div>
  );
}
