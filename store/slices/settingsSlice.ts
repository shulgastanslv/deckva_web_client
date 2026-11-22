import { StateCreator } from "zustand";

export interface SettingsSlice {
  isGridVisible: boolean;
  gridColumns: number;
  gridRows: number;
  gridMargin: number;
  gridColor: string;
  gridOpacity: number;
  snapToGrid: boolean;
  autoSave: boolean;
  /** Show every slide as a continuous horizontal ribbon (default: active slide only). */
  showAllCanvases: boolean;
  /** Floating prev/next controls on the canvas. */
  showSlideNav: boolean;
  vignette: number;
  noise: number;
  warmth: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  toggleGrid: () => void;
  setGridVisible: (visible: boolean) => void;
  setGridColumns: (columns: number) => void;
  setGridRows: (rows: number) => void;
  setGridMargin: (margin: number) => void;
  setGridColor: (color: string) => void;
  setGridOpacity: (opacity: number) => void;
  setSnapToGrid: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setShowAllCanvases: (enabled: boolean) => void;
  setShowSlideNav: (enabled: boolean) => void;
  setVignette: (vignette: number) => void;
  setNoise: (noise: number) => void;
  setWarmth: (warmth: number) => void;
  setBlur: (blur: number) => void;
  setBrightness: (brightness: number) => void;
  setContrast: (contrast: number) => void;
  setSaturation: (saturation: number) => void;
  setHue: (hue: number) => void;
  resetFilters: () => void;
  applyFilterPreset: (preset: FilterPresetValues) => void;
}

export type FilterPresetValues = {
  vignette?: number;
  noise?: number;
  warmth?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
};

const FILTER_DEFAULTS = {
  vignette: 0,
  noise: 0,
  warmth: 0,
  blur: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
} as const;

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  isGridVisible: false,
  gridColumns: 4,
  gridRows: 4,
  gridMargin: 64,
  gridColor: "#9747FF",
  gridOpacity: 0.16,
  snapToGrid: true,
  autoSave: true,
  showAllCanvases: false,
  showSlideNav: true,
  ...FILTER_DEFAULTS,

  toggleGrid: () => set((s) => ({ isGridVisible: !s.isGridVisible })),
  setGridVisible: (isGridVisible) => set({ isGridVisible }),
  setGridColumns: (gridColumns) =>
    set({ gridColumns: Math.max(0, Math.min(24, Math.round(gridColumns))) }),
  setGridRows: (gridRows) =>
    set({ gridRows: Math.max(0, Math.min(24, Math.round(gridRows))) }),
  setGridMargin: (gridMargin) =>
    set({ gridMargin: Math.max(0, Math.round(gridMargin)) }),
  setGridColor: (gridColor) => set({ gridColor }),
  setGridOpacity: (gridOpacity) =>
    set({ gridOpacity: Math.min(1, Math.max(0, gridOpacity)) }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setShowAllCanvases: (showAllCanvases) => set({ showAllCanvases }),
  setShowSlideNav: (showSlideNav) => set({ showSlideNav }),
  setVignette: (vignette) => set({ vignette }),
  setNoise: (noise) => set({ noise }),
  setWarmth: (warmth) => set({ warmth }),
  setBlur: (blur) => set({ blur }),
  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  setSaturation: (saturation) => set({ saturation }),
  setHue: (hue) => set({ hue }),
  resetFilters: () => set({ ...FILTER_DEFAULTS }),
  applyFilterPreset: (preset) =>
    set({
      ...FILTER_DEFAULTS,
      ...preset,
    }),
});
