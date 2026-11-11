"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";

import { ToolAvatar, ToolAvatarTile } from "@/components/canvas/sidebar/tool-avatars";
import {
  sidebarActionBtn,
  sidebarFieldInput,
  sidebarHint,
  sidebarSelectTrigger,
  sidebarTextarea,
} from "@/components/canvas/sidebar/sidebar-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { useCanvasObjects } from "@/hooks/use-canvas-objects";
import { useSlides } from "@/hooks/use-slides";
import { slidesFromLines, splitSlideLines, TEXT_STYLES, type TextStyleId } from "@/lib/canvas/document";
import { carouselTextHits, replaceTextInJSON, replaceTextOnNodes } from "@/lib/canvas/find-text";
import type { Corner, SlideNumberStyle } from "@/lib/canvas/objects";
import { formatSlideNumber } from "@/lib/canvas/objects";
import type { FrameKind } from "@/lib/canvas/frames";
import {
  buildDeviceRow,
  buildRankedMockupSlides,
  fillMockupsFromImages,
} from "@/lib/canvas/mockup-batch";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import {
  getTool,
  type StudioTool,
  type StudioToolId,
} from "@/lib/studio/tools-catalog";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

const NUMBER_STYLES: readonly SlideNumberStyle[] = ["1", "01", "1 / 8"];

const CORNERS: readonly { id: Corner; label: string }[] = [
  { id: "top-left", label: "Top left" },
  { id: "top-right", label: "Top right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-right", label: "Bottom right" },
];

const SWIPE_VARIANTS = ["swipe →", "next →", "→", "more →", "keep going →"] as const;

const DEVICE_OPTIONS: { id: FrameKind; label: string }[] = [
  { id: "iphone18pro", label: "iPhone 18 Pro" },
  { id: "iphone17pro", label: "iPhone 17 Pro" },
  { id: "iphone17promax", label: "iPhone 17 Pro Max" },
  { id: "iphoneAir", label: "iPhone Air" },
];

const ROW_COUNTS = [3, 4, 5] as const;

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="px-0.5 text-[12px] font-medium text-muted-foreground">{children}</p>;
}

function isCorner(value: string): value is Corner {
  return CORNERS.some((corner) => corner.id === value);
}

export function ToolPreviewArt({ tool, className }: { tool: StudioTool; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-28 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F4EE] p-5 dark:bg-muted/30",
        className,
      )}
    >
      <ToolAvatarTile tool={tool} className="size-20 rounded-2xl" />
    </div>
  );
}

