import type { StateCreator } from "zustand";
import type { FabricCanvasJSON, RatioKey, SlideItem } from "@/lib/types";

export interface ProjectSlice {
  currentProjectId: string | null;
  projectTitle: string;
  postCaption: string;
  isDirty: boolean;
  isSaving: boolean;
  isLoadingProject: boolean;
  /** AI carousel generation overlay (keeps the canvas fallback visible). */
  isGeneratingCarousel: boolean;
  lastSavedAt: string | null;
  /** Bumps on every edit so a save can tell new work arrived while it was in flight. */
  editRevision: number;

  setCurrentProjectId: (id: string | null) => void;
  setProjectTitle: (title: string) => void;
  setPostCaption: (caption: string) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLoadingProject: (loading: boolean) => void;
  setGeneratingCarousel: (generating: boolean) => void;
  markSaved: () => void;
  loadProjectState: (payload: {
    id: string;
    title: string;
    aspectRatio: RatioKey;
    width: number;
    height: number;
    slides: SlideItem[];
    document?: unknown;
    postCaption?: string | null;
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
  postCaption: "",
  isDirty: false,
  isSaving: false,
  isLoadingProject: false,
  isGeneratingCarousel: false,
  lastSavedAt: null,
  editRevision: 0,

  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setProjectTitle: (projectTitle) =>
    set((state) => ({ projectTitle, isDirty: true, editRevision: state.editRevision + 1 })),
  setPostCaption: (postCaption) =>
    set((state) => ({ postCaption, isDirty: true, editRevision: state.editRevision + 1 })),
  setDirty: (isDirty) =>
    set((state) => ({
      isDirty,
      editRevision: isDirty ? state.editRevision + 1 : state.editRevision,
    })),
  setSaving: (isSaving) => set({ isSaving }),
  setLoadingProject: (isLoadingProject) => set({ isLoadingProject }),
  setGeneratingCarousel: (isGeneratingCarousel) =>
    set(
      isGeneratingCarousel
        ? { isGeneratingCarousel: true, isLoadingProject: true }
        : { isGeneratingCarousel: false, isLoadingProject: false },
    ),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),

  loadProjectState: ({ id, title, aspectRatio, slides, document, postCaption }) => {
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
      postCaption: postCaption?.trim() || "",
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
      postCaption: "",
      isDirty: false,
      isSaving: false,
      isLoadingProject: false,
      isGeneratingCarousel: false,
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
