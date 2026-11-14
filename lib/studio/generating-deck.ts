import type { FabricCanvasJSON, RatioKey, SlideItem } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

const emptyCanvas = (): FabricCanvasJSON => ({
  version: "6.0.0",
  objects: [],
  background: "#ffffff",
});

export function makePlaceholderSlides(count: number): SlideItem[] {
  const n = Math.min(10, Math.max(1, Math.round(count)));
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    canvasJSON: emptyCanvas(),
    thumbnail: null,
  }));
}

/** Seed N blank slides + ratio so the editor shows a loading carousel during CORA. */
export function seedGeneratingDeck(opts: {
  projectId: string;
  title: string;
  aspectRatio: RatioKey;
  slidesCount: number;
}) {
  const slides = makePlaceholderSlides(opts.slidesCount);
  const store = useCanvasStore.getState();
  store.setCurrentRatio(opts.aspectRatio);
  store.setSlides(slides);
  store.setCurrentSlideId(slides[0]!.id);
  store.setCurrentProjectId(opts.projectId);
  store.setProjectTitle(opts.title);
  store.setGeneratingCarousel(true);
}
