"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CaseSensitive,
  ChevronDown,
  Italic,
  List,
  ListOrdered,
  Minus,
  Paintbrush,
  Plus,
  Strikethrough,
  Underline,
} from "lucide-react";
import type { FabricObject, FabricText } from "fabric";
import { HexColorPicker } from "react-colorful";
import { FontSelect } from "@/components/canvas/font-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PillSlider } from "@/components/ui/pill-slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvasManager } from "@/context/canvas-manager";
import { normalizeHex, toPickerHex } from "@/lib/color/hex";
import { refreshCanvasFonts } from "@/lib/canvas/paint-live";
import {
  copyStyleFromSelection,
  hasCopiedStyle,
  pasteObjectStyle,
  subscribeCopiedStyle,
} from "@/lib/canvas/style-clipboard";
import {
  applyList,
  applySelectionStyle,
  writeFormattedText,
  type ListKind,
} from "@/lib/canvas/text-format";
import type { TextStyles } from "@/lib/canvas/text-flow";
import { refreshMask } from "@/lib/canvas/object-appearance";
import {
  loadGoogleFont,
  normalizeFontFamily,
} from "@/lib/fonts/google-fonts";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

type TextAlign = "left" | "center" | "right" | "justify";

type ToolbarAnchor = {
  left: number;
  top: number;
  width: number;
  below: boolean;
};

type TextState = {
  fontFamily: string;
  fontSize: number;
  fill: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  textAlign: TextAlign;
  lineHeight: number;
  charSpacing: number;
  opacity: number;
  text: string;
};

const TEXT_TYPES = new Set(["text", "i-text", "textbox"]);
const GAP = 12;
const BAR_ESTIMATE = 44;

function isTextObject(obj: FabricObject | null | undefined): boolean {
  return Boolean(obj && TEXT_TYPES.has(obj.type ?? ""));
}

function textTarget(obj: FabricObject | null | undefined): FabricObject | null {
  if (!obj) return null;
  if (isTextObject(obj)) return obj;
  if (obj.type !== "activeselection") return null;
  const members = (obj as FabricObject & { getObjects: () => FabricObject[] }).getObjects();
  if (members.length === 0 || !members.every(isTextObject)) return null;
  return members[0] ?? null;
}

function readTextState(obj: FabricObject): TextState {
  const text = obj as unknown as FabricText;
  const rawFill = text.fill;
  return {
    fontFamily: normalizeFontFamily(
      typeof text.fontFamily === "string" ? text.fontFamily : undefined,
    ),
    fontSize: Math.round(text.fontSize ?? 32),
    fill: typeof rawFill === "string" ? rawFill : "#000000",
    isBold: text.fontWeight === "bold" || Number(text.fontWeight) >= 700,
    isItalic: text.fontStyle === "italic",
    isUnderline: Boolean(text.underline),
    isStrike: Boolean(text.linethrough),
    textAlign: (text.textAlign as TextAlign) ?? "left",
    lineHeight: text.lineHeight ?? 1.16,
    charSpacing: text.charSpacing ?? 0,
    opacity: text.opacity ?? 1,
    text: text.text ?? "",
  };
}

function cycleCase(value: string): string {
  const trimmed = value;
  if (!trimmed) return trimmed;
  const letters = trimmed.replace(/\s/g, "");
  if (!letters) return trimmed;
  if (letters === letters.toUpperCase()) return trimmed.toLowerCase();
  if (letters === letters.toLowerCase()) {
    return trimmed.replace(/\S+/g, (word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word,
    );
  }
  return trimmed.toUpperCase();
}

function ToolBtn({
  label,
  active,
  disabled,
  onClick,
  children,
  className,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          title={label}
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
            "hover:bg-muted/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
            active && "bg-muted text-foreground",
            className,
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[13px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function BarDivider() {
  return <div className="mx-0.5 h-4 w-px shrink-0 bg-border/70" />;
}

function TextColorButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const picker = toPickerHex(value || "#000000");
  const [draft, setDraft] = useState(picker);

  useEffect(() => {
    if (!open) setDraft(toPickerHex(value || "#000000"));
  }, [value, open]);

  const apply = (hex: string) => {
    const next = normalizeHex(hex);
    if (!next) return;
    setDraft(next);
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Text color"
              className="inline-flex size-8 shrink-0 flex-col items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted/70"
            >
              <span className="text-[13px] font-semibold leading-none">A</span>
              <span
                className="mt-0.5 h-0.5 w-3.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)",
                }}
                aria-hidden
              />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[13px]">
          Text color
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[220px] space-y-3 bg-background p-3 dark:bg-background"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <HexColorPicker
          color={draft}
          onChange={apply}
          className="!h-[140px] !w-full"
        />
        <div className="flex items-center gap-2 rounded-full bg-muted/40 px-2.5">
          <span
            className="size-4 shrink-0 rounded-full ring-1 ring-border/50"
            style={{ backgroundColor: draft }}
            aria-hidden
          />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const next = normalizeHex(draft);
              if (next) apply(next);
              else setDraft(picker);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const next = normalizeHex(draft);
                if (next) apply(next);
              }
            }}
            spellCheck={false}
            className="h-8 flex-1 border-0 bg-transparent px-1 font-mono text-[13px] uppercase shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function measureAnchor(
  canvas: { getZoom: () => number; getWidth: () => number; getHeight: () => number },
  canvasEl: HTMLElement,
  obj: FabricObject,
  viewport: DOMRect,
): ToolbarAnchor | null {
  obj.setCoords();
  const rect = obj.getBoundingRect();
  const canvasRect = canvasEl.getBoundingClientRect();
  const zoom = canvas.getZoom() || 1;
  const nativeW = Math.max(1, (canvas.getWidth() || 1) / zoom);
  const nativeH = Math.max(1, (canvas.getHeight() || 1) / zoom);
  const scaleX = canvasRect.width / nativeW;
  const scaleY = canvasRect.height / nativeH;
  const left = canvasRect.left + rect.left * scaleX;
  const top = canvasRect.top + rect.top * scaleY;
  const width = rect.width * scaleX;
  const height = rect.height * scaleY;
  const centerX = left + width / 2;
  const aboveTop = top - GAP;
  const fitsAbove = aboveTop - BAR_ESTIMATE > viewport.top + 8;
  return {
    left: centerX,
    top: fitsAbove ? aboveTop : top + height + GAP,
    width,
    below: !fitsAbove,
  };
}

