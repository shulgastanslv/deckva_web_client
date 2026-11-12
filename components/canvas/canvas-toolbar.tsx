"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FabricObject } from "fabric";
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  CopySimple as CopyPlus,
  DownloadSimple as Download,
  Eraser,
  Eye,
  EyeSlash as EyeOff,
  FilePlus,
  GridFour as Grid3X3,
  Hash,
  Hand,
  Lock,
  MagnifyingGlass as Search,
  Crosshair as Focus,
  DotsThree as MoreHorizontal,
  Cursor as MousePointer2,
  Browser as PanelTopClose,
  Trash as Trash2,
  LockOpen as Unlock,
  UploadSimple as Upload,
  FlowArrow as Workflow,
} from "@phosphor-icons/react";
import { GridSettingsPanel } from "@/components/canvas/grid-controls";
import {
  FindReplacePanel,
  SlideNumberPanel,
} from "@/components/canvas/sidebar/tool-workspace";
import { useCanvasStore } from "@/store/useCanvasStore";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import type { FabricCanvasJSON } from "@/lib/types";
import { isLayerLocked, setLayerLocked, setLayerVisible } from "@/lib/canvas/layers";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { ClearCanvasButton } from "@/components/canvas/clear-canvas-button";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import {
  parseImportedTemplate,
  type ImportedTemplate,
} from "@/lib/templates/parse";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSlides } from "@/hooks/use-slides";
import { useTranslations } from "next-intl";

const iconBtn =
  "size-9 shrink-0 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground";

const menuItem =
  "gap-2 rounded-xl px-3 py-2 text-[13px] focus:bg-muted/50";

/** Keep submenu open on chrome clicks, but let inputs receive focus for typing. */
function keepSubmenuOpen(event: React.PointerEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
  event.preventDefault();
}

