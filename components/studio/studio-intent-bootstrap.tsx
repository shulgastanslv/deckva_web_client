"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { generateCarousel } from "@/actions/ai";
import { saveProject } from "@/actions/projects";
import { aiPaletteToProjectPalette } from "@/lib/ai/generate-palette";
import { takePendingCover } from "@/lib/studio/pending-cover";
import {
  peekStudioIntent,
  takeStudioIntent,
  type StudioGenerateIntent,
} from "@/lib/studio/pending-intent";
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

      const store = useCanvasStore.getState();
      store.setCurrentProjectId(intent.projectId);
      store.setProjectTitle(intent.topic.slice(0, 64));
      store.setGeneratingCarousel(true);

      void (async () => {
        try {
          const result = await generateCarousel({
            topic: intent.topic,
            aspectRatio: intent.aspectRatio,
            slidesCount: intent.slidesCount,
            language: intent.language,
            handle: intent.handle,
            cover: takePendingCover(intent.projectId) || intent.cover || "",
            modelId: intent.modelId,
          });

          if (!result.slides.length) {
            throw new Error(messages.errors.emptyCarousel);
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

          const snap = useCanvasStore.getState();
          const saved = await saveProject(intent.projectId, {
            title: result.title,
            aspectRatio: result.aspectRatio,
            width: result.width,
            height: result.height,
            slides: result.slides.map((canvasJSON) => ({
              canvasJSON,
              thumbnail: null,
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
