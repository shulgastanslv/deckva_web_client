import { StateCreator } from "zustand";
import { RatioKey, CANVAS_RATIOS } from "@/lib/types";
import { EDGE_TOLERANCE, PLACE_PADDING } from "@/lib/canvas/auto-flow";

export interface ViewportSlice {
  zoom: number;
  /** Drag the view instead of objects. */
  handActive: boolean;
  /** Brush-erase pixels on images. */
  eraserActive: boolean;
  currentRatio: RatioKey;
  canvasDimensions: { width: number; height: number };
  /** When on, overflow past slide bounds prompts a new slide */
  autoFlowEnabled: boolean;
  /** How far past the slide edge before Auto Flow prompts (px). */
  autoFlowEdgeTolerance: number;
  /** Inset when placing flowed objects on the next slide (px). */
  autoFlowPadding: number;
  setZoom: (zoom: number) => void;
  setHandActive: (active: boolean) => void;
  toggleHand: () => void;
  setEraserActive: (active: boolean) => void;
  toggleEraser: () => void;
  setCurrentRatio: (ratio: RatioKey) => void;
  setCanvasDimensions: (dim: { width: number; height: number }) => void;
  setAutoFlowEnabled: (enabled: boolean) => void;
  toggleAutoFlow: () => void;
  setAutoFlowEdgeTolerance: (px: number) => void;
  setAutoFlowPadding: (px: number) => void;
}

export const createViewportSlice: StateCreator<ViewportSlice, [], [], ViewportSlice> = (set) => ({
  zoom: 100,
  handActive: false,
  eraserActive: false,
  currentRatio: "4:5",
  canvasDimensions: CANVAS_RATIOS["4:5"] || { width: 1080, height: 1350 },
  autoFlowEnabled: true,
  autoFlowEdgeTolerance: EDGE_TOLERANCE,
  autoFlowPadding: PLACE_PADDING,

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
  setAutoFlowEnabled: (autoFlowEnabled) => set({ autoFlowEnabled }),
  toggleAutoFlow: () => set((s) => ({ autoFlowEnabled: !s.autoFlowEnabled })),
  setAutoFlowEdgeTolerance: (autoFlowEdgeTolerance) =>
    set({
      autoFlowEdgeTolerance: Math.max(0, Math.min(64, Math.round(autoFlowEdgeTolerance))),
    }),
  setAutoFlowPadding: (autoFlowPadding) =>
    set({
      autoFlowPadding: Math.max(0, Math.min(200, Math.round(autoFlowPadding))),
    }),
});
