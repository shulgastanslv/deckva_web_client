"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { saveProject } from "@/actions/projects";
import type { GenerateCarouselResult } from "@/lib/ai/generate";
import { takePendingCover } from "@/lib/studio/pending-cover";
import {
  peekStudioIntent,
  takeStudioIntent,
  type StudioGenerateIntent,
} from "@/lib/studio/pending-intent";
import type { FabricCanvasJSON } from "@/lib/types";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { useProject } from "@/hooks/use-project";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";

function notifyProjectsChanged() {
  window.dispatchEvent(new CustomEvent("core:projects-changed"));
}

/** Consumes home/projects/templates intents once the editor canvas is ready. */
export function StudioIntentBootstrap() {
  const searchParams = useSearchParams();
  const slidesController = useSlidesController();
  const { newProject, loadProject } = useProject();
  const { applyTemplateById, applyPayload } = useApplyTemplate();
  const ran = useRef(false);

  useEffect(() => {
    if (!slidesController || ran.current) return;

    const projectId = searchParams.get("project");
    const pending = peekStudioIntent();

    // AI generate: project already created on home — keep fallback up while Ollama runs.
    if (
      projectId &&
      pending?.type === "generate" &&
      pending.projectId === projectId
    ) {
      ran.current = true;
      const intent = takeStudioIntent() as StudioGenerateIntent;

      // Claim the project synchronously so ProjectBootstrap does not race-load it.
      const store = useCanvasStore.getState();
      store.setCurrentProjectId(intent.projectId);
      store.setProjectTitle(intent.topic.slice(0, 64));
      store.setGeneratingCarousel(true);

      void (async () => {
        try {
          const res = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: intent.topic,
              aspectRatio: intent.aspectRatio,
              slidesCount: intent.slidesCount,
              language: intent.language,
              handle: intent.handle,
              cover:
                takePendingCover(intent.projectId) || intent.cover || "",
            }),
          });

          const payload: unknown = await res.json().catch(() => null);
          if (!res.ok) {
            const message =
              payload &&
              typeof payload === "object" &&
              typeof (payload as { error?: unknown }).error === "string"
                ? (payload as { error: string }).error
                : "Couldn't generate the carousel";
            throw new Error(message);
          }

          const result = payload as GenerateCarouselResult;
          if (!result?.slides?.length || !result.aspectRatio) {
            throw new Error("AI returned an empty carousel");
          }

          await applyPayload({
            title: result.title,
            aspectRatio: result.aspectRatio,
            slides: result.slides,
          });

          useCanvasStore.getState().setProjectTitle(result.title);

          const saved = await saveProject(intent.projectId, {
            title: result.title,
            aspectRatio: result.aspectRatio,
            width: result.width,
            height: result.height,
            slides: result.slides.map((canvasJSON: FabricCanvasJSON) => ({
              canvasJSON,
              thumbnail: null,
            })),
          });
          if (!saved.success) {
            throw new Error("Couldn't save the carousel");
          }

          useCanvasStore.getState().markSaved();
          notifyProjectsChanged();
        } catch (error) {
          console.error(error);
          // Leave the blank project open so the user can keep editing.
          await loadProject(intent.projectId);
        } finally {
          useCanvasStore.getState().setGeneratingCarousel(false);
        }
      })();
      return;
    }

    // Opening an existing project wins over a stashed home intent.
    if (projectId) {
      takeStudioIntent();
      ran.current = true;
      return;
    }

    const templateId = searchParams.get("template")?.trim();
    const wantsNew = searchParams.get("new") === "1";
    const intent = takeStudioIntent();
    ran.current = true;

    const stripQuery = (...keys: string[]) => {
      const url = new URL(window.location.href);
      for (const key of keys) url.searchParams.delete(key);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    };

    void (async () => {
      try {
        if (templateId) {
          const res = await applyTemplateById(templateId);
          stripQuery("template");
          if (
            res.success &&
            "title" in res &&
            typeof res.title === "string" &&
            res.title.trim()
          ) {
            useCanvasStore.getState().setProjectTitle(res.title.trim());
          }
          return;
        }

        if (wantsNew || intent?.type === "new") {
          await newProject();
          stripQuery("new");
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [
    slidesController,
    newProject,
    loadProject,
    applyTemplateById,
    applyPayload,
    searchParams,
  ]);

  return null;
}
