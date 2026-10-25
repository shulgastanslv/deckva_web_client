"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FabricObject } from "fabric";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { useSlides } from "@/hooks/use-slides";
import { useCanvasObjects } from "@/hooks/use-canvas-objects";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { cn } from "@/lib/utils";
import type { Corner, Side, SlideNumberStyle } from "@/lib/canvas/objects";
import { formatSlideNumber } from "@/lib/canvas/objects";
import { slidesFromLines, splitSlideLines, TEXT_STYLES, type TextStyleId } from "@/lib/canvas/document";
import { useCanvasStore } from "@/store/useCanvasStore";
import { CornerLeftUpIcon, CornerRightUpIcon } from "lucide-react";
import { applyCarouselFont } from "@/lib/canvas/apply-carousel-font";
import { carouselTextHits, replaceTextInJSON, replaceTextOnNodes } from "@/lib/canvas/find-text";
import { loadGoogleFont, normalizeFontFamily, SUGGESTED_FONTS } from "@/lib/fonts/google-fonts";
import { FontSelect } from "@/components/canvas/font-select";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NUMBER_STYLES: readonly SlideNumberStyle[] = ["1", "01", "1 / 8"];

function firstFont(objects: FabricObject[]): string | null {
  for (const obj of objects) {
    const type = (obj.type || "").toLowerCase();
    if (type === "text" || type === "i-text" || type === "textbox") {
      const family = (obj as FabricObject & { fontFamily?: string }).fontFamily;
      if (typeof family === "string" && family.trim()) return normalizeFontFamily(family);
    }
    const children = (obj as FabricObject & { getObjects?: () => FabricObject[] }).getObjects?.();
    if (!children) continue;
    const nested = firstFont(children);
    if (nested) return nested;
  }
  return null;
}

const CORNERS: readonly { id: Corner; label: string }[] = [
  { id: "top-left", label: "Top left" },
  { id: "top-right", label: "Top right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-right", label: "Bottom right" },
];

const SWIPE_VARIANTS = [
  "swipe →",
  "→",
  "next →",
  "more →",
  "keep going →",
  "swipe for more",
  "read on →",
  "continue →",
  "see the rest →",
  "don't stop →",
  "part 2 →",
  "[swipe]",
  "(swipe)",
  "– swipe",
  ">>>",
] as const;

const SOCIAL_NETWORKS = [
  "Telegram",
  "Threads",
  "Instagram",
  "X",
  "YouTube",
  "TikTok",
  "LinkedIn",
  "Facebook",
  "Pinterest",
  "WhatsApp",
  "Discord",
  "GitHub",
  "Spotify",
  "Snapchat",
  "Reddit",
  "Behance",
  "Dribbble",
  "Website",
  "Email",
  "Newsletter",
] as const;

function isCorner(value: string): value is Corner {
  return CORNERS.some((corner) => corner.id === value);
}

