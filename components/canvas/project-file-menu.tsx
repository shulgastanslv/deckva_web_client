"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Copy,
  Download,
  Grid3X3,
  HelpCircle,
  Pencil,
  Plus,
  Save,
  Share2,
} from "lucide-react";
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
import { GridSettingsPanel, useSyncLayoutGrid } from "@/components/canvas/grid-controls";
import { duplicateProject } from "@/actions/projects";
import { useProject } from "@/hooks/use-project";
import { useCanvasStore } from "@/store/useCanvasStore";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { cn } from "@/lib/utils";

const chipTrigger =
  "inline-flex h-10 items-center gap-1.5 rounded-full border-none bg-transparent px-3.5 text-[13px] font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/60 data-[state=open]:text-foreground";

const menuItem =
  "gap-2 rounded-xl px-3 py-2.5 text-[13px] focus:bg-muted/50";

type ProjectFileMenuProps = {
  onExport?: () => void;
  onShare?: () => void;
  onHelp?: () => void;
};

export function ProjectFileMenu({ onExport, onShare, onHelp }: ProjectFileMenuProps) {
  useSyncLayoutGrid();
  const router = useRouter();
  const { rename, persist } = useProject();
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const currentProjectId = useCanvasStore((s) => s.currentProjectId);
  const canvasDimensions = useCanvasStore((s) => s.canvasDimensions);
  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const slides = useCanvasStore((s) => s.slides);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(projectTitle);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setName(projectTitle);
  }, [projectTitle, open]);

  const commitName = () => {
    const next = name.trim() || "Untitled Carousel";
    setName(next);
    if (next !== projectTitle) void rename(next);
  };

  const handleSave = () => {
    void persist();
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
        <Button type="button" variant="ghost" className={chipTrigger}>
          File
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[22rem] rounded-2xl p-1.5"
      >
        <div className="px-3 py-2.5">
          <p className="truncate text-[13px] font-medium text-foreground">{projectTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Carousel · {currentRatio} · {canvasDimensions.width}×{canvasDimensions.height}px
            <span className="mx-1.5 text-border">·</span>
            {slides.length} slide{slides.length === 1 ? "" : "s"}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem asChild className={menuItem}>
          <Link href="/studio">
            <Plus className="size-4" />
            Create new design
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
          <Copy className="size-4" />
          Make a copy
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn(
              menuItem,
              "focus:bg-muted/50 data-[state=open]:bg-muted/50 [&_svg:not([class*='text-'])]:text-muted-foreground",
            )}
          >
            <Grid3X3 className="size-4" />
            Layout grid
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={8}
            className="w-72 rounded-2xl p-3"
            onPointerDown={(event) => event.preventDefault()}
          >
            <GridSettingsPanel />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="bg-border/50" />


        <DropdownMenuItem
          className={menuItem}
          onSelect={(event) => {
            event.preventDefault();
            commitName();
            handleSave();
          }}
        >
          <Save className="size-4" />
          Save
          <kbd className="ml-auto font-mono text-[11px] text-muted-foreground">⌘S</kbd>
        </DropdownMenuItem>
        {onShare ? (
          <DropdownMenuItem className={menuItem} onSelect={onShare}>
            <Share2 className="size-4" />
            Share
          </DropdownMenuItem>
        ) : null}
        {onExport ? (
          <DropdownMenuItem className={menuItem} onSelect={onExport}>
            <Download className="size-4" />
            Download
          </DropdownMenuItem>
        ) : null}

        {onHelp ? (
          <>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className={menuItem} onSelect={onHelp}>
              <HelpCircle className="size-4" />
              Help
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
