"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CaretDown as ChevronDown,
  Copy,
  Crop,
  DownloadSimple as Download,
  Question as HelpCircle,
  Plus,
  FloppyDisk as Save,
  ShareNetwork as Share2,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
import { useSyncLayoutGrid } from "@/components/canvas/grid-controls";
import { duplicateProject } from "@/actions/projects";
import { useCanvasManager } from "@/context/canvas-manager";
import { useProject } from "@/hooks/use-project";
import { fitCanvasJSON } from "@/lib/canvas/fit-frame";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";
import { controlH } from "@/components/ui/control";
import { useTranslations } from "next-intl";

const ghostTrigger = cn(
  "inline-flex items-center gap-1.5 rounded-md border-none bg-transparent px-2.5 text-[13px] font-medium text-foreground shadow-none hover:bg-muted/40 data-[state=open]:bg-muted/40",
  controlH,
);

const menuItem =
  "gap-2 rounded-md px-3 py-2.5 text-[13px] font-normal focus:bg-muted/50";

const RATIOS = Object.keys(CANVAS_RATIOS) as RatioKey[];

type ProjectFileMenuProps = {
  onExport?: () => void;
  onShare?: () => void;
  onHelp?: () => void;
};

export function ProjectFileMenu({ onExport, onShare, onHelp }: ProjectFileMenuProps) {
  useSyncLayoutGrid();
  const t = useTranslations("editor.fileMenu");
  const tc = useTranslations("common");
  const router = useRouter();
  const manager = useCanvasManager();
  const { rename, persist } = useProject();
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const currentProjectId = useCanvasStore((s) => s.currentProjectId);
  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const setCurrentRatio = useCanvasStore((s) => s.setCurrentRatio);
  const slides = useCanvasStore((s) => s.slides);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(projectTitle);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setName(projectTitle);
  }, [projectTitle, open]);

  const commitName = () => {
    const next = name.trim() || tc("untitledCarousel");
    setName(next);
    if (next !== projectTitle) void rename(next);
  };

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

  const handleMakeCopy = async () => {
    if (!currentProjectId) {
      const saved = await persist();
      if (!saved.success) {
        reportError(new Error(messages.errors.duplicateProject), messages.errors.duplicateProject);
        return;
      }
    }
    const id = useCanvasStore.getState().currentProjectId;
    if (!id) return;
    setCopying(true);
    try {
      const res = await duplicateProject(id);
      if (!res.success) {
        reportError(new Error(messages.errors.duplicateProject), messages.errors.duplicateProject);
        return;
      }
      setOpen(false);
      router.push(`/studio/editor?project=${res.projectId}`);
    } catch (err) {
      reportError(err, messages.errors.duplicateProject);
    } finally {
      setCopying(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
 <Button type="button" variant="ghost" className={ghostTrigger}>
          {t("file")}
 <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[20rem] rounded-2xl p-1.5"
      >
        <div className="space-y-2 px-2 py-2">
          <label className="px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {t("name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitName();
                (event.target as HTMLInputElement).blur();
              }
              event.stopPropagation();
            }}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="w-full rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-medium text-foreground shadow-none outline-none hover:bg-muted/50 focus:bg-muted/50"
            placeholder={t("projectName")}
            aria-label={t("projectName")}
          />
          <p className="px-1 text-[12px] text-muted-foreground">
            {t("slidesMeta", {
              count: slides.length,
              width: canvasDimensions.width,
              height: canvasDimensions.height,
            })}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn(
              menuItem,
              "focus:bg-muted/50 data-[state=open]:bg-muted/50 [&_svg:not([class*='text-'])]:text-muted-foreground",
            )}
          >
            <Crop className="size-5" />
            {t("canvasSize")}
            <span className="ml-auto tabular-nums text-muted-foreground">{currentRatio}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent sideOffset={8} className="w-56 rounded-2xl p-1.5">
            {RATIOS.map((ratio) => {
              const size = CANVAS_RATIOS[ratio];
              const selected = currentRatio === ratio;
              return (
                <DropdownMenuItem
                  key={ratio}
                  className={cn(menuItem, selected && "bg-muted/40")}
                  onSelect={() => handleRatioChange(ratio)}
                >
                  <span className="min-w-0 flex-1 tabular-nums">{ratio}</span>
                  <span className="tabular-nums text-[12px] text-muted-foreground">
                    {size.width}×{size.height}
                  </span>
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem asChild className={menuItem}>
          <Link href="/studio">
            <Plus className="size-5" />
            {t("newDesign")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={menuItem}
          disabled={copying}
          onSelect={(event) => {
            event.preventDefault();
            void handleMakeCopy();
          }}
        >
          <Copy className="size-5" />
          {t("makeCopy")}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          className={menuItem}
          onSelect={(event) => {
            event.preventDefault();
            commitName();
            void persist();
          }}
        >
          <Save className="size-5" />
          {tc("save")}
          <kbd className="ml-auto font-mono text-[11px] text-muted-foreground">⌘S</kbd>
        </DropdownMenuItem>
        {onShare ? (
          <DropdownMenuItem className={menuItem} onSelect={onShare}>
            <Share2 className="size-5" />
            {tc("share")}
          </DropdownMenuItem>
        ) : null}
        {onExport ? (
          <DropdownMenuItem className={menuItem} onSelect={onExport}>
            <Download className="size-5" />
            {tc("download")}
          </DropdownMenuItem>
        ) : null}

        {onHelp ? (
          <>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className={menuItem} onSelect={onHelp}>
              <HelpCircle className="size-5" />
              {t("help")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
