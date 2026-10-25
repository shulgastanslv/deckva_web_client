"use client";

import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  AlignLeft,
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
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  { id: "text", label: "Text", hint: "Single line of text", icon: Type, shortcut: "T", key: "t" },
  { id: "heading", label: "Heading", hint: "Large title", icon: Heading1 },
  { id: "subtitle", label: "Subtitle", hint: "Smaller title under the heading", icon: Heading2 },
  { id: "paragraph", label: "Paragraph", hint: "Body text", icon: AlignLeft },
  { id: "quote", label: "Quote", hint: "Quoted line", icon: Quote },
];

function isTypingTarget() {
  const el = document.activeElement;
  if (
    el instanceof HTMLElement &&
    (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)
  ) {
    return true;
  }
  return false;
}

function ToolHint({ label, shortcut, hint }: { label: string; shortcut?: string; hint?: string }) {
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className="flex items-center gap-1.5">
        {label}
        {shortcut && (
          <kbd className="rounded-sm bg-background/15 px-1 font-mono text-[10px]">{shortcut}</kbd>
        )}
      </span>
      {hint && <span className="opacity-80">{hint}</span>}
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
  menu,
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
  menu?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative size-8 shrink-0">
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
      {menu}
    </div>
  );
}

function CornerMenu({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className="absolute right-0 bottom-0 z-10 flex size-3 items-center justify-center text-muted-foreground disabled:pointer-events-none"
        >
          <span className="block size-0 border-y-[2.5px] border-l-[4px] border-y-transparent border-l-current" />
        </button>
      </DropdownMenuTrigger>
      {children}
    </DropdownMenu>
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
  const active = tools.find((tool) => tool.id === activeId) ?? tools[0];
  const Icon = active.icon;

  return (
    <RailTool
      label={active.label}
      hint={active.hint}
      shortcut={active.shortcut}
      disabled={disabled}
      onClick={() => onUse(active)}
      menu={
        <CornerMenu label={`${active.label} options`} disabled={disabled}>
          <DropdownMenuContent side="top" align="center" sideOffset={10} className="w-52!">
            {tools.map((tool) => {
              const ItemIcon = tool.icon;
              const selected = tool.id === active.id;
              return (
                <DropdownMenuItem
                  key={tool.id}
                  onSelect={() => onUse(tool)}
                  className={cn("gap-2", selected && "bg-accent")}
                >
                  <ItemIcon />
                  <span className="flex-1">{tool.label}</span>
                  {tool.shortcut && <DropdownMenuShortcut>{tool.shortcut}</DropdownMenuShortcut>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </CornerMenu>
      }
    >
      <Icon className="size-4" />
    </RailTool>
  );
}

function BarDivider() {
  return <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />;
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
  const [shapeId, setShapeId] = useState(SHAPES[0].id);
  const [textId, setTextId] = useState(TEXTS[0].id);
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
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
      if (isTypingTarget()) return;
      if (event.target instanceof Element && event.target.closest("[data-slot='dropdown-menu-content']")) return;
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
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-3">
        <div className="pointer-events-auto flex w-fit max-w-[calc(100vw-24px)] items-center gap-1 overflow-x-auto rounded-full border border-border/50 bg-background/90 p-1.5 shadow-lg backdrop-blur-md">
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

          <RailTool
            label="Image"
            hint="Upload or drop a picture"
            dragging={isDragging}
            disabled={!manager}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onImageDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onImageDrop}
            menu={
              <CornerMenu label="Image options" disabled={!manager}>
              <DropdownMenuContent side="top" align="center" sideOffset={10} className="w-64!">
                <DropdownMenuItem onSelect={() => fileInputRef.current?.click()} className="gap-2">
                  <ImagePlus />
                  Upload image
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Image from a link</DropdownMenuLabel>
                <div className="flex items-center gap-1.5 px-1.5 pb-1.5" onKeyDown={(event) => event.stopPropagation()}>
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
                          void addImageFromUrl();
                        }
                      }}
                      className="h-8 rounded-full border-border/50 bg-muted/30 pl-7 text-[13px] shadow-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!manager || urlLoading || !imageUrl.trim()}
                    onClick={() => void addImageFromUrl()}
                    className="h-8 shrink-0 rounded-full px-2.5 text-[13px]"
                  >
                    {urlLoading ? <Loader2 className="size-3 animate-spin" /> : "Add"}
                  </Button>
                </div>
                {urlError && <p className="px-2 pb-1.5 text-[13px] text-destructive">{urlError}</p>}
              </DropdownMenuContent>
              </CornerMenu>
            }
          >
            <ImagePlus className="size-4" />
          </RailTool>

          <RailTool
            label="Enhance"
            hint={
              enhanceBusy
                ? "Working…"
                : enhanceError
                  ? enhanceError
                  : "Remove BG, upscale, magic layer — select an image"
            }
            disabled={!canEnhance}
            onClick={() => void removeBackground()}
            menu={
              <CornerMenu label="Enhance options" disabled={Boolean(enhanceBusy)}>
                <DropdownMenuContent side="top" align="center" sideOffset={10} className="w-56!">
                  <DropdownMenuItem
                    disabled={!canEnhance}
                    onSelect={() => void removeBackground()}
                    className="gap-2"
                  >
                    <WandSparkles />
                    Remove background
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Upscale</DropdownMenuLabel>
                  {([2, 3, 4] as UpscaleScale[]).map((value) => (
                    <DropdownMenuItem
                      key={value}
                      disabled={!canEnhance}
                      onSelect={() => {
                        setEnhanceScale(value);
                        void upscale(value);
                      }}
                      className="gap-2"
                    >
                      <ScanSearch />
                      Upscale {value}×
                      {enhanceScale === value && (
                        <DropdownMenuShortcut className="tracking-normal">active</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!canEnhance}
                    onSelect={() => void magicLayer()}
                    className="gap-2"
                  >
                    <Layers2 />
                    Magic layer
                  </DropdownMenuItem>
                  {enhanceError && (
                    <p className="px-2 pb-1.5 text-[13px] text-destructive">{enhanceError}</p>
                  )}
                </DropdownMenuContent>
              </CornerMenu>
            }
          >
            <EnhanceIcon className={cn("size-4", enhanceBusy && "animate-spin")} />
          </RailTool>

          <BarDivider />

          <RailTool label="Zoom out" onClick={() => setZoom(clampZoom(zoom - 10))}>
            <ZoomOut className="size-4" />
          </RailTool>
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset zoom"
            className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg font-mono text-[10px] leading-none text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground"
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
