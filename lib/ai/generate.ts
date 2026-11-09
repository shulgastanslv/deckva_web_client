import { aiBaseUrl, fetchAiJson } from "@/lib/ai/client";
import { parseCoraCarouselPayload } from "@/lib/ai/parse-cora";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import type {
  GenerateCarouselInput,
  GenerateCarouselResult,
} from "@/lib/ai/types";

export { aiBaseUrl };
export type { GenerateCarouselInput, GenerateCarouselResult };

const TIMEOUT_MS = 180_000;

/** Call CORA only — free-gen / Pro gate lives in `actions/ai.ts`. */
export async function generateCarouselUpstream(
  input: GenerateCarouselInput,
): Promise<Omit<GenerateCarouselResult, "entitlement">> {
  const topic = input.topic.trim();
  if (topic.length < 2) {
    throw new Error("Describe what the carousel should be about");
  }
  const userId = input.userId.trim();
  if (!userId) throw new Error("Sign in to generate");

  const aspectRatio = input.aspectRatio ?? "4:5";
  const slidesCount = Math.min(10, Math.max(4, input.slidesCount ?? 7));
  const language = input.language?.trim() || inferPromptLanguage(topic);
  const handle = normalizeHandle(input.handle);

  const payload = await fetchAiJson(
    "/cora/run",
    {
      userId,
      topic,
      language,
      ratio: aspectRatio,
      slidesCount,
      handle,
      cover: input.cover ?? "",
      mode: input.mode ?? "fast",
      plan: input.plan ?? "free",
      ...(input.modelId ? { modelId: input.modelId } : {}),
      ...(input.seedText?.trim() ? { seedText: input.seedText.trim() } : {}),
      save: false,
    },
    { timeoutMs: TIMEOUT_MS, label: "Carousel generation" },
  );

  return parseCoraCarouselPayload(payload, { topic, aspectRatio });
}
