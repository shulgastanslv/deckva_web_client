import { getArtifactById } from "@/actions/artifacts";
import { parseAiPalette, type AiPalette } from "@/lib/ai/generate-palette";
import {
  draftTopicFromText,
  type CarouselPipelineContext,
} from "@/lib/studio/pipeline";

/**
 * Walk parent artifacts (palette → text) and collect caption + locked colors
 * for carousel generation.
 */
export async function resolveCarouselPipelineContext(input: {
  topic?: string;
  seedText?: string;
  palette?: AiPalette;
  parentArtifactId?: string | null;
}): Promise<CarouselPipelineContext> {
  let topic = input.topic?.trim() || "";
  let seedText = input.seedText?.trim() || undefined;
  let palette = input.palette;
  const parentArtifactId = input.parentArtifactId ?? null;

  if (!parentArtifactId) {
    return {
      topic: topic || "Untitled carousel",
      seedText,
      palette,
      parentArtifactId,
    };
  }

  const parentRes = await getArtifactById(parentArtifactId);
  if (!parentRes.success || !("artifact" in parentRes)) {
    return {
      topic: topic || "Untitled carousel",
      seedText,
      palette,
      parentArtifactId,
    };
  }

  const parent = parentRes.artifact;

  if (parent.kind === "TEXT") {
    const text =
      typeof parent.payload.text === "string" ? parent.payload.text.trim() : "";
    if (text) {
      seedText = seedText || text;
      if (!topic) topic = draftTopicFromText(text, parent.title || parent.prompt || "Untitled carousel");
    } else if (!topic) {
      topic = parent.prompt || parent.title || "Untitled carousel";
    }
  }

  if (parent.kind === "PALETTE") {
    if (!palette) {
      try {
        palette = parseAiPalette(parent.payload);
      } catch {
        palette = undefined;
      }
    }
    if (!topic) {
      topic = parent.prompt || parent.title || palette?.name || "Untitled carousel";
    }

    // Text → palette → carousel: pull caption from the grandparent TEXT.
    if (parent.parentId && !seedText) {
      const grandRes = await getArtifactById(parent.parentId);
      if (
        grandRes.success &&
        "artifact" in grandRes &&
        grandRes.artifact.kind === "TEXT"
      ) {
        const text =
          typeof grandRes.artifact.payload.text === "string"
            ? grandRes.artifact.payload.text.trim()
            : "";
        if (text) {
          seedText = text;
          if (!input.topic?.trim()) {
            topic = draftTopicFromText(
              text,
              grandRes.artifact.title || topic,
            );
          }
        }
      }
    }
  }

  if (parent.kind === "CAROUSEL" && !topic) {
    const payloadTopic =
      typeof parent.payload.topic === "string" ? parent.payload.topic.trim() : "";
    topic = payloadTopic || parent.prompt || parent.title || "Untitled carousel";
  }

  return {
    topic: topic || "Untitled carousel",
    seedText,
    palette,
    parentArtifactId,
  };
}
