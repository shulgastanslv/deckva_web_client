import { StateCreator } from "zustand";
import { RatioKey, CANVAS_RATIOS } from "@/lib/types";

export interface ViewportSlice {
  zoom: number;
  /** Drag the view instead of objects. */
  handActive: boolean;
  /** Brush-erase pixels on images. */
  eraserActive: boolean;
  currentRatio: RatioKey;
  canvasDimensions: { width: number; height: number };
  /** Split view: show reference image panel beside the canvas */
  isReferenceOpen: boolean;
  /** @deprecated Prefer `referenceImages` — kept for single-image callers */
  referenceImageUrl: string | null;
  /** Dropped / uploaded reference images (data URLs or blob URLs) */
  referenceImages: string[];
  /** When on, overflow past slide bounds prompts a new slide */
  autoFlowEnabled: boolean;
  setZoom: (zoom: number) => void;
  setHandActive: (active: boolean) => void;
  toggleHand: () => void;
  setEraserActive: (active: boolean) => void;
  toggleEraser: () => void;
  setCurrentRatio: (ratio: RatioKey) => void;
  setCanvasDimensions: (dim: { width: number; height: number }) => void;
  setReferenceOpen: (open: boolean) => void;
  toggleReferenceOpen: () => void;
  setReferenceImageUrl: (url: string | null) => void;
  setReferenceImages: (urls: string[]) => void;
  addReferenceImages: (urls: string[]) => void;
  removeReferenceImage: (index: number) => void;
  clearReferenceImages: () => void;
  setAutoFlowEnabled: (enabled: boolean) => void;
  toggleAutoFlow: () => void;
}

export const createViewportSlice: StateCreator<ViewportSlice, [], [], ViewportSlice> = (set) => ({
  zoom: 100,
  handActive: false,
  eraserActive: false,
  currentRatio: "4:5",
  canvasDimensions: CANVAS_RATIOS["4:5"] || { width: 1080, height: 1350 },
  isReferenceOpen: false,
  referenceImageUrl: null,
  referenceImages: [],
  autoFlowEnabled: true,

  setZoom: (zoom) => set({ zoom }),
  setHandActive: (handActive) =>
    set(handActive ? { handActive: true, eraserActive: false } : { handActive: false }),
  toggleHand: () =>
    set((s) =>
      s.handActive
        ? { handActive: false }
        : { handActive: true, eraserActive: false },
    ),
  setEraserActive: (eraserActive) =>
    set(eraserActive ? { eraserActive: true, handActive: false } : { eraserActive: false }),
  toggleEraser: () =>
    set((s) =>
      s.eraserActive
        ? { eraserActive: false }
        : { eraserActive: true, handActive: false },
    ),
  setCurrentRatio: (currentRatio) =>
    set({
      currentRatio,
      canvasDimensions: CANVAS_RATIOS[currentRatio] || { width: 1080, height: 1350 },
    }),
  setCanvasDimensions: (canvasDimensions) => set({ canvasDimensions }),
  setReferenceOpen: (isReferenceOpen) => set({ isReferenceOpen }),
  toggleReferenceOpen: () => set((s) => ({ isReferenceOpen: !s.isReferenceOpen })),
  setReferenceImageUrl: (referenceImageUrl) =>
    set({
      referenceImageUrl,
      referenceImages: referenceImageUrl ? [referenceImageUrl] : [],
    }),
  setReferenceImages: (referenceImages) =>
    set({
      referenceImages,
      referenceImageUrl: referenceImages[0] ?? null,
    }),
  addReferenceImages: (urls) =>
    set((s) => {
      const next = [...s.referenceImages, ...urls].slice(0, 12);
      return { referenceImages: next, referenceImageUrl: next[0] ?? null };
    }),
  removeReferenceImage: (index) =>
    set((s) => {
      const next = s.referenceImages.filter((_, i) => i !== index);
      return { referenceImages: next, referenceImageUrl: next[0] ?? null };
    }),
  clearReferenceImages: () => set({ referenceImages: [], referenceImageUrl: null }),
  setAutoFlowEnabled: (autoFlowEnabled) => set({ autoFlowEnabled }),
  toggleAutoFlow: () => set((s) => ({ autoFlowEnabled: !s.autoFlowEnabled })),
});
