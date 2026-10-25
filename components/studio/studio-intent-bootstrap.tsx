"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

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
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [slidesController, newProject, applyTemplateById, searchParams]);

  return null;
}