function SlideNumberPanel() {
  const manager = useCanvasManager();
  const { currentIndex, slides } = useSlides();
  const [numberStyle, setNumberStyle] = useState<SlideNumberStyle>("1");
  const [numberCorner, setNumberCorner] = useState<Corner>("top-left");
  const slideIndex = Math.max(currentIndex, 0);
  const slideTotal = Math.max(slides.length, 1);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>Format</FieldLabel>
        <Select
          value={numberStyle}
          onValueChange={(next) => {
            if (next === "1" || next === "01" || next === "1 / 8") setNumberStyle(next);
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Number format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {NUMBER_STYLES.map((style) => (
              <SelectItem key={style} value={style} className="text-[13px]">
                {formatSlideNumber(style, slideIndex, slideTotal)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Corner</FieldLabel>
        <Select
          value={numberCorner}
          onValueChange={(next) => {
            if (isCorner(next)) setNumberCorner(next);
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Corner">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {CORNERS.map((corner) => (
              <SelectItem key={corner.id} value={corner.id} className="text-[13px]">
                {corner.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        type="button"
        disabled={!manager}
        onClick={() =>
          manager?.objects.addSlideNumber(numberStyle, slideIndex, slideTotal, numberCorner)
        }
        className={cn(sidebarActionBtn, "w-full")}
      >
        Add number
      </button>
    </div>
  );
}

function AuthorPanel() {
  const manager = useCanvasManager();
  const [handle, setHandle] = useState("@username");
  const [corner, setCorner] = useState<"left" | "right">("left");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>Handle</FieldLabel>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Upload avatar"
            onClick={() => avatarInputRef.current?.click()}
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/60 text-[12px] font-semibold dark:bg-muted/25"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              (handle.replace(/^@/, "")[0] || "?").toUpperCase()
            )}
          </button>
          <input
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="@username"
            aria-label="Handle"
            className={sidebarFieldInput}
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file || !file.type.startsWith("image/")) return;
              void fileToDataUrl(file, { maxEdge: 512, quality: 0.86 })
                .then(setAvatarUrl)
                .catch((err) => reportError(err, messages.errors.readAvatar));
            }}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Position</FieldLabel>
        <Select
          value={corner}
          onValueChange={(next) => {
            if (next === "left" || next === "right") setCorner(next);
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Position">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="left" className="text-[13px]">
              Top left
            </SelectItem>
            <SelectItem value="right" className="text-[13px]">
              Top right
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <button
        type="button"
        disabled={!manager}
        onClick={() =>
          void manager?.objects.addCornerHandle(
            handle.trim() || "@username",
            corner,
            undefined,
            avatarUrl,
          )
        }
        className={cn(sidebarActionBtn, "w-full")}
      >
        Add author
      </button>
    </div>
  );
}

function SwipeCuePanel() {
  const manager = useCanvasManager();
  const [swipeVariant, setSwipeVariant] = useState<string>(SWIPE_VARIANTS[0]);
  const [swipeCorner, setSwipeCorner] = useState<Corner>("bottom-right");

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>Text</FieldLabel>
        <Select value={swipeVariant} onValueChange={setSwipeVariant}>
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Swipe text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {SWIPE_VARIANTS.map((variant) => (
              <SelectItem key={variant} value={variant} className="text-[13px]">
                {variant}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Corner</FieldLabel>
        <Select
          value={swipeCorner}
          onValueChange={(next) => {
            if (isCorner(next)) setSwipeCorner(next);
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Corner">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {CORNERS.map((corner) => (
              <SelectItem key={corner.id} value={corner.id} className="text-[13px]">
                {corner.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        type="button"
        disabled={!manager}
        onClick={() => manager?.objects.addSwipeCue(swipeVariant, swipeCorner)}
        className={cn(sidebarActionBtn, "w-full")}
      >
        Add swipe
      </button>
    </div>
  );
}

function ProgressDotsPanel() {
  const manager = useCanvasManager();
  const { currentIndex, slides } = useSlides();
  const slideIndex = Math.max(currentIndex, 0);
  const slideTotal = Math.max(slides.length, 1);

  return (
    <div className="space-y-3">
      <p className={sidebarHint}>
        Adds bottom dots for slide {slideIndex + 1} of {slideTotal}.
      </p>
      <button
        type="button"
        disabled={!manager}
        onClick={() => manager?.objects.addProgressDots(slideTotal, slideIndex)}
        className={cn(sidebarActionBtn, "w-full")}
      >
        Add progress dots
      </button>
    </div>
  );
}

function SlidesFromTextPanel() {
  const slidesController = useSlidesController();
  const [prompt, setPrompt] = useState("");
  const [slideStyle, setSlideStyle] = useState<TextStyleId>("heading");
  const lineCount = splitSlideLines(prompt).length;

  const generateSlides = () => {
    if (!lineCount || !slidesController) return;
    const state = useCanvasStore.getState();
    const next = slidesFromLines({
      text: prompt,
      styleId: slideStyle,
      style: state.textStyles[slideStyle],
      palette: state.palette,
      chrome: state.chrome,
      width: state.canvasDimensions.width,
      height: state.canvasDimensions.height,
    });
    if (next.length === 0) return;
    state.setSlides(next);
    state.setCurrentSlideId(next[0]!.id);
    state.setDirty(true);
    void slidesController.loadCurrent();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>One line = one slide</FieldLabel>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={"Hook line\nProof point\nCall to action"}
          rows={4}
          className={sidebarTextarea}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Text style</FieldLabel>
        <Select
          value={slideStyle}
          onValueChange={(next) => {
            if (TEXT_STYLES.some((style) => style.id === next)) {
              setSlideStyle(next as TextStyleId);
            }
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Text style">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {TEXT_STYLES.map((style) => (
              <SelectItem key={style.id} value={style.id} className="text-[13px]">
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        type="button"
        disabled={!lineCount || !slidesController}
        onClick={generateSlides}
        className={cn(sidebarActionBtn, "w-full")}
      >
        {lineCount > 0 ? `Make ${lineCount} slides` : "Make slides"}
      </button>
    </div>
  );
}

function FindReplacePanel() {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const { currentSlideId, slides } = useSlides();
  const objects = useCanvasObjects();
  const [findQuery, setFindQuery] = useState("");
  const [findReplacement, setFindReplacement] = useState("");
  const [textTick, setTextTick] = useState(0);

  useEffect(() => {
    if (!manager) return;
    const bump = () => setTextTick((tick) => tick + 1);
    manager.canvas.on("text:changed", bump);
    return () => {
      manager.canvas.off("text:changed", bump);
    };
  }, [manager]);

  const textHits = useMemo(() => {
    return carouselTextHits({
      query: findQuery.trim(),
      matchCase: false,
      slides: slides.map((slide) => ({
        id: slide.id,
        objects:
          slide.id === currentSlideId && manager
            ? manager.canvas.getObjects()
            : (slide.canvasJSON.objects ?? []),
      })),
    });
  }, [slides, currentSlideId, manager, findQuery, textTick, objects]);

  const replaceText = () => {
    const query = findQuery.trim();
    if (!query || !slidesController) return;
    slidesController.saveCurrent();
    const store = useCanvasStore.getState();
    let total = 0;
    const next = store.slides.map((slide) => {
      const replaced = replaceTextInJSON(slide.canvasJSON, query, findReplacement, false);
      total += replaced.count;
      return replaced.count > 0 ? { ...slide, canvasJSON: replaced.json } : slide;
    });
    if (total === 0) return;
    store.setSlides(next);
    if (manager) {
      replaceTextOnNodes(manager.canvas.getObjects(), query, findReplacement, false);
      manager.canvas.requestRenderAll();
      manager.commit();
    }
    store.setDirty(true);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>Find</FieldLabel>
        <input
          value={findQuery}
          onChange={(event) => setFindQuery(event.target.value)}
          placeholder="Text to find"
          aria-label="Find text"
          className={sidebarFieldInput}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Replace with</FieldLabel>
        <input
          value={findReplacement}
          onChange={(event) => setFindReplacement(event.target.value)}
          placeholder="New text"
          aria-label="Replacement text"
          className={sidebarFieldInput}
        />
      </div>
      <p className="text-[12px] text-muted-foreground">
        {findQuery.trim()
          ? textHits.count === 0
            ? "No matches"
            : `${textHits.count} match${textHits.count === 1 ? "" : "es"}`
          : "Type to search across all slides"}
      </p>
      <button
        type="button"
        disabled={!findQuery.trim() || textHits.count === 0}
        onClick={replaceText}
        className={cn(sidebarActionBtn, "w-full")}
      >
        Replace all
      </button>
    </div>
  );
}

function MockupsPanel() {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const fillInputRef = useRef<HTMLInputElement>(null);
  const [titles, setTitles] = useState("Next.js\nRemix\nNuxt\nSvelteKit\nAstro");
  const [device, setDevice] = useState<FrameKind>("iphone18pro");
  const [action, setAction] = useState<"list" | "row" | "fill">("list");
  const [rowCount, setRowCount] = useState<(typeof ROW_COUNTS)[number]>(5);
  const [busy, setBusy] = useState(false);

  const lineCount = splitSlideLines(titles).length;
  const ready = !!manager && !!slidesController && !busy;

  const run = async (task: () => Promise<void>) => {
    if (!ready) return;
    setBusy(true);
    try {
      await task();
    } catch (err) {
      reportError(err, messages.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>Device</FieldLabel>
        <Select
          value={device}
          onValueChange={(value) => {
            if (DEVICE_OPTIONS.some((option) => option.id === value)) {
              setDevice(value as FrameKind);
            }
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Device">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {DEVICE_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id} className="text-[13px]">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Action</FieldLabel>
        <Select
          value={action}
          onValueChange={(value) => {
            if (value === "list" || value === "row" || value === "fill") setAction(value);
          }}
        >
          <SelectTrigger className={sidebarSelectTrigger} aria-label="Action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="list" className="text-[13px]">
              Ranked list from titles
            </SelectItem>
            <SelectItem value="row" className="text-[13px]">
              Row on this slide
            </SelectItem>
            <SelectItem value="fill" className="text-[13px]">
              Fill screenshots
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {action === "list" ? (
        <div className="space-y-1.5">
          <FieldLabel>Titles (one per line)</FieldLabel>
          <textarea
            value={titles}
            onChange={(event) => setTitles(event.target.value)}
            placeholder={"Next.js\nRemix\nNuxt"}
            rows={4}
            className={sidebarTextarea}
          />
        </div>
      ) : null}

      {action === "row" ? (
        <div className="space-y-1.5">
          <FieldLabel>Count</FieldLabel>
          <Select
            value={String(rowCount)}
            onValueChange={(value) => {
              const next = Number(value);
              if (ROW_COUNTS.includes(next as (typeof ROW_COUNTS)[number])) {
                setRowCount(next as (typeof ROW_COUNTS)[number]);
              }
            }}
          >
            <SelectTrigger className={sidebarSelectTrigger} aria-label="Row count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {ROW_COUNTS.map((count) => (
                <SelectItem key={count} value={String(count)} className="text-[13px]">
                  {count} devices
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <input
        ref={fillInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          event.target.value = "";
          if (!files?.length || !manager || !slidesController) return;
          void run(async () => {
            const screens: string[] = [];
            for (const file of Array.from(files)) {
              if (!file.type.startsWith("image/")) continue;
              screens.push(await fileToDataUrl(file, { maxEdge: 1600, quality: 0.88 }));
            }
            if (screens.length === 0) return;
            await fillMockupsFromImages({
              manager,
              slides: slidesController,
              kind: device,
              screens,
              mode: "per-slide",
            });
          });
        }}
      />

      <button
        type="button"
        disabled={!ready || (action === "list" && lineCount === 0)}
        onClick={() => {
          if (action === "fill") {
            fillInputRef.current?.click();
            return;
          }
          void run(async () => {
            if (action === "list") {
              await buildRankedMockupSlides({
                manager: manager!,
                slides: slidesController!,
                kind: device,
                titles: splitSlideLines(titles),
              });
              return;
            }
            await buildDeviceRow({
              manager: manager!,
              kind: device,
              count: rowCount,
            });
          });
        }}
        className={cn(sidebarActionBtn, "w-full")}
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {busy
          ? "Working…"
          : action === "list"
            ? `Build ${lineCount || ""} slides`
            : action === "row"
              ? `Place ${rowCount} devices`
              : "Pick screenshots"}
      </button>
    </div>
  );
}

export function ToolPanel({ id }: { id: StudioToolId }) {
  switch (id) {
    case "mockups":
      return <MockupsPanel />;
    case "slide-number":
      return <SlideNumberPanel />;
    case "author":
      return <AuthorPanel />;
    case "swipe-cue":
      return <SwipeCuePanel />;
    case "progress-dots":
      return <ProgressDotsPanel />;
    case "slides-from-text":
      return <SlidesFromTextPanel />;
    case "find-replace":
      return <FindReplacePanel />;
    default:
      return null;
  }
}

export function ToolDetailDialog({
  toolId,
  open,
  onOpenChange,
  onRun,
}: {
  toolId: StudioToolId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: (id: StudioToolId) => void;
}) {
  const [cached, setCached] = useState<StudioTool | null>(null);
  useEffect(() => {
    if (toolId) setCached(getTool(toolId) ?? null);
  }, [toolId]);
  const tool = (toolId ? getTool(toolId) : null) ?? cached;
  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[min(36rem,85dvh)] w-[min(22rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-sm"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <DialogTitle className="truncate text-[14px] font-semibold">{tool.title}</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 space-y-3 overflow-y-auto px-4 pb-3">
          <ToolPreviewArt tool={tool} className="min-h-32" />
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            {tool.description}
          </DialogDescription>
        </div>

        <div className="px-4 pb-4 pt-2">
          <Button
            type="button"
            className="h-10 w-full rounded-md bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onRun(tool.id)}
          >
            Run
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ToolRunDialog({
  toolId,
  open,
  onOpenChange,
}: {
  toolId: StudioToolId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [cached, setCached] = useState<StudioTool | null>(null);
  useEffect(() => {
    if (toolId) setCached(getTool(toolId) ?? null);
  }, [toolId]);
  const tool = (toolId ? getTool(toolId) : null) ?? cached;
  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[min(44rem,90dvh)] w-[min(24rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md"
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <ToolAvatar tool={tool} size="sm" />
          <DialogTitle className="min-w-0 flex-1 truncate text-[13px] font-semibold">
            {tool.title}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 pb-5 pt-1">
          <p className="text-[12px] leading-snug text-muted-foreground">{tool.description}</p>
          <ToolPanel id={tool.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
