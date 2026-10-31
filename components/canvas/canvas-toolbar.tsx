"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PanelTopClose,
  Upload,
  Workflow,
} from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { CANVAS_RATIOS, type FabricCanvasJSON, type RatioKey } from "@/lib/types";
import { fitCanvasJSON } from "@/lib/canvas/fit-frame";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { GridControls } from "@/components/canvas/grid-controls";
import { ClearCanvasButton } from "@/components/canvas/clear-canvas-button";
import { ZoomControls } from "@/components/canvas/zoom-controls";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import {
  parseImportedTemplate,
  type ImportedTemplate,
} from "@/lib/templates/parse";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const QUICK_RATIOS: { ratio: RatioKey; iconClass: string }[] = [
  { ratio: "4:5", iconClass: "w-2.5 h-3" },
  { ratio: "1:1", iconClass: "w-2.5 h-2.5" },
  { ratio: "9:16", iconClass: "w-2 h-3.5" },
  { ratio: "16:9", iconClass: "w-3.5 h-2" },
];

export function CanvasToolbar({
  onHideChrome,
}: {
  onHideChrome?: () => void;
} = {}) {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const { applyPayload } = useApplyTemplate();
  const importRef = useRef<HTMLInputElement>(null);

  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const setCurrentRatio = useCanvasStore((s) => s.setCurrentRatio);
  const autoFlowEnabled = useCanvasStore((s) => s.autoFlowEnabled);
  const toggleAutoFlow = useCanvasStore((s) => s.toggleAutoFlow);
  const autoFlowEdgeTolerance = useCanvasStore((s) => s.autoFlowEdgeTolerance);
  const autoFlowPadding = useCanvasStore((s) => s.autoFlowPadding);
  const setAutoFlowEdgeTolerance = useCanvasStore((s) => s.setAutoFlowEdgeTolerance);
  const setAutoFlowPadding = useCanvasStore((s) => s.setAutoFlowPadding);
  const [copied, setCopied] = useState(false);
  const [pendingImport, setPendingImport] = useState<ImportedTemplate | null>(null);
  const [importing, setImporting] = useState(false);

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

  const loadFirstIntoCurrent = async (canvasJSON: FabricCanvasJSON) => {
    if (!manager || !slidesController) return;
    await manager.loadState(canvasJSON);
    slidesController.saveCurrent({ thumbnail: true });
    useCanvasStore.getState().setDirty(true);
  };

  const handleImportJSON = async (file: File | undefined) => {
    if (!file || !manager || !slidesController) return;
    try {
      const text = await file.text();
      const parsed = parseImportedTemplate(JSON.parse(text) as unknown);
      if (!parsed.ok || parsed.template.slides.length === 0) {
        throw new Error(parsed.ok === false ? parsed.error : "Not a canvas JSON file");
      }

      if (parsed.template.slides.length === 1) {
        await loadFirstIntoCurrent(parsed.template.slides[0]!);
        return;
      }

      setPendingImport(parsed.template);
    } catch (err) {
      console.error("Failed to import JSON:", err);
    }
  };

  const closeImportDialog = () => {
    if (importing) return;
    setPendingImport(null);
  };

  const importFirstOnly = async () => {
    const first = pendingImport?.slides[0];
    if (!first) return;
    setImporting(true);
    try {
      await loadFirstIntoCurrent(first);
      setPendingImport(null);
    } catch (err) {
      console.error("Failed to import first slide:", err);
    } finally {
      setImporting(false);
    }
  };

  const importAllSlides = async () => {
    if (!pendingImport) return;
    setImporting(true);
    try {
      await applyPayload({
        aspectRatio: pendingImport.aspectRatio ?? useCanvasStore.getState().currentRatio,
        slides: pendingImport.slides,
        thumbnails: pendingImport.thumbnails,
        previewUrl: pendingImport.previewUrl,
      });
      setPendingImport(null);
    } catch (err) {
      console.error("Failed to import all slides:", err);
    } finally {
      setImporting(false);
    }
  };

  const slideCount = pendingImport?.slides.length ?? 0;

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
            size="sm"
            onClick={toggleAutoFlow}
            className={cn(
              "h-8 px-2 text-[13px] gap-1 rounded-full transition-colors",
              autoFlowEnabled
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-6 rounded-full transition-colors",
                  autoFlowEnabled
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Auto Flow settings"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-64 rounded-2xl p-0 overflow-hidden border-none backdrop-blur-md"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="px-3.5 py-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">
                      Auto Flow
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Edge tolerance and padding
                    </p>
                  </div>
                  <Switch
                    checked={autoFlowEnabled}
                    onCheckedChange={(v) =>
                      useCanvasStore.getState().setAutoFlowEnabled(v)
                    }
                  />
                </div>
              </div>
              <div
                className={cn(
                  "flex flex-col gap-3 p-3.5 transition-opacity",
                  !autoFlowEnabled && "opacity-50 pointer-events-none",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-muted-foreground">
                    Edge tolerance
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={64}
                    value={autoFlowEdgeTolerance}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) setAutoFlowEdgeTolerance(n);
                    }}
                    className="h-8 w-16 rounded-full text-[13px] text-center px-2 bg-muted/40 border-0 shadow-none tabular-nums"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-muted-foreground">
                    Place padding
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    value={autoFlowPadding}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) setAutoFlowPadding(n);
                    }}
                    className="h-8 w-16 rounded-full text-[13px] text-center px-2 bg-muted/40 border-0 shadow-none tabular-nums"
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <Dialog open={pendingImport !== null} onOpenChange={(open) => !open && closeImportDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import slides?</DialogTitle>
            <DialogDescription>
              This file has {slideCount} slides. Load only the first into the current slide, or
              replace the whole carousel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={importing}
              onClick={closeImportDialog}
            >
              Cancel
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={importing}
                onClick={() => void importFirstOnly()}
              >
                First slide
              </Button>
              <Button
                className="rounded-full"
                disabled={importing}
                onClick={() => void importAllSlides()}
              >
                All slides
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
