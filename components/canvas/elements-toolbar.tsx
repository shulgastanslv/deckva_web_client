"use client";

import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  AlignLeft,
  ChevronDown,
  Circle,
  Diamond,
  Ellipse,
  Eraser,
  Hand,
  Heading1,
  Heading2,
  Hexagon,
  ImagePlus,
  Layers2,
  Link2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Minus,
  MousePointer2,
  Quote,
  ScanSearch,
  SeparatorHorizontal,
  Sparkles,
  Square,
  Star,
  Triangle,
  Type,
  WandSparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { CaptionControls } from "@/components/canvas/caption-controls";
import { useSlides } from "@/hooks/use-slides";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useElementLibrary } from "@/components/canvas/use-element-library";
import { useImageTools } from "@/components/canvas/use-image-tools";
import { clampZoom } from "@/components/canvas/zoom-controls";
import type { UpscaleScale } from "@/lib/image/deckva-tools";
import { useCanvasStore } from "@/store/useCanvasStore";

interface ElementsToolbarProps {
  onExit: () => void;
}

interface ToolDef {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  shortcut?: string;
  key?: string;
}

const SHAPES: ToolDef[] = [
  { id: "rectangle", label: "Rectangle", hint: "Rectangle", icon: Square, shortcut: "R", key: "r" },
  { id: "ellipse", label: "Ellipse", hint: "Oval", icon: Ellipse, shortcut: "O", key: "o" },
  { id: "circle", label: "Circle", hint: "Circle", icon: Circle },
  { id: "line", label: "Line", hint: "Straight line", icon: Minus, shortcut: "L", key: "l" },
  { id: "triangle", label: "Triangle", hint: "Triangle", icon: Triangle },
  { id: "diamond", label: "Diamond", hint: "Diamond", icon: Diamond },
  { id: "star", label: "Star", hint: "Five-point star", icon: Star },
  { id: "hexagon", label: "Hexagon", hint: "Hexagon", icon: Hexagon },
  { id: "divider", label: "Divider", hint: "Thin horizontal rule", icon: SeparatorHorizontal },
];

const TEXTS: ToolDef[] = [
  { id: "heading", label: "Heading", hint: "Large title", icon: Heading1 },
  { id: "subtitle", label: "Subtitle", hint: "Smaller title under the heading", icon: Heading2 },
  { id: "paragraph", label: "Paragraph", hint: "Body text", icon: AlignLeft },
  { id: "quote", label: "Quote", hint: "Quoted line", icon: Quote },
];

function isTypingTarget() {
  const el = document.activeElement;
  if (
    el instanceof HTMLElement &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT" ||
      el.isContentEditable)
  ) {
    return true;
  }
  return false;
}

function ToolHint({
  label,
  shortcut,
  hint,
}: {
  label: string;
  shortcut?: string;
  hint?: string;
}) {
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className="flex items-center gap-1.5">
        {label}
        {shortcut ? (
          <kbd className="rounded-sm bg-background/15 px-1 font-mono text-[10px]">
            {shortcut}
          </kbd>
        ) : null}
      </span>
      {hint ? <span className="opacity-80">{hint}</span> : null}
    </span>
  );
}

function RailTool({
  label,
  hint,
  shortcut,
  active,
  dragging,
  disabled,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  label: string;
  hint?: string;
  shortcut?: string;
  active?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onDragOver?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragLeave?: () => void;
  onDrop?: (event: DragEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={shortcut ? `${label}, ${shortcut}` : label}
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40",
            active || dragging
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={10}>
        <ToolHint label={label} shortcut={shortcut} hint={hint} />
      </TooltipContent>
    </Tooltip>
  );
}

function SplitTool({
  label,
  hint,
  shortcut,
  active,
  dragging,
  disabled,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  open,
  onOpenChange,
  panel,
  children,
}: {
  label: string;
  hint?: string;
  shortcut?: string;
  active?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onDragOver?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragLeave?: () => void;
  onDrop?: (event: DragEvent<HTMLButtonElement>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panel: ReactNode;
  children: ReactNode;
}) {
  const lit = Boolean(active || dragging || open);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "flex h-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          lit ? "bg-foreground text-background" : "bg-muted/50",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={shortcut ? `${label}, ${shortcut}` : label}
              aria-pressed={active}
              disabled={disabled}
              onClick={onClick}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40",
                lit
                  ? "text-background hover:bg-background/15"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
            >
              {children}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10}>
            <ToolHint label={label} shortcut={shortcut} hint={hint} />
          </TooltipContent>
        </Tooltip>

        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`${label} options`}
            disabled={disabled}
            className={cn(
              "flex h-8 w-6 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40",
              lit
                ? "text-background/80 hover:bg-background/15 hover:text-background"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
            )}
          >
            <ChevronDown className="size-3.5" />
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={12}
        className="w-auto rounded-2xl border-0 bg-popover p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
}

