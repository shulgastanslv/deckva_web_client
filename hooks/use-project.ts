"use client";

import { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

import {
  createProject,
  getProjectById,
  saveAsNewProject,
  saveProject,
  saveProjectThumbnails,
  updateProjectTitle,
} from "@/actions/projects";
import { useCanvasManager, useSlidesController } from "@/context/canvas-manager";
import { renderMissingThumbnails } from "@/lib/canvas/thumbnail";
import { applyBrandKitToStore } from "@/lib/studio/brand-kit";
import { useCanvasStore } from "@/store/useCanvasStore";
import type { RatioKey } from "@/lib/types";
import type { DocumentMeta } from "@/lib/canvas/document";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";

function currentDocument(): DocumentMeta {
  const state = useCanvasStore.getState();
  return {
    palette: state.palette,
    textStyles: state.textStyles,
    chrome: state.chrome,
  };
}

function setProjectInUrl(projectId: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("project", projectId);
  window.history.replaceState({}, "", url.toString());
}

type PersistResult =
  | { success: true; projectId: string }
  | { success: false; error: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function notifyProjectsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("core:projects-changed"));
}

function scheduleThumbnailHydration(projectId: string | null, persistToDb: boolean) {
  const start = useCanvasStore.getState();
  const snapshot = start.slides.map((slide) => ({
    id: slide.id,
    canvasJSON: slide.canvasJSON,
    thumbnail: slide.thumbnail ?? null,
  }));
  if (!snapshot.some((slide) => !slide.thumbnail)) return;

  void (async () => {
    let rendered: Array<{ id: number; dataUrl: string }> = [];
    try {
      rendered = await renderMissingThumbnails(snapshot, start.canvasDimensions);
    } catch (err) {
      reportError(err, messages.errors.thumbnails);
      return;
    }
    if (rendered.length === 0) return;

    const current = useCanvasStore.getState();
    if (current.currentProjectId !== projectId) return;

    const byId = new Map(rendered.map((shot) => [shot.id, shot.dataUrl]));
    for (const slide of snapshot) {
      const thumb = byId.get(slide.id);
      if (!thumb) continue;
      const now = current.slides.find((item) => item.id === slide.id);
      if (!now || now.thumbnail || now.canvasJSON !== slide.canvasJSON) continue;
      current.updateSlideThumbnail(slide.id, thumb);
    }

    const after = useCanvasStore.getState();
    const unchanged =
      persistToDb &&
      !!projectId &&
      !after.isDirty &&
      after.currentProjectId === projectId &&
      after.slides.length === snapshot.length &&
      after.slides.every(
        (slide, index) =>
          slide.id === snapshot[index]?.id &&
          slide.canvasJSON === snapshot[index]?.canvasJSON,
      );
    if (!unchanged || !projectId) return;

    const saved = await saveProjectThumbnails(
      projectId,
      after.slides.map((slide) => slide.thumbnail ?? null),
    );
    if (saved.success && saved.updated) notifyProjectsChanged();
  })();
}

