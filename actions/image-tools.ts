"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import {
  magicLayerImage as magicLayerUpstream,
  removeImageBackground as removeBgUpstream,
  upscaleImage as upscaleUpstream,
  type MagicLayerResult,
  type UpscaleScale,
} from "@/lib/image/deckva-tools";
import { messages } from "@/lib/messages";

export type { MagicLayerResult, UpscaleScale };

async function requireSignedIn() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error(messages.errors.signIn);
  }
}

export async function removeImageBackground(source: string): Promise<string> {
  await requireSignedIn();
  return removeBgUpstream(source);
}

export async function upscaleImage(
  source: string,
  scale: UpscaleScale = 2,
): Promise<string> {
  await requireSignedIn();
  return upscaleUpstream(source, scale);
}

export async function magicLayerImage(source: string): Promise<MagicLayerResult> {
  await requireSignedIn();
  return magicLayerUpstream(source);
}
