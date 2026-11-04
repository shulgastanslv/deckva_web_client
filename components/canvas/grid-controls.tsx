"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Grid3X3 } from "lucide-react";
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
        className="h-8 w-16 rounded-full text-[13px] text-center px-2 bg-muted/40 border-0 shadow-none tabular-nums"
      />
    </div>
  );
}

export function GridControls({ menuSide = "bottom" }: { menuSide?: "bottom" | "right" }) {
  const manager = useCanvasManager();

  const isGridVisible = useCanvasStore((s) => s.isGridVisible);
  const gridColumns = useCanvasStore((s) => s.gridColumns);
  const gridRows = useCanvasStore((s) => s.gridRows);
  const gridMargin = useCanvasStore((s) => s.gridMargin);
  const gridColor = useCanvasStore((s) => s.gridColor);
  const gridOpacity = useCanvasStore((s) => s.gridOpacity);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);

  const setGridVisible = useCanvasStore((s) => s.setGridVisible);
  const setGridColumns = useCanvasStore((s) => s.setGridColumns);
  const setGridRows = useCanvasStore((s) => s.setGridRows);
  const setGridMargin = useCanvasStore((s) => s.setGridMargin);
  const setSnapToGrid = useCanvasStore((s) => s.setSnapToGrid);

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

  return (
    <div className="flex items-center bg-muted/50 p-0.5 rounded-full h-9">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setGridVisible(!isGridVisible)}
        className={cn(
          "h-8 w-8 rounded-full transition-colors",
          isGridVisible
            ? "bg-background text-foreground shadow-2xs"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
        )}
        title={isGridVisible ? "Hide layout grid" : "Show layout grid"}
      >
        <Grid3X3 className="w-3.5 h-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-6 rounded-full transition-colors",
              isGridVisible
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Layout grid"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={menuSide}
          align="start"
          sideOffset={8}
          className="w-64 rounded-2xl p-0 overflow-hidden border-none backdrop-blur-md"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="px-3.5 py-3 border-b border-border/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-foreground">
                  Layout grid
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Columns, rows, margin
                </p>
              </div>
              <Switch
                checked={isGridVisible}
                onCheckedChange={(v) => setGridVisible(v)}
              />
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col gap-3 p-3.5 transition-opacity",
              !isGridVisible && "opacity-50 pointer-events-none",
            )}
          >
            <CountField
              label="Columns"
              value={gridColumns}
              onChange={setGridColumns}
            />
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
                <p className="text-[13px] text-muted-foreground">
                  Snap to grid lines
                </p>
              </div>
              <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
