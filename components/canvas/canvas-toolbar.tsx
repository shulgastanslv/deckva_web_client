"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ChevronDown,
  Download,
  FileCode2,
  LayoutIcon,
  PanelTopClose,
  Upload,
  Workflow,
} from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { fitCanvasJSON } from "@/lib/canvas/fit-frame";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { GridControls } from "@/components/canvas/grid-controls";
import { ClearCanvasButton } from "@/components/canvas/clear-canvas-button";
import { ZoomControls } from "@/components/canvas/zoom-controls";
import type { FabricCanvasJSON } from "@/lib/types";

const QUICK_RATIOS: { ratio: RatioKey; iconClass: string }[] = [
  { ratio: "4:5", iconClass: "w-2.5 h-3" },
  { ratio: "1:1", iconClass: "w-2.5 h-2.5" },
  { ratio: "9:16", iconClass: "w-2 h-3.5" },
  { ratio: "16:9", iconClass: "w-3.5 h-2" },
];

function isFabricCanvasJSON(value: unknown): value is FabricCanvasJSON {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function CanvasToolbar({
  onHideChrome,
}: {
  onHideChrome?: () => void;
} = {}) {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const importRef = useRef<HTMLInputElement>(null);

  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const setCurrentRatio = useCanvasStore((s) => s.setCurrentRatio);
  const isReferenceOpen = useCanvasStore((s) => s.isReferenceOpen);
  const toggleReferenceOpen = useCanvasStore((s) => s.toggleReferenceOpen);
  const autoFlowEnabled = useCanvasStore((s) => s.autoFlowEnabled);
  const toggleAutoFlow = useCanvasStore((s) => s.toggleAutoFlow);
  const [copied, setCopied] = useState(false);

  const handleRatioChange = (ratio: RatioKey) => {
    const to = CANVAS_RATIOS[ratio];
    if (!to) return;
    const state = useCanvasStore.getState();
    const from = state.canvasDimensions;
    if (state.currentRatio === ratio) return;

    if (manager && (from.width !== to.width || from.height !== to.height)) {
      for (const slide of state.slides) {
        if (slide.id === state.currentSlideId) continue;
        state.updateSlideJSONById(slide.id, fitCanvasJSON(slide.canvasJSON, from, to));
      }
      manager.fitToFrame(from, to);
    }
    setCurrentRatio(ratio);
  };

  const handleExportJSON = async () => {
    if (!manager) return;
    try {
      const json = manager.io.exportAsJSON();
      const jsonString =
        typeof json === "string" ? json : JSON.stringify(json, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const title = useCanvasStore.getState().projectTitle.trim() || "slide";
      a.href = url;
      a.download = `${title.replace(/[^\w\-]+/g, "_").slice(0, 48) || "slide"}.json`;
      a.click();
      URL.revokeObjectURL(url);

      await navigator.clipboard.writeText(jsonString).catch(() => undefined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to export JSON:", err);
    }
  };

  const handleImportJSON = async (file: File | undefined) => {
    if (!file || !manager || !slidesController) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const canvasJSON = Array.isArray((parsed as { slides?: unknown })?.slides)
        ? (parsed as { slides: unknown[] }).slides[0]
        : parsed;
      if (!isFabricCanvasJSON(canvasJSON)) {
        throw new Error("Not a canvas JSON file");
      }
      await manager.loadState(canvasJSON);
      slidesController.saveCurrent({ thumbnail: true });
      useCanvasStore.getState().setDirty(true);
    } catch (err) {
      console.error("Failed to import JSON:", err);
    }
  };

  return (
    <div className="flex h-11 w-full min-w-0 shrink-0 items-center justify-between gap-2 overflow-x-auto border-b border-border/40 bg-background/60 px-3 backdrop-blur-md select-none">
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden pl-1 text-[13px] font-medium tracking-wide text-muted-foreground uppercase sm:inline">
          Ratio
        </span>

        <div className="flex shrink-0 items-center rounded-full bg-muted/60 p-0.5">
          {QUICK_RATIOS.map(({ ratio, iconClass }) => {
            const isActive = currentRatio === ratio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => handleRatioChange(ratio)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[13px] rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-background text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-medium"
                }`}
              >
                <span
                  className={`rounded-[2px] border ${iconClass} transition-colors ${
                    isActive
                      ? "border-foreground bg-foreground/20"
                      : "border-muted-foreground/60"
                  }`}
                />
                {ratio}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-border/60 mx-1" />

        <GridControls />

        <div className="flex items-center bg-muted/50 p-0.5 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleReferenceOpen}
            className={`h-8 w-8 rounded-full transition-colors ${
              isReferenceOpen
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
            title="Split: reference panel"
          >
            <LayoutIcon className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoFlow}
            className={`h-8 px-2 text-[13px] gap-1 rounded-full transition-colors ${
              autoFlowEnabled
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
            title={
              autoFlowEnabled
                ? "Auto Flow: on — offers a new slide when content runs past the edge"
                : "Auto Flow: off"
            }
          >
            <Workflow className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[13px] font-medium">
              Auto Flow
            </span>
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void handleImportJSON(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-[13px] font-medium gap-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              title="JSON"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium hidden sm:inline">
                    Exported
                  </span>
                </>
              ) : (
                <>
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">JSON</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[11rem] rounded-xl">
            <DropdownMenuItem
              className="gap-2 rounded-lg text-[13px]"
              onSelect={() => void handleExportJSON()}
            >
              <Download className="size-3.5" />
              Export to JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 rounded-lg text-[13px]"
              onSelect={() => importRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Import from JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ClearCanvasButton />
        <ZoomControls />
        {onHideChrome ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onHideChrome}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80"
            title="Hide toolbar and slides for focus (\\)"
            aria-label="Hide canvas chrome"
          >
            <PanelTopClose className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