function CornerSelect({
  value,
  onChange,
  disabled,
}: {
  value: Corner;
  onChange: (corner: Corner) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (isCorner(next)) onChange(next);
      }}
    >
      <SelectTrigger className="h-8 w-[7.25rem] shrink-0 rounded-full px-2.5 text-[13px]" aria-label="Position">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {CORNERS.map((corner) => (
          <SelectItem key={corner.id} value={corner.id} className="text-[13px]">
            {corner.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const actionButton =
  "h-8 rounded-full bg-muted px-2.5 text-[13px] text-foreground/80 transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-40 flex items-center justify-center gap-1";
const fieldInput =
  "h-8 w-full rounded-full bg-muted/40 px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/60";

export function SidebarTools() {
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const { currentIndex, currentSlideId, slides } = useSlides();
  const [prompt, setPrompt] = useState("");
  const [slideStyle, setSlideStyle] = useState<TextStyleId>("heading");
  const [handle, setHandle] = useState("@username");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [numberStyle, setNumberStyle] = useState<SlideNumberStyle>("1");
  const [numberCorner, setNumberCorner] = useState<Corner>("top-left");
  const [swipeCorner, setSwipeCorner] = useState<Corner>("bottom-right");
  const [socialNetwork, setSocialNetwork] = useState<string>(SOCIAL_NETWORKS[0]);
  const [socialHandle, setSocialHandle] = useState("");
  const [socialCorner, setSocialCorner] = useState<Corner>("bottom-left");
  const [extraFonts, setExtraFonts] = useState<string[]>([]);
  const [textTick, setTextTick] = useState(0);
  const objects = useCanvasObjects();
  const markedSlideIds = useCanvasStore((s) => s.markedSlideIds);
  const [fontScope, setFontScope] = useState<"all" | "marked">("all");
  const [findQuery, setFindQuery] = useState("");
  const [findReplacement, setFindReplacement] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [swipeVariant, setSwipeVariant] = useState<string>(SWIPE_VARIANTS[0]);
  const activeFont = firstFont(objects);

  useEffect(() => {
    for (const family of SUGGESTED_FONTS) void loadGoogleFont(family);
  }, []);

  const useFont = (family: string) => {
    if (fontScope === "marked" && markedSlideIds.length === 0) return;
    void loadGoogleFont(family).then(() => {
      applyCarouselFont(
        family,
        manager,
        fontScope === "marked" ? markedSlideIds : undefined,
      );
    });
  };

  const slideIndex = Math.max(currentIndex, 0);
  const slideTotal = Math.max(slides.length, 1);
  const handleText = handle.trim() || "@username";
  const handleInitial = (handleText.replace(/^@/, "")[0] || "?").toUpperCase();
  const fontChoices = [
    ...SUGGESTED_FONTS,
    ...extraFonts.filter((family) => !(SUGGESTED_FONTS as readonly string[]).includes(family)),
  ];

  const addFont = (family: string) => {
    const name = normalizeFontFamily(family);
    setExtraFonts((prev) =>
      prev.includes(name) || (SUGGESTED_FONTS as readonly string[]).includes(name) ? prev : [...prev, name],
    );
    useFont(name);
  };

  const addHandle = (side: Side) => {
    void manager?.objects.addCornerHandle(handle.trim() || "@username", side, undefined, avatarUrl);
  };

  const onAvatarFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    void fileToDataUrl(file, { maxEdge: 512, quality: 0.86 }).then(setAvatarUrl).catch(console.error);
  };

  const lineCount = splitSlideLines(prompt).length;

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
      matchCase,
      slides: slides.map((slide) => ({
        id: slide.id,
        objects:
          slide.id === currentSlideId && manager
            ? manager.canvas.getObjects()
            : (slide.canvasJSON.objects ?? []),
      })),
    });
  }, [slides, currentSlideId, manager, findQuery, matchCase, textTick, objects]);

  const replaceText = () => {
    const query = findQuery.trim();
    if (!query || !slidesController) return;
    slidesController.saveCurrent();
    const store = useCanvasStore.getState();
    let total = 0;
    const next = store.slides.map((slide) => {
      const replaced = replaceTextInJSON(slide.canvasJSON, query, findReplacement, matchCase);
      total += replaced.count;
      return replaced.count > 0 ? { ...slide, canvasJSON: replaced.json } : slide;
    });
    if (total === 0) return;
    store.setSlides(next);
    if (manager) {
      replaceTextOnNodes(manager.canvas.getObjects(), query, findReplacement, matchCase);
      manager.canvas.requestRenderAll();
      manager.commit();
    }
    store.setDirty(true);
  };

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
    <div className="flex flex-col text-[13px] text-foreground">

      <CollapsibleGroup id="tools-find" title="Find">
        <div className="space-y-1.5">
          <input
            value={findQuery}
            onChange={(event) => setFindQuery(event.target.value)}
            placeholder="Find"
            aria-label="Find text"
            className={fieldInput}
          />
          <input
            value={findReplacement}
            onChange={(event) => setFindReplacement(event.target.value)}
            placeholder="Replace with"
            aria-label="Replacement text"
            className={fieldInput}
          />
          <label className="flex items-center gap-2 px-0.5 text-[13px] text-muted-foreground">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(event) => setMatchCase(event.target.checked)}
              className="size-3.5 rounded-sm"
            />
            Match case
          </label>
          <p className="px-0.5 text-[13px] text-muted-foreground">
            {findQuery.trim()
              ? textHits.count === 0
                ? "No matches"
                : `${textHits.count} on slide${textHits.slides.length === 1 ? "" : "s"} ${textHits.slides.join(", ")}`
              : "Searches every slide"}
          </p>
          <button
            type="button"
            disabled={!findQuery.trim() || textHits.count === 0}
            onClick={replaceText}
            className={cn(actionButton, "w-full")}
          >
            Replace
          </button>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="tools-slides" title="Slides from text">
        <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="One line, one slide"
          rows={3}
          className="w-full resize-none rounded-xl bg-muted/30 px-3 py-2 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground focus:bg-muted/40"
        />
        <div className="grid grid-cols-3 gap-1">
          {TEXT_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSlideStyle(style.id)}
              className={cn(
                "h-7 rounded-full px-1 text-[13px] transition-colors",
                slideStyle === style.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {style.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!lineCount || !slidesController}
          onClick={generateSlides}
          className={cn(actionButton, "w-full")}
        >
          Generate{lineCount > 0 ? ` · ${lineCount}` : ""}
        </button>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="tools-numbers" title="Slide numbers">
        <div className="space-y-1.5">
          <div className="flex gap-1">
            <Select
              value={numberStyle}
              onValueChange={(next) => {
                if (next === "1" || next === "01" || next === "1 / 8") setNumberStyle(next);
              }}
            >
              <SelectTrigger className="h-8 min-w-0 flex-1 rounded-full px-2.5 text-[13px]" aria-label="Slide number">
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
            <CornerSelect value={numberCorner} onChange={setNumberCorner} disabled={!manager} />
          </div>
          <button
            type="button"
            disabled={!manager}
            onClick={() => manager?.objects.addSlideNumber(numberStyle, slideIndex, slideTotal, numberCorner)}
            className={cn(actionButton, "w-full")}
          >
            Place
          </button>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="tools-handle" title="Author">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/30 px-2.5 py-2">
            <button
              type="button"
              title="Change avatar"
              onClick={() => avatarInputRef.current?.click()}
              className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/10 text-[13px] font-semibold"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                handleInitial
              )}
            </button>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight">{handleText}</span>
            {avatarUrl ? (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Avatar
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                onAvatarFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@username"
            aria-label="Handle"
            className={fieldInput}
          />
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              disabled={!manager}
              onClick={() => addHandle("left")}
              className={actionButton}
            >
              <CornerLeftUpIcon className="size-3.5" />
              Top left
            </button>
            <button
              type="button"
              disabled={!manager}
              onClick={() => addHandle("right")}
              className={actionButton}
            >
              <CornerRightUpIcon className="size-3.5" />
              Top right
            </button>
          </div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="tools-cues" title="Swipe">
        <div className="space-y-2">
          <div className="flex gap-1">
            <Select value={swipeVariant} onValueChange={setSwipeVariant}>
              <SelectTrigger className="h-8 min-w-0 flex-1 rounded-full px-2.5 text-[13px]" aria-label="Swipe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {SWIPE_VARIANTS.map((variant) => (
                  <SelectItem key={variant} value={variant} className="text-[13px]">
                    {variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CornerSelect value={swipeCorner} onChange={setSwipeCorner} disabled={!manager} />
          </div>
          <button
            type="button"
            disabled={!manager}
            onClick={() => manager?.objects.addSwipeCue(swipeVariant, swipeCorner)}
            className={cn(actionButton, "w-full")}
          >
            Place
          </button>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="tools-socials" title="Socials">
        <div className="space-y-1.5">
          <div className="flex gap-1">
            <Select value={socialNetwork} onValueChange={setSocialNetwork}>
              <SelectTrigger className="h-8 min-w-0 flex-1 rounded-full px-2.5 text-[13px]" aria-label="Network">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {SOCIAL_NETWORKS.map((network) => (
                  <SelectItem key={network} value={network} className="text-[13px]">
                    {network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CornerSelect value={socialCorner} onChange={setSocialCorner} disabled={!manager} />
          </div>
          <input
            value={socialHandle}
            onChange={(event) => setSocialHandle(event.target.value)}
            placeholder="@name"
            aria-label="Handle"
            className={fieldInput}
          />
          <button
            type="button"
            disabled={!manager || !socialHandle.trim()}
            onClick={() =>
              manager?.objects.addSocials([{ label: socialNetwork, value: socialHandle }], socialCorner)
            }
            className={cn(actionButton, "w-full")}
          >
            Place
          </button>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup id="tools-progress" title="Progress dots">
        <div className="space-y-2">
          <p className="px-0.5 text-[12px] leading-snug text-muted-foreground">
            Slide position indicator for the bottom of the frame.
          </p>
          <button
            type="button"
            disabled={!manager}
            onClick={() =>
              manager?.objects.addProgressDots(slideTotal, slideIndex)
            }
            className={cn(actionButton, "w-full")}
          >
            Place · {slideIndex + 1}/{slideTotal}
          </button>
        </div>
      </CollapsibleGroup>
    </div>
  );
}
