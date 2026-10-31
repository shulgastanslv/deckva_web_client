import type { StateCreator } from "zustand";
import type { FabricCanvasJSON, RatioKey, SlideItem } from "@/lib/types";

export interface ProjectSlice {
  currentProjectId: string | null;
  projectTitle: string;
  isDirty: boolean;
  isSaving: boolean;
  isLoadingProject: boolean;
  lastSavedAt: string | null;
  /** Bumps on every edit so a save can tell new work arrived while it was in flight. */
  editRevision: number;

  setCurrentProjectId: (id: string | null) => void;
  setProjectTitle: (title: string) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLoadingProject: (loading: boolean) => void;
  markSaved: () => void;
  loadProjectState: (payload: {
    id: string;
    title: string;
    aspectRatio: RatioKey;
    width: number;
    height: number;
    slides: SlideItem[];
    document?: unknown;
  }) => void;
  resetToBlankProject: () => void;
}

type ProjectStore = ProjectSlice & {
  setSlides: (slides: SlideItem[]) => void;
  setCurrentSlideId: (id: number) => void;
  setCurrentRatio: (ratio: RatioKey) => void;
  replaceDocument?: (input: unknown) => void;
};

const emptyCanvas = (): FabricCanvasJSON => ({
  version: "6.0.0",
  objects: [],
  background: "#ffffff",
});

export const createProjectSlice: StateCreator<ProjectStore, [], [], ProjectSlice> = (
  set,
  get,
) => ({
  currentProjectId: null,
  projectTitle: "Untitled Carousel",
  isDirty: false,
  isSaving: false,
  isLoadingProject: false,
  lastSavedAt: null,
  editRevision: 0,

  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setProjectTitle: (projectTitle) =>
    set((state) => ({ projectTitle, isDirty: true, editRevision: state.editRevision + 1 })),
  setDirty: (isDirty) =>
    set((state) => ({
      isDirty,
      editRevision: isDirty ? state.editRevision + 1 : state.editRevision,
    })),
  setSaving: (isSaving) => set({ isSaving }),
  setLoadingProject: (isLoadingProject) => set({ isLoadingProject }),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),

  loadProjectState: ({ id, title, aspectRatio, slides, document }) => {
    const hydrated =
      slides.length > 0
        ? slides
        : [{ id: 1, canvasJSON: emptyCanvas(), thumbnail: null }];

    get().setSlides(hydrated);
    get().setCurrentSlideId(hydrated[0].id);
    get().setCurrentRatio(aspectRatio);
    get().replaceDocument?.(document ?? null);

    set({
      currentProjectId: id,
      projectTitle: title,
      isDirty: false,
      lastSavedAt: new Date().toISOString(),
    });
  },

  resetToBlankProject: () => {
    get().setSlides([{ id: 1, canvasJSON: emptyCanvas(), thumbnail: null }]);
    get().setCurrentSlideId(1);
    get().setCurrentRatio("4:5");
    get().replaceDocument?.(null);

    set({
      currentProjectId: null,
      projectTitle: "Untitled Carousel",
      isDirty: false,
      isSaving: false,
      isLoadingProject: false,
      lastSavedAt: null,
    });

    // Brand kit lives in localStorage — only available in the browser.
    if (typeof window !== "undefined") {
      void import("@/lib/studio/brand-kit").then(({ applyBrandKitToStore }) => {
        applyBrandKitToStore({ paintBackground: true });
        get().markSaved();
      });
    }
  },
});
