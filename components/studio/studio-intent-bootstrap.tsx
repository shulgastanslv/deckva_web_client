"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { generateCarousel } from "@/actions/ai";
import { saveProject } from "@/actions/projects";
import { aiPaletteToProjectPalette } from "@/lib/ai/generate-palette";
import { takePendingCover } from "@/lib/studio/pending-cover";
import { takePendingMedia } from "@/lib/studio/pending-attachments";
import {
  peekStudioIntent,
  takeStudioIntent,
  type StudioGenerateIntent,
} from "@/lib/studio/pending-intent";
import { seedGeneratingDeck } from "@/lib/studio/generating-deck";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { useProject } from "@/hooks/use-project";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";

/**
 * Editor bootstrap:
 * - generate intent → CORA → apply slides/palette/caption → save
 * - new intent → blank project
 */
export function StudioIntentBootstrap() {
  const searchParams = useSearchParams();
  const slidesController = useSlidesController();
  const manager = useCanvasManager();
  const { newProject, loadProject } = useProject();
  const { applyPayload } = useApplyTemplate();
  const ran = useRef(false);

  useEffect(() => {
    if (!slidesController || !manager || ran.current) return;

    const projectId = searchParams.get("project");
    const pending = peekStudioIntent();

    if (
      projectId &&
      pending?.type === "generate" &&
      pending.projectId === projectId
    ) {
      ran.current = true;
      const intent = takeStudioIntent() as StudioGenerateIntent;

      seedGeneratingDeck({
        projectId: intent.projectId,
        title: intent.topic.slice(0, 64),
        aspectRatio: intent.aspectRatio,
        slidesCount: intent.slidesCount,
      });

      void (async () => {
        try {
          await slidesController.loadCurrent();

          const media = takePendingMedia(intent.projectId);
          const legacyCover = takePendingCover(intent.projectId);
          const images =
            media.images.length > 0
              ? media.images
              : legacyCover
                ? [legacyCover]
                : [];
          const cover =
            media.cover || legacyCover || intent.cover || images[0] || "";
          const seedText = media.seedText || intent.seedText || "";
          const attachments = [
            ...images.map((dataUrl, index) => ({
              name: index === 0 ? "cover" : `image-${index + 1}`,
              kind: "image" as const,
              dataUrl,
              role: index === 0 ? ("cover" as const) : ("slide" as const),
            })),
            ...(seedText
              ? [
                  {
                    name: "notes",
                    kind: "text" as const,
                    text: seedText,
                  },
                ]
              : []),
          ];

          const result = await generateCarousel({
            topic: intent.topic,
            aspectRatio: intent.aspectRatio,
            slidesCount: intent.slidesCount,
            language: intent.language,
            handle: intent.handle,
            cover,
            modelId: intent.modelId,
            skillId: intent.skillId,
            seedText: seedText || undefined,
            attachments,
            projectId: intent.projectId,
          });

          if (!result.slides.length) {
            throw new Error(messages.errors.emptyCarousel);
          }

          // Drop skeleton chrome; keep project-loading so autosave stays off until save.
          useCanvasStore.setState({
            isGeneratingCarousel: false,
            isLoadingProject: true,
          });

          // Reveal slides one-by-one so the carousel updates as content lands.
          const placeholders = useCanvasStore.getState().slides;
          const total = Math.max(placeholders.length, result.slides.length);
          useCanvasStore.getState().setCurrentRatio(result.aspectRatio);

          for (let i = 0; i < result.slides.length; i++) {
            const nextSlides = Array.from({ length: total }, (_, index) => {
              const existing = placeholders[index];
              const canvasJSON = result.slides[index];
              if (canvasJSON) {
                return {
                  id: index + 1,
                  canvasJSON,
                  thumbnail: null as string | null,
                };
              }
              return (
                existing ?? {
                  id: index + 1,
                  canvasJSON: {
                    version: "6.0.0",
                    objects: [],
                    background: "#ffffff",
                  },
                  thumbnail: null,
                }
              );
            });
            useCanvasStore.getState().setSlides(nextSlides);
            useCanvasStore.getState().setCurrentSlideId(i + 1);
            await slidesController.loadCurrent();
            if (i < result.slides.length - 1) {
              await new Promise((r) => setTimeout(r, 120));
            }
          }

          await applyPayload({
            title: result.title,
            aspectRatio: result.aspectRatio,
            slides: result.slides,
          });

          const next = useCanvasStore.getState();
          next.setProjectTitle(result.title);
          if (result.palette) {
            next.setPalette(aiPaletteToProjectPalette(result.palette));
          }

          // applyPayload already rendered JPEG thumbs into the store — persist them
          // so Recent cards / community preview aren't empty placeholders.
          const snap = useCanvasStore.getState();
          const saved = await saveProject(intent.projectId, {
            title: result.title,
            aspectRatio: result.aspectRatio,
            width: result.width,
            height: result.height,
            slides: snap.slides.map((slide) => ({
              canvasJSON: slide.canvasJSON,
              thumbnail: slide.thumbnail ?? null,
            })),
            document: {
              palette: snap.palette,
              textStyles: snap.textStyles,
              chrome: snap.chrome,
            },
          });
          if (!saved.success) {
            throw new Error(messages.errors.saveCarousel);
          }

          useCanvasStore.getState().markSaved();
          window.dispatchEvent(new CustomEvent("core:projects-changed"));
          if (result.entitlement) {
            window.dispatchEvent(
              new CustomEvent("studio:generations-changed", {
                detail: { entitlement: result.entitlement },
              }),
            );
          }
        } catch (error) {
          reportError(
            error,
            error instanceof Error
              ? error.message
              : messages.errors.generateCarousel,
          );
          await loadProject(intent.projectId);
        } finally {
          useCanvasStore.getState().setGeneratingCarousel(false);
        }
      })();
      return;
    }

    if (projectId) {
      takeStudioIntent();
      ran.current = true;
      return;
    }

    const wantsNew = searchParams.get("new") === "1";
    const intent = takeStudioIntent();
    ran.current = true;

    const stripQuery = (...keys: string[]) => {
      const url = new URL(window.location.href);
      for (const key of keys) url.searchParams.delete(key);
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    };

    void (async () => {
      try {
        if (wantsNew || intent?.type === "new") {
          await newProject();
          stripQuery("new");
        }
      } catch (error) {
        reportError(error, messages.errors.openEditor);
      }
    })();
  }, [
    slidesController,
    manager,
    newProject,
    loadProject,
    applyPayload,
    searchParams,
  ]);

  return null;
}