function PageIcon({
  title,
  pressed,
  disabled,
  destructive,
  onClick,
  children,
}: {
  title: string;
  pressed?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-pressed={pressed}
      className={cn(
        iconBtn,
        pressed && "bg-muted/50 text-foreground",
        destructive && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </Button>
  );
}

function selectionTarget(obj: FabricObject | null): FabricObject | null {
  if (!obj) return null;
  if (obj.type === "activeSelection") return null;
  return obj;
}

export function CanvasToolbar({
  onHideChrome,
  onFocus,
}: {
  onHideChrome?: () => void;
  onFocus?: () => void;
} = {}) {
  const t = useTranslations("editor.toolbar");
  const tc = useTranslations("common");
  const manager = useCanvasManager();
  const slidesController = useSlidesController();
  const { applyPayload } = useApplyTemplate();
  const importRef = useRef<HTMLInputElement>(null);
  const {
    currentIndex,
    currentSlideId,
    canGoPrev,
    canGoNext,
    canRemove,
    add,
    duplicate,
    remove,
    move,
  } = useSlides();

  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const autoFlowEnabled = useCanvasStore((s) => s.autoFlowEnabled);
  const autoFlowEdgeTolerance = useCanvasStore((s) => s.autoFlowEdgeTolerance);
  const autoFlowPadding = useCanvasStore((s) => s.autoFlowPadding);
  const setAutoFlowEdgeTolerance = useCanvasStore((s) => s.setAutoFlowEdgeTolerance);
  const setAutoFlowPadding = useCanvasStore((s) => s.setAutoFlowPadding);
  const handActive = useCanvasStore((s) => s.handActive);
  const setHandActive = useCanvasStore((s) => s.setHandActive);
  const eraserActive = useCanvasStore((s) => s.eraserActive);
  const setEraserActive = useCanvasStore((s) => s.setEraserActive);
  const selectedObject = useCanvasStore((s) => s.selectedObject);

  const [copied, setCopied] = useState(false);
  const [pendingImport, setPendingImport] = useState<ImportedTemplate | null>(null);
  const [importing, setImporting] = useState(false);

  const target = selectionTarget(selectedObject);
  const targetHidden = target ? target.visible === false : false;
  const targetLocked = target ? isLayerLocked(target) : false;
  const selectActive = !handActive && !eraserActive;
  const pageLabel = projectTitle.trim()
    ? t("slideTitleNamed", { n: currentIndex + 1, title: projectTitle.trim() })
    : t("slideTitle", { n: currentIndex + 1 });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (typing) return;
      const editing = manager?.getActiveObject() as { isEditing?: boolean } | null;
      if (editing?.isEditing) return;
      const key = event.key.toLowerCase();
      if (key === "v") {
        event.preventDefault();
        setHandActive(false);
        setEraserActive(false);
        return;
      }
      if (key === "h") {
        event.preventDefault();
        setHandActive(true);
        return;
      }
      if (key === "e") {
        event.preventDefault();
        setEraserActive(!useCanvasStore.getState().eraserActive);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [manager, setHandActive, setEraserActive]);

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
      reportError(err, messages.errors.exportJson);
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
        throw new Error(parsed.ok === false ? parsed.error : messages.errors.notCanvasJson);
      }

      if (parsed.template.slides.length === 1) {
        await loadFirstIntoCurrent(parsed.template.slides[0]!);
        return;
      }

      setPendingImport(parsed.template);
    } catch (err) {
      reportError(err, messages.errors.importJson);
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
      reportError(err, messages.errors.importFirstSlide);
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
      reportError(err, messages.errors.importAllSlides);
    } finally {
      setImporting(false);
    }
  };

  const toggleHidden = () => {
    if (!manager || !target) return;
    manager.transact(() => setLayerVisible(target, targetHidden));
  };

  const toggleLocked = () => {
    if (!manager || !target) return;
    manager.transact(() => setLayerLocked(target, !targetLocked));
  };

  const slideCount = pendingImport?.slides.length ?? 0;

  return (
    <div className="flex h-full w-full min-w-0 items-center gap-3 select-none">
      <div
        className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground"
        title={pageLabel}
      >
        {pageLabel}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex items-center rounded-md p-0.5">
          <PageIcon
            title={t("moveEarlier")}
            disabled={!canGoPrev}
            onClick={() => move("left")}
          >
            <ChevronUp className="size-5" />
          </PageIcon>
          <PageIcon
            title={t("moveLater")}
            disabled={!canGoNext}
            onClick={() => move("right")}
          >
            <ChevronDown className="size-5" />
          </PageIcon>
          <PageIcon
            title={target ? (targetHidden ? t("showObject") : t("hideObject")) : t("selectObjectToHide")}
            disabled={!target}
            pressed={targetHidden}
            onClick={toggleHidden}
          >
            {targetHidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </PageIcon>
          <PageIcon
            title={target ? (targetLocked ? t("unlockObject") : t("lockObject")) : t("selectObjectToLock")}
            disabled={!target}
            pressed={targetLocked}
            onClick={toggleLocked}
          >
            {targetLocked ? <Lock className="size-5" /> : <Unlock className="size-5" />}
          </PageIcon>
          <PageIcon title={t("duplicateSlide")} onClick={() => void duplicate()}>
            <CopyPlus className="size-5" />
          </PageIcon>
          <PageIcon
            title={t("deleteSlide")}
            disabled={!canRemove}
            destructive
            onClick={() => void remove(currentSlideId)}
          >
            <Trash2 className="size-5" />
          </PageIcon>
          <PageIcon title={t("addSlide")} onClick={() => void add()}>
            <FilePlus className="size-5" />
          </PageIcon>
        </div>

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
              size="icon"
              className={iconBtn}
              title={t("options")}
              aria-label={t("canvasOptions")}
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-2xl p-1.5">
            <DropdownMenuItem
              className={menuItem}
              onSelect={() => {
                setHandActive(false);
                setEraserActive(false);
              }}
            >
              <MousePointer2 className="size-5" />
              <span className="flex-1">{t("select")}</span>
              <kbd className="font-mono text-[11px] text-muted-foreground">V</kbd>
              <Check className={cn("size-5", selectActive ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItem}
              onSelect={() => setHandActive(true)}
            >
              <Hand className="size-5" />
              <span className="flex-1">{t("hand")}</span>
              <kbd className="font-mono text-[11px] text-muted-foreground">H</kbd>
              <Check className={cn("size-5", handActive ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItem}
              onSelect={() => setEraserActive(!eraserActive)}
            >
              <Eraser className="size-5" />
              <span className="flex-1">{t("eraser")}</span>
              <kbd className="font-mono text-[11px] text-muted-foreground">E</kbd>
              <Check className={cn("size-5", eraserActive ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>

            {onFocus ? (
              <DropdownMenuItem className={menuItem} onSelect={onFocus}>
                <Focus className="size-5" />
                <span className="flex-1">{t("focusMode")}</span>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSeparator className="bg-border/50" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn(
                  menuItem,
                  "focus:bg-muted/50 data-[state=open]:bg-muted/50 [&_svg:not([class*='text-'])]:text-muted-foreground",
                )}
              >
                <Grid3X3 className="size-5" />
                {t("layoutGrid")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={8}
                className="w-72 rounded-2xl p-3"
                onPointerDown={keepSubmenuOpen}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <GridSettingsPanel />
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn(
                  menuItem,
                  "focus:bg-muted/50 data-[state=open]:bg-muted/50 [&_svg:not([class*='text-'])]:text-muted-foreground",
                )}
              >
                <Hash className="size-5" />
                {t("slideNumber")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={8}
                className="w-72 rounded-2xl p-3"
                onPointerDown={keepSubmenuOpen}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <SlideNumberPanel />
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn(
                  menuItem,
                  "focus:bg-muted/50 data-[state=open]:bg-muted/50 [&_svg:not([class*='text-'])]:text-muted-foreground",
                )}
              >
                <Search className="size-5" />
                {t("findReplace")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={8}
                className="w-80 rounded-2xl p-3"
                onPointerDown={keepSubmenuOpen}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <FindReplacePanel />
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="bg-border/50" />

            <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 text-[13px]">
                <Workflow className="size-4 text-muted-foreground" />
                {t("autoFlow")}
              </div>
              <Switch
                checked={autoFlowEnabled}
                onCheckedChange={(v) =>
                  useCanvasStore.getState().setAutoFlowEnabled(v)
                }
              />
            </div>
            <div
              className={cn(
                "flex flex-col gap-2 px-3 pb-2 pt-1 transition-opacity",
                !autoFlowEnabled && "pointer-events-none opacity-50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-muted-foreground">{t("edge")}</span>
                <Input
                  type="number"
                  min={0}
                  max={64}
                  value={autoFlowEdgeTolerance}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) setAutoFlowEdgeTolerance(n);
                  }}
                  className="h-9 w-16 rounded-md border-none bg-muted/40 px-2 text-center text-[13px] tabular-nums shadow-none"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-muted-foreground">{t("padding")}</span>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={autoFlowPadding}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) setAutoFlowPadding(n);
                  }}
                  className="h-9 w-16 rounded-md border-none bg-muted/40 px-2 text-center text-[13px] tabular-nums shadow-none"
                />
              </div>
            </div>

            <DropdownMenuSeparator className="bg-border/50" />

            <DropdownMenuItem
              className={menuItem}
              onSelect={() => void handleExportJSON()}
            >
              {copied ? <Check className="size-4 text-green-500" /> : <Download className="size-5" />}
              {copied ? t("exported") : t("exportJson")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItem}
              onSelect={() => importRef.current?.click()}
            >
              <Upload className="size-5" />
              {t("importJson")}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border/50" />

            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="text-[13px] text-muted-foreground">{t("clearSlides")}</span>
              <ClearCanvasButton />
            </div>

            {onHideChrome ? (
              <>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className={menuItem} onSelect={onHideChrome}>
                  <PanelTopClose className="size-5" />
                  <span className="flex-1">{t("hideBars")}</span>
                  <kbd className="font-mono text-[11px] text-muted-foreground">\</kbd>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={pendingImport !== null} onOpenChange={(open) => !open && closeImportDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("importSlidesTitle")}</DialogTitle>
            <DialogDescription>
              {t("importSlidesBody", { count: slideCount })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="secondary"
              className="h-9 rounded-md border-none bg-muted/40 shadow-none hover:bg-muted/60"
              disabled={importing}
              onClick={closeImportDialog}
            >
              {tc("cancel")}
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="h-9 rounded-md border-none bg-muted/40 shadow-none hover:bg-muted/60"
                disabled={importing}
                onClick={() => void importFirstOnly()}
              >
                {t("firstSlide")}
              </Button>
              <Button
                className="h-9 rounded-md"
                disabled={importing}
                onClick={() => void importAllSlides()}
              >
                {t("allSlides")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
