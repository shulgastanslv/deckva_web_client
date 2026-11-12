import type { CanvasState } from "./types";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import type { SlideItem } from "../types";

/** The part of `CanvasManager` the slide logic depends on. */
export interface SlideCanvas {
  getState(): CanvasState;
  loadState(state: CanvasState | null): Promise<void>;
  readonly isDisposed?: boolean;
  /** JPEG of the canvas as it is right now. Missing on test doubles. */
  captureThumbnail?(): string | null;
}

export interface SlidesState {
  slides: SlideItem[];
  currentSlideId: number;
  setCurrentSlideId: (id: number) => void;
  updateSlideJSONById: (id: number, json: CanvasState, options?: { dirty?: boolean }) => void;
  updateSlideThumbnail: (id: number, thumbnail: string) => void;
  addSlide: (afterId?: number) => number;
  duplicateSlide: (id?: number) => number | null;
  removeSlide: (id: number) => void;
  insertSlide: (afterId: number, json: CanvasState, thumbnail: string | null) => number;
}

export interface SlidesStore {
  getState(): SlidesState;
}

/**
 * Keeps the single Fabric canvas and the list of slides in the store consistent.
 *
 * Every operation is queued: `loadFromJSON` is async, and two overlapping switches
 * would otherwise save one slide's content into another.
 */
export class SlidesController {
  private queue: Promise<void> = Promise.resolve();
  private disposed = false;
  private depth = 0;

  constructor(
    private readonly canvas: SlideCanvas,
    private readonly store: SlidesStore,
  ) {}

  dispose(): void {
    this.disposed = true;
  }

  /** True while a slide switch or load is running. Callers should not snapshot the canvas then. */
  isBusy(): boolean {
    return this.depth > 0;
  }

  saveCurrent(options?: { thumbnail?: boolean }): void {
    if (this.disposed || this.canvas.isDisposed) return;
    const { currentSlideId, updateSlideJSONById, updateSlideThumbnail } = this.store.getState();
    updateSlideJSONById(currentSlideId, this.canvas.getState(), { dirty: false });
    if (options?.thumbnail === false) return;
    const thumbnail = this.canvas.captureThumbnail?.();
    if (thumbnail) updateSlideThumbnail(currentSlideId, thumbnail);
  }

  loadCurrent(): Promise<void> {
    return this.enqueue(() => this.load(this.store.getState().currentSlideId));
  }

  switchTo(id: number, options?: { thumbnail?: boolean }): Promise<void> {
    return this.enqueue(() => this.saveAndLoad(id, options));
  }

  next(): Promise<void> {
    return this.enqueue(() => this.saveAndLoad(this.neighbourId(1)));
  }

  prev(): Promise<void> {
    return this.enqueue(() => this.saveAndLoad(this.neighbourId(-1)));
  }

  add(): Promise<void> {
    return this.enqueue(async () => {
      this.saveCurrent();
      const state = this.store.getState();
      const newId = state.addSlide(state.currentSlideId);
      await this.load(newId);
    });
  }

  /** Saves the current slide, clones `id` (defaults to current), and opens the copy. */
  duplicate(id?: number): Promise<void> {
    return this.enqueue(async () => {
      this.saveCurrent();
      const state = this.store.getState();
      const sourceId = id ?? state.currentSlideId;
      const newId = state.duplicateSlide(sourceId);
      if (newId == null) return;
      await this.load(newId);
    });
  }

  /** Saves the current slide, inserts `json` after it, and opens the new slide. */
  insert(json: CanvasState, thumbnail: string | null): Promise<void> {
    return this.enqueue(async () => {
      this.saveCurrent();
      const state = this.store.getState();
      const newId = state.insertSlide(state.currentSlideId, json, thumbnail);
      await this.load(newId);
    });
  }

  remove(id: number): Promise<void> {
    return this.enqueue(async () => {
      const { slides, currentSlideId } = this.store.getState();
      if (slides.length <= 1) return;

      if (id === currentSlideId) {
        const index = slides.findIndex((s) => s.id === id);
        const fallback = slides[index - 1] ?? slides[index + 1];
        // The removed slide's content is intentionally not saved.
        await this.load(fallback.id);
      }
      this.store.getState().removeSlide(id);
    });
  }

  private neighbourId(offset: 1 | -1): number | undefined {
    const { slides, currentSlideId } = this.store.getState();
    const index = slides.findIndex((s) => s.id === currentSlideId);
    return slides[index + offset]?.id;
  }

  private async saveAndLoad(
    id: number | undefined,
    options?: { thumbnail?: boolean },
  ): Promise<void> {
    const { slides, currentSlideId } = this.store.getState();
    if (id === undefined || id === currentSlideId) return;
    if (!slides.some((s) => s.id === id)) return;

    this.saveCurrent(options);
    await this.load(id);
  }

  private async load(id: number): Promise<void> {
    if (this.disposed || this.canvas.isDisposed) return;
    const slide = this.store.getState().slides.find((s) => s.id === id);
    if (!slide) return;
    await this.canvas.loadState(slide.canvasJSON ?? null);
    if (this.disposed || this.canvas.isDisposed) return;
    this.store.getState().setCurrentSlideId(id);
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    const run = this.queue.then(async () => {
      if (this.disposed || this.canvas.isDisposed) return;
      this.depth += 1;
      try {
        await task();
      } finally {
        this.depth -= 1;
      }
    });
    this.queue = run.catch((error) => {
      if (this.disposed || this.canvas.isDisposed) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      reportError(error, messages.errors.slideOperation);
    });
    return run;
  }
}
