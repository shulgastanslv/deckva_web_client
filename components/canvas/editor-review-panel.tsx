"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  MessageSquarePlus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  createProjectAnnotation,
  createTextArtifact,
  deleteProjectAnnotation,
  updateProjectAnnotation,
  updateProjectCaption,
} from "@/actions/artifacts";
import { PipelineNextSteps } from "@/components/studio/pipeline/pipeline-next-steps";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiGenerateText } from "@/lib/ai/browser";
import { useProjectAnnotations, studioKeys } from "@/lib/studio/queries";
import { buildCaptionSeedFromSlides } from "@/lib/studio/slide-text-seed";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";

export function EditorReviewPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const create = useStudioCreate();
  const projectId = useCanvasStore((s) => s.currentProjectId);
  const slides = useCanvasStore((s) => s.slides);
  const currentSlideId = useCanvasStore((s) => s.currentSlideId);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const postCaption = useCanvasStore((s) => s.postCaption);
  const setPostCaption = useCanvasStore((s) => s.setPostCaption);

  const annotationsQuery = useProjectAnnotations(projectId ?? "", open && Boolean(projectId));
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

  if (!open) return null;

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
      const { text } = await apiGenerateText(seed);
      if (!text) throw new Error("AI returned empty text");

      await persistCaption(text);
      if (projectId) {
        await createTextArtifact({
          prompt: seed,
          text,
          title: projectTitle || "Post caption",
        });
        await queryClient.invalidateQueries({ queryKey: studioKeys.artifactsRoot });
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
      await queryClient.invalidateQueries({
        queryKey: studioKeys.projectAnnotations(projectId),
      });
    } catch (err) {
      reportError(err, messages.errors.generic);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l border-border/40 bg-background">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Review</p>
          <p className="text-[11px] text-muted-foreground">
            Notes + post caption
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close review"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-foreground">Post caption</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2.5 text-[12px]"
              disabled={generatingCaption || !projectId}
              onClick={() => void generateCaption()}
            >
              {generatingCaption ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              Generate
            </Button>
          </div>
          <Textarea
            value={postCaption}
            onChange={(e) => setPostCaption(e.target.value)}
            onBlur={() => {
              if (projectId) void persistCaption(postCaption);
            }}
            rows={7}
            placeholder="Caption shown in social preview…"
            className="rounded-2xl border-none bg-muted/30 text-[13px] leading-relaxed shadow-none focus-visible:ring-1"
          />
          {savingCaption ? (
            <p className="text-[11px] text-muted-foreground">Saving…</p>
          ) : null}
          {captionError ? (
            <p className="text-[12px] text-destructive">{captionError}</p>
          ) : null}
          <PipelineNextSteps
            from="carousel"
            dense
            onSelect={(kind) => {
              if (kind === "text") {
                void generateCaption();
                return;
              }
              if (kind === "palette") {
                const seed =
                  postCaption.trim() ||
                  buildCaptionSeedFromSlides(slides, projectTitle) ||
                  projectTitle;
                void create.generatePalette({ topic: seed });
              }
            }}
          />
        </section>

        <section className="space-y-2">
          <p className="text-[12px] font-medium text-foreground">
            Notes · slide {slideIndex + 1}
          </p>
          <Textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            rows={3}
            placeholder="Mark what to fix before posting…"
            className="rounded-2xl border-none bg-muted/30 text-[13px] shadow-none focus-visible:ring-1"
          />
          <Button
            type="button"
            className="h-8 w-full rounded-full text-[12px]"
            disabled={!projectId || !draftNote.trim() || savingNote}
            onClick={() => void addNote()}
          >
            {savingNote ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <MessageSquarePlus className="size-3.5" />
            )}
            Add note
          </Button>

          <ul className="space-y-2 pt-1">
            {annotationsQuery.isLoading ? (
              <li className="flex justify-center py-4">
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              </li>
            ) : annotations.length === 0 ? (
              <li className="py-2 text-[12px] text-muted-foreground">
                No notes yet.
              </li>
            ) : (
              annotations.map((note) => (
                <li
                  key={note.id}
                  className={cn(
                    "rounded-2xl bg-muted/25 px-3 py-2.5",
                    note.resolved && "opacity-60",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      Slide {note.slideIndex + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        title={note.resolved ? "Reopen" : "Resolve"}
                        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => {
                          if (!projectId) return;
                          void updateProjectAnnotation(note.id, {
                            resolved: !note.resolved,
                          }).then(() =>
                            queryClient.invalidateQueries({
                              queryKey: studioKeys.projectAnnotations(projectId),
                            }),
                          );
                        }}
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                        onClick={() => {
                          if (!projectId) return;
                          void deleteProjectAnnotation(note.id).then(() =>
                            queryClient.invalidateQueries({
                              queryKey: studioKeys.projectAnnotations(projectId),
                            }),
                          );
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-[12px] leading-relaxed text-foreground",
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
    </aside>
  );
}
