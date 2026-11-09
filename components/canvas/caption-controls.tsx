"use client";

import { useState } from "react";
import { ChevronDown, TextIcon } from "lucide-react";

import { updateProjectCaption } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  sidebarActionBtn,
  sidebarTextarea,
} from "@/components/canvas/sidebar/sidebar-ui";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { buildCaptionSeedFromSlides } from "@/lib/studio/slide-text-seed";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

export function CaptionControls() {
  const [open, setOpen] = useState(false);

  const projectId = useCanvasStore((s) => s.currentProjectId);
  const slides = useCanvasStore((s) => s.slides);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const postCaption = useCanvasStore((s) => s.postCaption);
  const setPostCaption = useCanvasStore((s) => s.setPostCaption);

  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [savingCaption, setSavingCaption] = useState(false);

  const persistCaption = async (next: string) => {
    setPostCaption(next);
    if (!projectId) return;
    setSavingCaption(true);
    try {
      await updateProjectCaption(projectId, next);
    } catch (err) {
      reportError(err, messages.errors.generic);
    } finally {
      setSavingCaption(false);
    }
  };

  const generateCaption = async () => {
    setCaptionError(null);
    setGeneratingCaption(true);
    try {
      const text =
        buildCaptionSeedFromSlides(slides, projectTitle) ||
        projectTitle.trim();
      if (!text) throw new Error("Add slide text first");
      await persistCaption(text);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : messages.errors.generic;
      setCaptionError(message);
      reportError(err, message);
    } finally {
      setGeneratingCaption(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-full px-3 text-[13px]"
        >
          <TextIcon className="size-3.5" />
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[320px] rounded-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between gap-2 px-3.5 py-3">
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            Caption
          </span>
          {savingCaption ? (
            <span className="text-[12px] text-muted-foreground">Saving…</span>
          ) : null}
        </div>

        <div className="max-h-[min(28rem,70vh)] space-y-2.5 overflow-y-auto px-3.5 pb-4">
          <textarea
            value={postCaption}
            onChange={(e) => setPostCaption(e.target.value)}
            onBlur={() => {
              if (projectId) void persistCaption(postCaption);
            }}
            rows={8}
            placeholder="Caption for the social preview"
            className={sidebarTextarea}
          />
          <Button
            type="button"
            variant="secondary"
            className={cn(sidebarActionBtn, "h-9 w-full")}
            disabled={generatingCaption || !projectId}
            onClick={() => void generateCaption()}
          >
            {generatingCaption ? "Generating…" : "Generate"}
          </Button>
          {captionError ? (
            <p className="text-[13px] leading-snug text-destructive">
              {captionError}
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