function ToolFlyout({
  tools,
  activeId,
  disabled,
  onUse,
}: {
  tools: ToolDef[];
  activeId: string;
  disabled?: boolean;
  onUse: (tool: ToolDef) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = tools.find((tool) => tool.id === activeId) ?? tools[0];
  const Icon = active.icon;

  return (
    <SplitTool
      label={active.label}
      hint={active.hint}
      shortcut={active.shortcut}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
      onClick={() => onUse(active)}
      panel={
        <div
          className={cn(
            "grid gap-1",
            tools.length > 6 ? "grid-cols-3" : "grid-cols-1",
          )}
        >
          {tools.map((tool) => {
            const ItemIcon = tool.icon;
            const selected = tool.id === active.id;
            return (
              <button
                key={tool.id}
                type="button"
                title={tool.hint}
                onClick={() => {
                  onUse(tool);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] font-medium transition-colors",
                  tools.length > 6 && "flex-col justify-center gap-1 px-2 py-2 h-auto min-w-16",
                  selected
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <ItemIcon className="size-4 shrink-0" />
                {tools.length > 6 ? (
                  <span className="max-w-full truncate text-[11px]">{tool.label}</span>
                ) : (
                  <>
                    <span className="flex-1 text-left">{tool.label}</span>
                    {tool.shortcut ? (
                      <kbd className="rounded-sm bg-muted/60 px-1 font-mono text-[10px] text-muted-foreground">
                        {tool.shortcut}
                      </kbd>
                    ) : null}
                  </>
                )}
              </button>
            );
          })}
        </div>
      }
    >
      <Icon className="size-4" />
    </SplitTool>
  );
}

function BarDivider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-border/70" />;
}

export function ElementsToolbar({ onExit }: ElementsToolbarProps) {
  const {
    manager,
    sections,
    fileInputRef,
    isDragging,
    setIsDragging,
    imageUrl,
    setImageUrl,
    urlLoading,
    urlError,
    setUrlError,
    addImageFromFile,
    handleImageFileChange,
    addImageFromUrl,
  } = useElementLibrary();

  const handActive = useCanvasStore((s) => s.handActive);
  const setHandActive = useCanvasStore((s) => s.setHandActive);
  const eraserActive = useCanvasStore((s) => s.eraserActive);
  const setEraserActive = useCanvasStore((s) => s.setEraserActive);
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const postCaption = useCanvasStore((s) => s.postCaption);
  const { currentIndex, slides, canGoPrev, canGoNext, prev, next } = useSlides();
  const [shapeId, setShapeId] = useState(SHAPES[0].id);
  const [textId, setTextId] = useState(TEXTS[0].id);
  const [imageOpen, setImageOpen] = useState(false);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const {
    canRun: canEnhance,
    busy: enhanceBusy,
    error: enhanceError,
    scale: enhanceScale,
    setScale: setEnhanceScale,
    removeBackground,
    upscale,
    magicLayer,
  } = useImageTools();
  const EnhanceIcon = enhanceBusy ? Loader2 : Sparkles;

  const actions = useMemo(() => {
    const map = new Map<string, () => void>();
    for (const section of sections) {
      for (const item of section.items) map.set(item.label, item.action);
    }
    return map;
  }, [sections]);

  const useTool = (tool: ToolDef, slot: "shape" | "text") => {
    if (slot === "shape") setShapeId(tool.id);
    else setTextId(tool.id);
    actions.get(tool.label)?.();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat)
        return;
      if (isTypingTarget()) return;
      if (
        event.target instanceof Element &&
        event.target.closest("[data-slot='popover-content']")
      ) {
        return;
      }
      const active = manager?.getActiveObject() as { isEditing?: boolean } | null;
      if (active?.isEditing) return;

      const key = event.key.toLowerCase();
      if (key === "v") {
        event.preventDefault();
        setHandActive(false);
        setEraserActive(false);
        return;
      }
      if (key === "e") {
        event.preventDefault();
        setEraserActive(!useCanvasStore.getState().eraserActive);
        return;
      }

      const shape = SHAPES.find((tool) => tool.key === key);
      if (shape) {
        event.preventDefault();
        setEraserActive(false);
        setShapeId(shape.id);
        actions.get(shape.label)?.();
        return;
      }
      const text = TEXTS.find((tool) => tool.key === key);
      if (text) {
        event.preventDefault();
        setEraserActive(false);
        setTextId(text.id);
        actions.get(text.label)?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions, manager, setEraserActive, setHandActive]);

  const onImageDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (manager) setIsDragging(true);
  };

  const onImageDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) addImageFromFile(file);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
        <div className="pointer-events-auto flex h-12 w-fit max-w-[calc(100vw-24px)] items-center gap-1 overflow-x-auto rounded-full bg-background p-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
            disabled={!manager}
          />

          <RailTool
            label="Move"
            hint="Select and move objects"
            shortcut="V"
            active={!handActive && !eraserActive}
            disabled={!manager}
            onClick={() => {
              setHandActive(false);
              setEraserActive(false);
            }}
          >
            <MousePointer2 className="size-4" />
          </RailTool>
          <RailTool
            label="Hand"
            hint="Drag to pan. Hold Space"
            shortcut="H"
            active={handActive}
            disabled={!manager}
            onClick={() => setHandActive(!handActive)}
          >
            <Hand className="size-4" />
          </RailTool>
          <RailTool
            label="Eraser"
            hint="Brush away pixels on images"
            shortcut="E"
            active={eraserActive}
            disabled={!manager}
            onClick={() => setEraserActive(!eraserActive)}
          >
            <Eraser className="size-4" />
          </RailTool>

          <BarDivider />

          <ToolFlyout
            tools={SHAPES}
            activeId={shapeId}
            disabled={!manager}
            onUse={(tool) => useTool(tool, "shape")}
          />
          <ToolFlyout
            tools={TEXTS}
            activeId={textId}
            disabled={!manager}
            onUse={(tool) => useTool(tool, "text")}
          />

          <SplitTool
            label="Image"
            hint="Upload or drop a picture"
            dragging={isDragging}
            disabled={!manager}
            open={imageOpen}
            onOpenChange={setImageOpen}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onImageDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onImageDrop}
            panel={
              <div className="w-64 space-y-2 p-1">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setImageOpen(false);
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-full px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ImagePlus className="size-4" />
                  Upload image
                </button>
                <div className="space-y-1.5 px-1">
                  <p className="text-[12px] font-medium text-muted-foreground">
                    From link
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="relative min-w-0 flex-1">
                      <Link2 className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="Image URL"
                        value={imageUrl}
                        disabled={!manager}
                        onChange={(event) => {
                          setImageUrl(event.target.value);
                          setUrlError(null);
                        }}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void addImageFromUrl().then(() => setImageOpen(false));
                          }
                        }}
                        className="h-9 rounded-full border-0 bg-muted/40 pl-7 text-[13px] shadow-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!manager || urlLoading || !imageUrl.trim()}
                      onClick={() =>
                        void addImageFromUrl().then(() => setImageOpen(false))
                      }
                      className="h-9 shrink-0 rounded-full px-2.5 text-[13px]"
                    >
                      {urlLoading ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </div>
                  {urlError ? (
                    <p className="text-[13px] text-destructive">{urlError}</p>
                  ) : null}
                </div>
              </div>
            }
          >
            <ImagePlus className="size-4" />
          </SplitTool>

          <SplitTool
            label="Enhance"
            hint={
              enhanceBusy
                ? "Working…"
                : enhanceError
                  ? enhanceError
                  : "Remove BG, upscale, magic layer — select an image"
            }
            disabled={!canEnhance && !enhanceBusy}
            open={enhanceOpen}
            onOpenChange={setEnhanceOpen}
            onClick={() => void removeBackground()}
            panel={
              <div className="w-52 space-y-0.5 p-1">
                <button
                  type="button"
                  disabled={!canEnhance}
                  onClick={() => {
                    void removeBackground();
                    setEnhanceOpen(false);
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-full px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <WandSparkles className="size-4" />
                  Remove background
                </button>
                <p className="px-3 pt-1.5 pb-1 text-[12px] font-medium text-muted-foreground">
                  Upscale
                </p>
                {([2, 3, 4] as UpscaleScale[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!canEnhance}
                    onClick={() => {
                      setEnhanceScale(value);
                      void upscale(value);
                      setEnhanceOpen(false);
                    }}
                    className={cn(
                      "flex h-9 w-full items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
                      enhanceScale === value
                        ? "bg-muted text-foreground"
                        : "text-foreground",
                    )}
                  >
                    <ScanSearch className="size-4" />
                    Upscale {value}×
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!canEnhance}
                  onClick={() => {
                    void magicLayer();
                    setEnhanceOpen(false);
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-full px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <Layers2 className="size-4" />
                  Magic layer
                </button>
                {enhanceError ? (
                  <p className="px-3 pt-1 text-[13px] text-destructive">
                    {enhanceError}
                  </p>
                ) : null}
              </div>
            }
          >
            <EnhanceIcon className={cn("size-4", enhanceBusy && "animate-spin")} />
          </SplitTool>

          <BarDivider />

          <CaptionControls />

          <div className="flex h-9 items-center rounded-full bg-muted/50 p-0.5">
            <RailTool
              label="Previous slide"
              disabled={!canGoPrev}
              onClick={() => void prev()}
            >
              <ChevronLeft className="size-4" />
            </RailTool>
            <span className="min-w-10 px-1 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
              {currentIndex + 1}/{Math.max(slides.length, 1)}
            </span>
            <RailTool
              label="Next slide"
              disabled={!canGoNext}
              onClick={() => void next()}
            >
              <ChevronRight className="size-4" />
            </RailTool>
          </div>

          <BarDivider />

          <RailTool label="Zoom out" onClick={() => setZoom(clampZoom(zoom - 10))}>
            <ZoomOut className="size-4" />
          </RailTool>
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset zoom"
            className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full font-mono text-[11px] leading-none text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground"
          >
            {Math.round(zoom)}%
          </button>
          <RailTool label="Zoom in" onClick={() => setZoom(clampZoom(zoom + 10))}>
            <ZoomIn className="size-4" />
          </RailTool>
          <BarDivider />

          <RailTool label="Exit" hint="Leave focus mode. Esc" onClick={onExit}>
            <Minimize2 className="size-4" />
          </RailTool>
        </div>
      </div>
    </TooltipProvider>
  );
}
