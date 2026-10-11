import type { CanvasManager } from "@/lib/canvas/manager";
import type { SlidesController } from "@/lib/canvas/slides";
import { buildCarouselSlide } from "@/lib/ai/carousel-slide";
import { backgroundsForSet, suggestedSetById } from "@/lib/ai/carousel-style";
import type { CarouselSlideSpec } from "@/lib/ai/carousel-types";
import type { ProjectPalette } from "@/lib/canvas/document";
import type { SlideItem } from "@/lib/types";
import type { CanvasStoreState } from "@/store/useCanvasStore";

type Store = {
  getState: () => CanvasStoreState;
};

type CarouselApiResponse = {
  error?: string;
  title?: string;
  setId?: string;
  palette?: ProjectPalette;
  tagline?: string;
  handle?: string;
  slides?: CarouselSlideSpec[];
};

export async function runCarouselGenerate(input: {
  theme: string;
  slides: number;
  setId?: string;
  store: Store;
  manager: CanvasManager;
  slidesController: SlidesController;
  signal?: AbortSignal;
}): Promise<void> {
  const { store, slidesController, signal } = input;
  const theme = input.theme.trim();
  const expected = Math.min(20, Math.max(1, Math.round(input.slides)));
  const setId = input.setId?.trim() || undefined;

  store.getState().resetGenerate();
  store.getState().setGenerate({
    genStatus: "streaming",
    genPhase: "Generating…",
    genProgress: 0.12,
    genExpectedSlides: expected,
    genTheme: theme,
    genFx: "idle",
  });

  slidesController.saveCurrent({ thumbnail: false });

  const response = await fetch("/api/generate/carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme, slides: expected, setId }),
    signal,
  });

  const data = (await response.json().catch(() => null)) as CarouselApiResponse | null;
  if (signal?.aborted) {
    store.getState().setGenerate({ genStatus: "idle", genPhase: "", genFx: "idle" });
    return;
  }

  if (!response.ok || !data) {
    throw new Error(data?.error || `Generate failed (${response.status})`);
  }

  const specs = Array.isArray(data.slides) ? data.slides : [];
  if (specs.length === 0) {
    store.getState().setGenerate({
      genStatus: "error",
      genError: data.error || "No slides generated",
      genPhase: "No slides generated",
      genFx: "idle",
    });
    return;
  }

  store.getState().setGenerate({
    genStatus: "building",
    genPhase: "Building slides…",
    genProgress: 0.75,
    genBuiltCount: specs.length,
  });

  const set = suggestedSetById(data.setId || setId) ?? suggestedSetById("black")!;
  const palette: ProjectPalette = data.palette ?? {
    background: set.background,
    text: set.text,
    accent: set.accent,
    card: set.card,
  };
  const slideBackgrounds = backgroundsForSet(set, specs.length);
  store.getState().setPalette(palette);

  const state = store.getState();
  const slides: SlideItem[] = specs.map((spec, built) => {
    const bg = spec.background || slideBackgrounds[built] || palette.background;
    return buildCarouselSlide({
      spec: { ...spec, index: built, background: bg },
      palette,
      textStyles: state.textStyles,
      chrome: state.chrome,
      width: state.canvasDimensions.width,
      height: state.canvasDimensions.height,
      slideIndex: built,
      slideCount: specs.length,
      id: built + 1,
      tagline: data.tagline,
      handle: data.handle,
    });
  });

  store.getState().setSlides(slides);
  store.getState().setCurrentSlideId(slides[0]!.id);
  await slidesController.loadCurrent();
  slidesController.saveCurrent({ thumbnail: true });
  store.getState().setDirty(true);

  const projectTitle = data.title?.trim() || theme.slice(0, 48);
  store.getState().setProjectTitle(projectTitle);
  store.getState().setGenerate({
    genStatus: "done",
    genPhase: "Carousel ready",
    genProgress: 1,
    genBuiltCount: slides.length,
    genTitle: projectTitle,
    genFx: "idle",
  });
}
