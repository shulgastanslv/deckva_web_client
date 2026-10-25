import { getTemplateById } from "@/actions/templates";
import type { SlidesController } from "@/lib/canvas/slides";
import { buildCarouselSlide } from "@/lib/ai/carousel-slide";
import { backgroundsForSet, suggestedSetById } from "@/lib/ai/carousel-style";
import type { CarouselSlideSpec } from "@/lib/ai/carousel-types";
import { buildSlidesFromTemplate } from "@/lib/ai/fill-template-slides";
import {
  normalizeGenerateOptions,
  type CarouselGenerateOptions,
} from "@/lib/ai/generate-options";
import type { ProjectPalette } from "@/lib/canvas/document";
import type { SlideItem } from "@/lib/types";
import type { CanvasStoreState } from "@/store/useCanvasStore";

type Store = { getState: () => CanvasStoreState };

type FromRefsApiResponse = {
  error?: string;
  title?: string;
  setId?: string;
  palette?: ProjectPalette;
  handle?: string;
  slides?: CarouselSlideSpec[];
  options?: CarouselGenerateOptions;
};

/** Convert blob:/http(s) URLs to data URLs the API can send to Ollama. */
async function ensureDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to read a reference image");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to encode reference image"));
    };
    reader.onerror = () => reject(new Error("Failed to encode reference image"));
    reader.readAsDataURL(blob);
  });
}

export async function runFromReferences(input: {
  images: string[];
  slides?: number;
  setId?: string;
  options?: Partial<CarouselGenerateOptions>;
  store: Store;
  slidesController: SlidesController;
  signal?: AbortSignal;
}): Promise<void> {
  const { store, slidesController, signal } = input;
  const expected = Math.min(
    20,
    Math.max(1, Math.round(input.slides ?? input.images.length ?? 6)),
  );
  const setId = input.setId?.trim() || undefined;
  const options = normalizeGenerateOptions(input.options);

  store.getState().resetGenerate();
  store.getState().setGenerate({
    genStatus: "streaming",
    genPhase: "Reading references…",
    genProgress: 0.12,
    genExpectedSlides: expected,
    genTheme: "From references",
  });

  slidesController.saveCurrent({ thumbnail: false });

  const images = await Promise.all(input.images.slice(0, 8).map(ensureDataUrl));
  if (signal?.aborted) {
    store.getState().setGenerate({ genStatus: "idle", genPhase: "" });
    return;
  }

  const response = await fetch("/api/generate/from-references", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images, slides: expected, setId, options }),
    signal,
  });

  const data = (await response.json().catch(() => null)) as FromRefsApiResponse | null;
  if (signal?.aborted) {
    store.getState().setGenerate({ genStatus: "idle", genPhase: "" });
    return;
  }

  if (!response.ok || !data) {
    throw new Error(data?.error || `Recreate failed (${response.status})`);
  }

  const specs = Array.isArray(data.slides) ? data.slides : [];
  if (specs.length === 0) {
    store.getState().setGenerate({
      genStatus: "error",
      genError: data.error || "No slides generated",
      genPhase: "No slides generated",
    });
    return;
  }

  store.getState().setGenerate({
    genStatus: "building",
    genPhase: options.templateId ? "Filling template…" : "Building slides…",
    genProgress: 0.75,
    genBuiltCount: specs.length,
  });

  const resolvedOptions = normalizeGenerateOptions(data.options ?? options);
  const set = suggestedSetById(data.setId || setId) ?? suggestedSetById("butter")!;
  const palette: ProjectPalette = data.palette ?? {
    background: set.background,
    text: set.text,
    accent: set.accent,
    card: set.card,
  };
  store.getState().setPalette(palette);

  let slides: SlideItem[];

  if (resolvedOptions.templateId) {
    const tpl = await getTemplateById(resolvedOptions.templateId);
    if (!tpl.success) throw new Error("Template not found");
    store.getState().setCurrentRatio(tpl.template.aspectRatio);
    slides = buildSlidesFromTemplate({
      templateSlides: tpl.template.slides,
      specs,
      thumbnails: tpl.template.thumbnails,
    });
  } else {
    const slideBackgrounds = backgroundsForSet(set, specs.length);
    const state = store.getState();
    slides = specs.map((spec, index) =>
      buildCarouselSlide({
        spec: {
          ...spec,
          background: spec.background || slideBackgrounds[index] || palette.background,
        },
        palette,
        chrome: state.chrome,
        width: state.canvasDimensions.width,
        height: state.canvasDimensions.height,
        slideIndex: index,
        slideCount: specs.length,
        id: index + 1,
        handle: data.handle,
        options: resolvedOptions,
      }),
    );
  }

  store.getState().setSlides(slides);
  store.getState().setCurrentSlideId(slides[0]!.id);
  await slidesController.loadCurrent();
  slidesController.saveCurrent({ thumbnail: true });
  store.getState().setDirty(true);

  const projectTitle = data.title?.trim() || "From references";
  store.getState().setProjectTitle(projectTitle);
  store.getState().setGenerate({
    genStatus: "done",
    genPhase: "Carousel ready",
    genProgress: 1,
    genBuiltCount: slides.length,
    genTitle: projectTitle,
  });
}
