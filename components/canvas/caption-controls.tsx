"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, TextIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  createProjectAnnotation,
  createTextArtifact,
  deleteProjectAnnotation,
  updateProjectAnnotation,
  updateProjectCaption,
} from "@/actions/artifacts";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  sidebarActionBtn,
  sidebarSurface,
  sidebarSurfaceIdle,
  sidebarTextarea,
} from "@/components/canvas/sidebar/sidebar-ui";
import { generateText } from "@/actions/ai";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import {
  invalidateStudioAnnotations,
  invalidateStudioArtifacts,
  useProjectAnnotations,
} from "@/lib/studio/queries";
import { buildCaptionSeedFromSlides } from "@/lib/studio/slide-text-seed";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

export function CaptionControls() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const projectId = useCanvasStore((s) => s.currentProjectId);
  const slides = useCanvasStore((s) => s.slides);
  const currentSlideId = useCanvasStore((s) => s.currentSlideId);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const postCaption = useCanvasStore((s) => s.postCaption);
  const setPostCaption = useCanvasStore((s) => s.setPostCaption);

  const annotationsQuery = useProjectAnnotations(
    projectId ?? "",
    open && Boolean(projectId),
  );
  const annotations = annotationsQuery.data?.annotations ?? [];

  const [draftNote, setDraftNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [savingCaption, setSavingCaption] = useState(false);

  const slideIndex = useMemo(() => {
    const idx = slides.findIndex((s) => s.id === currentSlideId);
    return idx >= 0 ? idx : 0;
  }, [slides, currentSlideId]);

  useEffect(() => {
    if (!open) setDraftNote("");
  }, [open]);

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
      const seed =
        postCaption.trim() ||
        buildCaptionSeedFromSlides(slides, projectTitle) ||
        projectTitle;
      const { text } = await generateText(seed);
      if (!text) throw new Error("AI returned empty text");

      await persistCaption(text);
      if (projectId) {
        await createTextArtifact({
          prompt: seed,
          text,
          title: projectTitle || "Post caption",
        });
        await invalidateStudioArtifacts(queryClient);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : messages.errors.generic;
      setCaptionError(message);
      reportError(err, message);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const addNote = async () => {
    if (!projectId || !draftNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await createProjectAnnotation({
        projectId,
        slideIndex,
        body: draftNote.trim(),
      });
      if (!res.success) {
        const message = "error" in res ? res.error : messages.errors.generic;
        reportError(new Error(message), message);
        return;
      }
      setDraftNote("");
      await invalidateStudioAnnotations(queryClient, projectId);
    } catch (err) {
      reportError(err, messages.errors.generic);
    } finally {
      setSavingNote(false);
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
        className="w-[320px] rounded-3xl border-0 bg-popover p-0"
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

        <div className="max-h-[min(28rem,70vh)] space-y-5 overflow-y-auto px-3.5 pb-4">
          <section className="space-y-2.5">
            <textarea
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              onBlur={() => {
                if (projectId) void persistCaption(postCaption);
              }}
              rows={6}
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
          </section>

          <section className="space-y-2.5">
            <span className="text-[13px] font-medium text-muted-foreground">
              Notes · slide {slideIndex + 1}
            </span>
            <textarea
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              rows={3}
              placeholder="What to fix before posting"
              className={sidebarTextarea}
            />
            <Button
              type="button"
              variant="secondary"
              className={cn(sidebarActionBtn, "h-9 w-full")}
              disabled={!projectId || !draftNote.trim() || savingNote}
              onClick={() => void addNote()}
            >
              {savingNote ? "Adding…" : "Add note"}
            </Button>

            <ul className="space-y-2">
              {annotationsQuery.isLoading ? (
                <li className="py-2 text-[13px] text-muted-foreground">
                  Loading…
                </li>
              ) : annotations.length === 0 ? (
                <li className="py-1 text-[13px] text-muted-foreground">
                  No notes yet
                </li>
              ) : (
                annotations.map((note) => (
                  <li
                    key={note.id}
                    className={cn(
                      "rounded-[1.25rem] px-3.5 py-3",
                      sidebarSurfaceIdle,
                      note.resolved && "opacity-55",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[12px] text-muted-foreground">
                        Slide {note.slideIndex + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className={cn(
                            "inline-flex h-9 items-center rounded-full px-2.5 text-[12px] font-medium text-muted-foreground transition-colors",
                            sidebarSurface,
                          )}
                          onClick={() => {
                            if (!projectId) return;
                            void updateProjectAnnotation(note.id, {
                              resolved: !note.resolved,
                            }).then(() =>
                              invalidateStudioAnnotations(queryClient, projectId),
                            );
                          }}
                        >
                          {note.resolved ? "Reopen" : "Done"}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 items-center rounded-full px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                          onClick={() => {
                            if (!projectId) return;
                            void deleteProjectAnnotation(note.id).then(() =>
                              invalidateStudioAnnotations(queryClient, projectId),
                            );
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-[13px] leading-relaxed text-foreground",
                        note.resolved && "line-through",
                      )}
                    >
                      {note.body}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  );
}
