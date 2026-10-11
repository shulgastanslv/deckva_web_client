import type { StateCreator } from "zustand";

export type GenerateStatus = "idle" | "streaming" | "building" | "done" | "error";
/** Kept for callers that still reset genFx; always idle (no canvas FX). */
export type GenerateFx = "idle";

export interface GenerateSlice {
  genStatus: GenerateStatus;
  genPhase: string;
  genProgress: number;
  genExpectedSlides: number;
  genBuiltCount: number;
  genTitle: string | null;
  genError: string | null;
  genTheme: string;
  genFx: GenerateFx;
  setGenerate: (patch: Partial<GenerateSlice>) => void;
  resetGenerate: () => void;
}

const initial = {
  genStatus: "idle" as GenerateStatus,
  genPhase: "",
  genProgress: 0,
  genExpectedSlides: 0,
  genBuiltCount: 0,
  genTitle: null as string | null,
  genError: null as string | null,
  genTheme: "",
  genFx: "idle" as GenerateFx,
};

export const createGenerateSlice: StateCreator<GenerateSlice, [], [], GenerateSlice> = (set) => ({
  ...initial,
  setGenerate: (patch) => set(patch),
  resetGenerate: () => set({ ...initial }),
});
