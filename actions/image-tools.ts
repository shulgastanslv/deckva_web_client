"use server";

import {
  magicLayerImage as magicLayerUpstream,
  removeImageBackground as removeBgUpstream,
  upscaleImage as upscaleUpstream,
  type MagicLayerResult,
  type UpscaleScale,
} from "@/lib/image/deckva-tools";

export type { MagicLayerResult, UpscaleScale };

/** Auth: proxy (studio). */
export async function removeImageBackground(source: string): Promise<string> {
  return removeBgUpstream(source);
}

/** Auth: proxy (studio). */
export async function upscaleImage(
  source: string,
  scale: UpscaleScale = 2,
): Promise<string> {
  return upscaleUpstream(source, scale);
}

/** Auth: proxy (studio). */
export async function magicLayerImage(source: string): Promise<MagicLayerResult> {
  return magicLayerUpstream(source);
}
