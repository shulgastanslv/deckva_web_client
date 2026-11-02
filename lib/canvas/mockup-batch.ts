import type { CanvasManager } from "@/lib/canvas/manager";
import type { SlidesController } from "@/lib/canvas/slides";
import type { FrameKind } from "@/lib/canvas/frames";
import { useCanvasStore } from "@/store/useCanvasStore";

/** Ensures there are at least `count` slides; returns their ids in order. */
async function ensureSlideCount(
  slides: SlidesController,
  count: number,
): Promise<number[]> {
  slides.saveCurrent();
  let state = useCanvasStore.getState();
  while (state.slides.length < count) {
    await slides.add();
    state = useCanvasStore.getState();
  }
  return state.slides.slice(0, count).map((slide) => slide.id);
}

/**
 * Builds one device + title per line (or image). Ideal for “top 5 frameworks”.
 * Pass screens to fill immediately; otherwise place empty devices and fill later.
 */
export async function buildRankedMockupSlides(input: {
  manager: CanvasManager;
  slides: SlidesController;
  kind: FrameKind;
  titles: string[];
  screens?: string[];
}): Promise<void> {
  const { manager, slides, kind } = input;
  const count = Math.max(input.titles.length, input.screens?.length ?? 0);
  if (count === 0) return;

  const titles = Array.from({ length: count }, (_, i) => input.titles[i]?.trim() || `${i + 1}`);
  const screens = input.screens ?? [];

  const ids = await ensureSlideCount(slides, count);
  for (let i = 0; i < count; i++) {
    const id = ids[i];
    if (id == null) continue;
    await slides.switchTo(id);
    await manager.runBatched(async () => {
      for (const obj of [...manager.canvas.getObjects()]) {
        manager.canvas.remove(obj);
      }
      await manager.objects.placeTitledDevice(kind, titles[i]!, screens[i]);
    });
  }
  useCanvasStore.getState().setDirty(true);
}

/** Places a row of devices on the current slide, optionally filling screens. */
export async function buildDeviceRow(input: {
  manager: CanvasManager;
  kind: FrameKind;
  count: number;
  screens?: string[];
}): Promise<void> {
  const { manager, kind, count, screens } = input;
  await manager.runBatched(async () => {
    const frames = await manager.objects.placeDeviceRow(kind, count, { replace: true });
    if (!screens?.length) return;
    const n = Math.min(frames.length, screens.length);
    for (let i = 0; i < n; i++) {
      const frame = frames[i];
      const source = screens[i];
      if (frame && source) await manager.objects.fillDeviceFrame(frame, source);
    }
  });
  useCanvasStore.getState().setDirty(true);
}

/**
 * Fills existing frames left→right on the current slide.
 * Extra images create one device slide each after the current set.
 */
export async function fillMockupsFromImages(input: {
  manager: CanvasManager;
  slides: SlidesController;
  kind: FrameKind;
  screens: string[];
  mode: "this-slide" | "per-slide";
}): Promise<void> {
  const { manager, slides, kind, screens, mode } = input;
  if (screens.length === 0) return;

  if (mode === "this-slide") {
    await manager.runBatched(async () => {
      let frames = manager.objects.listFrames();
      if (frames.length === 0) {
        frames = await manager.objects.placeDeviceRow(kind, Math.min(screens.length, 5), {
          replace: true,
        });
      }
      const n = Math.min(frames.length, screens.length);
      for (let i = 0; i < n; i++) {
        const frame = frames[i];
        const source = screens[i];
        if (frame && source) await manager.objects.fillDeviceFrame(frame, source);
      }
    });
    useCanvasStore.getState().setDirty(true);
    return;
  }

  const ids = await ensureSlideCount(slides, screens.length);
  for (let i = 0; i < screens.length; i++) {
    const id = ids[i];
    const source = screens[i];
    if (id == null || !source) continue;
    await slides.switchTo(id);
    await manager.runBatched(async () => {
      const frames = manager.objects.listFrames();
      if (frames[0]) {
        await manager.objects.fillDeviceFrame(frames[0], source);
      } else {
        await manager.objects.placeTitledDevice(kind, `${i + 1}`, source);
      }
    });
  }
  useCanvasStore.getState().setDirty(true);
}
