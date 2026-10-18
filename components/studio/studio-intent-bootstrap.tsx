"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
  beginGenerateSession,
  endGenerateSession,
} from "@/lib/ai/generate-session";
import { DEFAULT_GENERATE_OPTIONS } from "@/lib/ai/generate-options";
import { runCarouselGenerate } from "@/lib/ai/run-carousel-generate";
import { takeStudioIntent } from "@/lib/studio/pending-intent";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { useProject } from "@/hooks/use-project";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";

/** Consumes home/projects/templates intents once the editor canvas is ready. */
export function StudioIntentBootstrap() {
  const searchParams = useSearchParams();
  const slidesController = useSlidesController();
  const { newProject } = useProject();
  const { applyTemplateById } = useApplyTemplate();
  const ran = useRef(false);

  useEffect(() => {
    if (!slidesController || ran.current) return;

    // Opening an existing project wins over a stashed home intent.
    if (searchParams.get("project")) {
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
          if (res.success && "title" in res && typeof res.title === "string" && res.title.trim()) {
            useCanvasStore.getState().setProjectTitle(res.title.trim());
          }
          return;
        }

        if (wantsNew || intent?.type === "new") {
          await newProject();
          stripQuery("new");
          return;
        }

        if (intent?.type === "generate") {
          const theme = intent.theme.trim();
          if (!theme) return;
          const abort = beginGenerateSession();
          try {
            await runCarouselGenerate({
              theme,
              slides: intent.slides ?? 5,
              setId: intent.setId,
              options: DEFAULT_GENERATE_OPTIONS,
              store: useCanvasStore,
              slidesController,
              signal: abort.signal,
            });
          } catch (error) {
            if (abort.signal.aborted) return;
            const message =
              error instanceof Error ? error.message : "Couldn't generate";
            useCanvasStore.getState().setGenerate({
              genStatus: "error",
              genError: message,
              genPhase: message,
            });
          } finally {
            endGenerateSession(abort);
          }
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [slidesController, newProject, applyTemplateById, searchParams]);

  return null;
}
