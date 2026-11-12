import type { FabricObject } from "fabric";
import { CanvasManager } from "./manager";
import { SlidesController, type SlidesState } from "./slides";
import { bindKeyboardShortcuts } from "./shortcuts";
import { applyChrome, chromeTemplatesFrom, patchLiveSlideNumber, sameChrome } from "./chrome";
import { scheduleSlideThumbnailHydration } from "./thumbnail";
import { useCanvasStore } from "@/store/useCanvasStore";

export interface EditorStore {
  getState(): SlidesState & { setSelectedObject: (obj: FabricObject | null) => void };
}

export interface Editor {
  manager: CanvasManager;
  slides: SlidesController;
  dispose: () => void;
}

export type InitialViewport = {
  scale: number;
  nativeW: number;
  nativeH: number;
};

/** Creates the canvas editor for a `<canvas>` element and wires it to the store. */
export function createEditor(
  element: HTMLCanvasElement,
  store: EditorStore,
  viewport?: InitialViewport,
): Editor {
  const manager = new CanvasManager(element);
  if (viewport) manager.setViewportScale(viewport.scale, viewport.nativeW, viewport.nativeH);
  const slides = new SlidesController(manager, store);

  const unsubscribers = [
    manager.on("change", (state) => {
      const snap = useCanvasStore.getState();
      snap.updateSlideJSONById(snap.currentSlideId, state);

      const nextChrome = chromeTemplatesFrom(state);
      if (sameChrome(snap.chrome, nextChrome)) return;

      snap.setChrome(nextChrome);
      const slides = useCanvasStore.getState().slides;
      const touched: number[] = [];
      for (let index = 0; index < slides.length; index++) {
        const slide = slides[index]!;
        if (slide.id === snap.currentSlideId) continue;
        useCanvasStore.getState().updateSlideJSONById(
          slide.id,
          applyChrome(slide.canvasJSON, nextChrome, index, slides.length),
        );
        touched.push(slide.id);
      }
      if (touched.length > 0) scheduleSlideThumbnailHydration(touched);
    }),
    manager.on("selection", (obj) => store.getState().setSelectedObject(obj)),
    bindKeyboardShortcuts(manager),
  ];

  let structure = slideStructure(useCanvasStore.getState());
  const unsubStore = useCanvasStore.subscribe((state) => {
    const next = slideStructure(state);
    if (next === structure) return;
    structure = next;
    const index = state.slides.findIndex((slide) => slide.id === state.currentSlideId);
    patchLiveSlideNumber(manager.canvas, Math.max(0, index), state.slides.length);
  });

  void slides.loadCurrent();

  return {
    manager,
    slides,
    dispose: () => {
      slides.dispose();
      unsubStore();
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      store.getState().setSelectedObject(null);
      manager.dispose();
    },
  };
}

function slideStructure(state: { slides: { id: number }[]; currentSlideId: number }): string {
  return `${state.currentSlideId}:${state.slides.map((slide) => slide.id).join(",")}`;
}