export function useProject() {
  const { status } = useSession();
  const slidesController = useSlidesController();
  const manager = useCanvasManager();
  const loadSeq = useRef(0);
  const saveWithThumbnail = useRef(false);
  const saveFlight = useRef<Promise<PersistResult> | null>(null);

  const currentProjectId = useCanvasStore((s) => s.currentProjectId);
  const projectTitle = useCanvasStore((s) => s.projectTitle);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const isSaving = useCanvasStore((s) => s.isSaving);
  const isLoadingProject = useCanvasStore((s) => s.isLoadingProject);

  const loadProject = useCallback(
    async (projectId: string) => {
      const store = useCanvasStore.getState();
      if (store.currentProjectId === projectId && !store.isLoadingProject) {
        return { success: true as const };
      }

      const seq = ++loadSeq.current;
      // Optimistic selection so the sidebar doesn't flicker / bounce.
      store.setCurrentProjectId(projectId);
      store.setLoadingProject(true);
      setProjectInUrl(projectId);

      try {
        const res = await getProjectById(projectId);
        if (seq !== loadSeq.current) {
          return { success: false as const, error: messages.errors.cancelled };
        }

        if (!res.success) {
          return { success: false as const, error: messages.errors.loadProject };
        }

        slidesController?.saveCurrent();
        store.loadProjectState(res.project);
        if (seq !== loadSeq.current) {
          return { success: false as const, error: messages.errors.cancelled };
        }

        await slidesController?.loadCurrent();
        if (seq !== loadSeq.current) {
          return { success: false as const, error: messages.errors.cancelled };
        }

        useCanvasStore.getState().markSaved();
        scheduleThumbnailHydration(projectId, res.isOwner);
        return { success: true as const };
      } finally {
        if (seq === loadSeq.current) {
          const state = useCanvasStore.getState();
          // Keep the canvas fallback up while AI generation owns the overlay.
          if (!state.isGeneratingCarousel) {
            state.setLoadingProject(false);
          }
        }
      }
    },
    [slidesController],
  );

  const persist = useCallback(async (options?: { thumbnail?: boolean }): Promise<PersistResult> => {
    if (status !== "authenticated") {
      return { success: false, error: messages.errors.signInToSave };
    }

    if (options?.thumbnail !== false) saveWithThumbnail.current = true;
    if (saveFlight.current) return saveFlight.current;

    let finish!: (result: PersistResult) => void;
    const job = new Promise<PersistResult>((resolve) => {
      finish = resolve;
    });
    saveFlight.current = job;

    void (async () => {
      let result: PersistResult = { success: false, error: messages.errors.saveFailed };
      useCanvasStore.getState().setSaving(true);
      try {
        for (let pass = 0; pass < 4; pass += 1) {
          while (slidesController?.isBusy() || useCanvasStore.getState().isLoadingProject) {
            await sleep(40);
          }

          const thumbnail = saveWithThumbnail.current;
          saveWithThumbnail.current = false;
          slidesController?.saveCurrent({ thumbnail });

          const snap = useCanvasStore.getState();
          const revision = snap.editRevision;
          const payload = {
            title: snap.projectTitle,
            aspectRatio: snap.currentRatio as RatioKey,
            width: snap.canvasDimensions.width,
            height: snap.canvasDimensions.height,
            slides: snap.slides.map((slide) => ({
              canvasJSON: slide.canvasJSON,
              thumbnail: slide.thumbnail ?? null,
            })),
            document: currentDocument(),
          };

          let projectId = snap.currentProjectId;
          if (projectId) {
            const res = await saveProject(projectId, payload);
            if (!res.success) return;
          } else {
            const res = await saveAsNewProject(payload);
            if (!res.success) return;
            projectId = res.projectId;
            useCanvasStore.getState().setCurrentProjectId(projectId);
            setProjectInUrl(projectId);
          }

          if (useCanvasStore.getState().editRevision !== revision) continue;

          useCanvasStore.getState().markSaved();
          notifyProjectsChanged();
          if (useCanvasStore.getState().editRevision !== revision || saveWithThumbnail.current) continue;
          result = { success: true, projectId };
          return;
        }
      } finally {
        saveFlight.current = null;
        useCanvasStore.getState().setSaving(false);
        finish(result);
      }
    })();

    return job;
  }, [slidesController, status]);

  const newProject = useCallback(
    async (title?: string, aspectRatio?: RatioKey) => {
      if (status !== "authenticated") {
        return { success: false as const, error: "Sign in" };
      }

      const ratio =
        aspectRatio ?? useCanvasStore.getState().currentRatio;
      const res = await createProject({ title, aspectRatio: ratio });
      if (!res.success) return res;

      slidesController?.saveCurrent();
      useCanvasStore.getState().loadProjectState(res.project);
      await slidesController?.loadCurrent();
      applyBrandKitToStore({
        paintBackground: true,
        canvas: manager?.canvas ?? null,
      });
      await slidesController?.loadCurrent();
      useCanvasStore.getState().markSaved();
      setProjectInUrl(res.projectId);
      notifyProjectsChanged();
      scheduleThumbnailHydration(res.projectId, true);

      return res;
    },
    [slidesController, manager, status],
  );

  const rename = useCallback(
    async (title: string) => {
      useCanvasStore.getState().setProjectTitle(title);
      const projectId = useCanvasStore.getState().currentProjectId;
      if (!projectId || status !== "authenticated") return;
      await updateProjectTitle(projectId, title);
    },
    [status],
  );

  return {
    currentProjectId,
    projectTitle,
    isDirty,
    isSaving,
    isLoadingProject,
    loadProject,
    persist,
    newProject,
    rename,
  };
}
