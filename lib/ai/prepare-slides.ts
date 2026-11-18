"use client";

import { normalizeCoverImages } from "@/lib/ai/normalize-cover-images";
import { preloadSlideFonts } from "@/lib/fonts/slide-fonts";
import type { FabricCanvasJSON } from "@/lib/types";

/**
 * Post-CORA client prep: cover-fit photos, then preload every Google face
 * before Fabric measures text / thumbs render.
 */
export async function prepareCanvasSlides(
  slides: FabricCanvasJSON[],
): Promise<FabricCanvasJSON[]> {
  const covered = await normalizeCoverImages(slides);
  await preloadSlideFonts(covered);
  return covered;
}