function sameAnchor(a: ToolbarAnchor | null, b: ToolbarAnchor | null): boolean {
  if (!a || !b) return a === b;
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    a.below === b.below
  );
}

export function SelectionToolbar() {
  const manager = useCanvasManager();
  const selectedObject = useCanvasStore((s) => s.selectedObject);
  const handActive = useCanvasStore((s) => s.handActive);
  const eraserActive = useCanvasStore((s) => s.eraserActive);
  const zoom = useCanvasStore((s) => s.zoom);
  const copiedStyle = useSyncExternalStore(
    subscribeCopiedStyle,
    hasCopiedStyle,
    () => false,
  );

  const [anchor, setAnchor] = useState<ToolbarAnchor | null>(null);
  const [textState, setTextState] = useState<TextState | null>(null);
  const rafRef = useRef(0);

  const active = selectedObject;
  const textObj = textTarget(active);
  const showText = textObj != null;
  const cropping = Boolean(manager?.crop.active);
  const visible = Boolean(manager && active && !handActive && !eraserActive && !cropping);

  const refresh = useCallback(() => {
    if (!manager || !active) {
      setAnchor(null);
      setTextState(null);
      return;
    }
    const canvasEl = manager.canvas.getElement() as HTMLCanvasElement | null;
    if (!canvasEl) {
      setAnchor(null);
      return;
    }
    const parent = canvasEl.closest("main") ?? document.documentElement;
    const viewport = parent.getBoundingClientRect();
    const next = measureAnchor(manager.canvas, canvasEl, active, viewport);
    setAnchor((prev) => (sameAnchor(prev, next) ? prev : next));
    const target = textTarget(active);
    setTextState(target ? readTextState(target) : null);
  }, [manager, active]);

  const scheduleRefresh = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      refresh();
    });
  }, [refresh]);

  useLayoutEffect(() => {
    refresh();
  }, [refresh, zoom, selectedObject]);

  useEffect(() => {
    if (!manager) return;
    const canvas = manager.canvas;

    const onTransform = () => scheduleRefresh();
    const onSelection = () => refresh();

    canvas.on("object:moving", onTransform);
    canvas.on("object:scaling", onTransform);
    canvas.on("object:rotating", onTransform);
    canvas.on("object:modified", onSelection);
    canvas.on("selection:created", onSelection);
    canvas.on("selection:updated", onSelection);
    canvas.on("selection:cleared", onSelection);

    const scroller = canvas.getElement()?.closest(".overflow-auto");
    scroller?.addEventListener("scroll", scheduleRefresh, { passive: true });
    window.addEventListener("resize", scheduleRefresh);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.off("object:moving", onTransform);
      canvas.off("object:scaling", onTransform);
      canvas.off("object:rotating", onTransform);
      canvas.off("object:modified", onSelection);
      canvas.off("selection:created", onSelection);
      canvas.off("selection:updated", onSelection);
      canvas.off("selection:cleared", onSelection);
      scroller?.removeEventListener("scroll", scheduleRefresh);
      window.removeEventListener("resize", scheduleRefresh);
    };
  }, [manager, refresh, scheduleRefresh]);

  useEffect(() => {
    if (!textState?.fontFamily || !manager) return;
    const family = textState.fontFamily;
    void loadGoogleFont(family).then(() => refreshCanvasFonts(manager.canvas));
  }, [textState?.fontFamily, manager]);

  const update = (updates: Partial<FabricObject>) => {
    manager?.updateActiveObject(updates);
    const target = textTarget(manager?.getActiveObject() ?? active);
    if (target) setTextState(readTextState(target));
  };

  const toggleStyle = (
    kind: "bold" | "italic" | "underline" | "strike",
  ) => {
    if (!manager || !textState || !textObj) return;
    const next =
      kind === "bold"
        ? !textState.isBold
        : kind === "italic"
          ? !textState.isItalic
          : kind === "underline"
            ? !textState.isUnderline
            : !textState.isStrike;
    const patch =
      kind === "bold"
        ? { fontWeight: next ? "bold" : "normal" }
        : kind === "italic"
          ? { fontStyle: next ? "italic" : "normal" }
          : kind === "underline"
            ? { underline: next }
            : { linethrough: next };

    const editing = manager.getActiveObject();
    if (editing && applySelectionStyle(editing, patch)) {
      refreshMask(editing);
      manager.canvas.requestRenderAll();
      manager.commit();
      setTextState(readTextState(textObj));
      return;
    }
    update(patch as Partial<FabricObject>);
  };

  const bumpFontSize = (delta: number) => {
    if (!textState) return;
    const next = Math.min(240, Math.max(8, textState.fontSize + delta));
    update({ fontSize: next } as unknown as Partial<FabricObject>);
  };

  const applyTextList = (kind: ListKind) => {
    if (!manager || !textObj || !textState) return;
    const styles = (textObj as FabricObject & { styles?: TextStyles }).styles;
    const next = applyList(textState.text, styles, kind);
    writeFormattedText(textObj, next.text, next.styles);
    refreshMask(textObj);
    manager.canvas.requestRenderAll();
    manager.commit();
    setTextState(readTextState(textObj));
  };

  const applyCase = () => {
    if (!textState) return;
    update({ text: cycleCase(textState.text) } as unknown as Partial<FabricObject>);
  };

  const copyOrPasteStyle = () => {
    if (!manager) return;
    if (copiedStyle) {
      manager.transact(() => pasteObjectStyle(manager.canvas));
      return;
    }
    copyStyleFromSelection(manager.canvas);
  };

  if (!visible || !anchor || (showText && !textState)) return null;

  const alignIcon = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
    justify: AlignJustify,
  } as const;
  const AlignIcon = alignIcon[textState?.textAlign ?? "left"];

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className="pointer-events-none fixed z-40"
        style={{
          left: anchor.left,
          top: anchor.top,
          transform: anchor.below
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
        }}
      >
        <div
          className="pointer-events-auto flex max-w-[min(920px,calc(100vw-24px))] items-center gap-0.5 overflow-x-auto rounded-full border border-border/50 bg-background/95 p-1 backdrop-blur-md"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {showText && textState && (
            <>
              <FontSelect
                compact
                value={textState.fontFamily}
                onChange={(family) => {
                  update({ fontFamily: family } as unknown as Partial<FabricObject>);
                  if (manager) refreshCanvasFonts(manager.canvas);
                }}
              />

              <div className="flex h-8 items-center rounded-full bg-muted/40 px-0.5">
                <ToolBtn label="Smaller" onClick={() => bumpFontSize(-1)}>
                  <Minus className="size-3.5" />
                </ToolBtn>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Font size"
                  value={textState.fontSize}
                  onChange={(e) => {
                    const parsed = Number(e.target.value.replace(/\D/g, ""));
                    if (!Number.isFinite(parsed)) return;
                    const next = Math.min(240, Math.max(8, parsed));
                    update({ fontSize: next } as unknown as Partial<FabricObject>);
                  }}
                  className="h-7 w-8 border-0 bg-transparent text-center text-[13px] tabular-nums text-foreground outline-none"
                />
                <ToolBtn label="Larger" onClick={() => bumpFontSize(1)}>
                  <Plus className="size-3.5" />
                </ToolBtn>
              </div>

              <TextColorButton
                value={textState.fill}
                onChange={(hex) =>
                  update({
                    fill: hex,
                    swibpSlot: "",
                  } as unknown as Partial<FabricObject>)
                }
              />

              <BarDivider />

              <ToolBtn
                label="Bold"
                active={textState.isBold}
                onClick={() => toggleStyle("bold")}
              >
                <Bold className="size-3.5" />
              </ToolBtn>
              <ToolBtn
                label="Italic"
                active={textState.isItalic}
                onClick={() => toggleStyle("italic")}
              >
                <Italic className="size-3.5" />
              </ToolBtn>
              <ToolBtn
                label="Underline"
                active={textState.isUnderline}
                onClick={() => toggleStyle("underline")}
              >
                <Underline className="size-3.5" />
              </ToolBtn>
              <ToolBtn
                label="Strikethrough"
                active={textState.isStrike}
                onClick={() => toggleStyle("strike")}
              >
                <Strikethrough className="size-3.5" />
              </ToolBtn>
              <ToolBtn label="Change case" onClick={applyCase}>
                <CaseSensitive className="size-3.5" />
              </ToolBtn>

              <BarDivider />

              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Alignment"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        <AlignIcon className="size-3.5" />
                        <ChevronDown className="ml-0.5 size-2.5 opacity-60" />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[13px]">
                    Alignment
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="flex w-auto gap-0.5 p-1" align="center">
                  {(
                    [
                      ["left", AlignLeft, "Left"],
                      ["center", AlignCenter, "Center"],
                      ["right", AlignRight, "Right"],
                      ["justify", AlignJustify, "Justify"],
                    ] as const
                  ).map(([align, Icon, label]) => (
                    <button
                      key={align}
                      type="button"
                      title={label}
                      onClick={() =>
                        update({
                          textAlign: align,
                        } as unknown as Partial<FabricObject>)
                      }
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                        textState.textAlign === align
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="List"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        <List className="size-3.5" />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[13px]">
                    List
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="flex w-auto gap-0.5 p-1" align="center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full gap-1.5 px-2.5 text-[13px]"
                    onClick={() => applyTextList("bullet")}
                  >
                    <List className="size-3.5" />
                    Bullets
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full gap-1.5 px-2.5 text-[13px]"
                    onClick={() => applyTextList("number")}
                  >
                    <ListOrdered className="size-3.5" />
                    Numbers
                  </Button>
                </PopoverContent>
              </Popover>

              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Spacing"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        <span className="relative flex h-3.5 w-3.5 flex-col justify-between">
                          <span className="h-px w-full bg-current" />
                          <span className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-current" />
                          <span className="h-px w-full bg-current" />
                        </span>
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[13px]">
                    Spacing
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-60 space-y-2 p-3" align="center">
                  <PillSlider
                    label="Line height"
                    value={textState.lineHeight}
                    min={0.8}
                    max={2.5}
                    step={0.05}
                    formatValue={(v) => v.toFixed(2)}
                    onValueChange={(v) =>
                      update({
                        lineHeight: v,
                      } as unknown as Partial<FabricObject>)
                    }
                  />
                  <PillSlider
                    label="Letter spacing"
                    value={textState.charSpacing}
                    min={-200}
                    max={800}
                    step={10}
                    formatValue={(v) => String(Math.round(v))}
                    onValueChange={(v) =>
                      update({
                        charSpacing: v,
                      } as unknown as Partial<FabricObject>)
                    }
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Transparency"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        <span
                          className="size-3.5 rounded-[3px] ring-1 ring-current/40"
                          style={{
                            backgroundImage:
                              "linear-gradient(45deg,#a3a3a3 25%,transparent 25%),linear-gradient(-45deg,#a3a3a3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#a3a3a3 75%),linear-gradient(-45deg,transparent 75%,#a3a3a3 75%)",
                            backgroundSize: "6px 6px",
                            backgroundPosition: "0 0,0 3px,3px -3px,-3px 0",
                            opacity: textState.opacity,
                          }}
                        />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[13px]">
                    Transparency
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-56 p-3" align="center">
                  <PillSlider
                    label="Opacity"
                    value={Math.round(textState.opacity * 100)}
                    min={0}
                    max={100}
                    formatValue={(v) => `${Math.round(v)}%`}
                    onValueChange={(v) =>
                      update({
                        opacity: v / 100,
                      } as unknown as Partial<FabricObject>)
                    }
                  />
                </PopoverContent>
              </Popover>

              <BarDivider />
            </>
          )}

          {!showText && active && (
            <>
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Transparency"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        Opacity
                        <span className="tabular-nums text-foreground">
                          {Math.round((active.opacity ?? 1) * 100)}%
                        </span>
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[13px]">
                    Transparency
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-56 p-3" align="center">
                  <PillSlider
                    label="Opacity"
                    value={Math.round((active.opacity ?? 1) * 100)}
                    min={0}
                    max={100}
                    formatValue={(v) => `${Math.round(v)}%`}
                    onValueChange={(v) =>
                      update({
                        opacity: v / 100,
                      } as unknown as Partial<FabricObject>)
                    }
                  />
                </PopoverContent>
              </Popover>
              <BarDivider />
            </>
          )}

          <ToolBtn
            label={copiedStyle ? "Paste style" : "Copy style"}
            active={copiedStyle}
            onClick={copyOrPasteStyle}
          >
            <Paintbrush className="size-3.5" />
          </ToolBtn>
        </div>
      </div>
    </TooltipProvider>
  );
}
