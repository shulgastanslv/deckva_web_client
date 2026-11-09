"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { getGenerationStatus } from "@/actions/ai";
import { createProject } from "@/actions/projects";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import { trackEvent } from "@/lib/analytics";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { stashPendingCover } from "@/lib/studio/pending-cover";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import type { RatioKey } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

async function canGenerate(): Promise<boolean> {
  try {
    const status = await getGenerationStatus();
    if (status.entitlement.canGenerate) return true;
  } catch {
    // Not signed in / offline — let the flow surface the real error
    return true;
  }
  window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
  return false;
}

function draftTitle(topic: string): string {
  const trimmed = topic.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 64) return trimmed;
  return `${trimmed.slice(0, 61).trimEnd()}…`;
}

/** Create a project, stash generate intent, open editor. CORA runs in the editor. */
export function useStudioCreate() {
  const router = useRouter();
  const { data: session } = useSession();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const openBlank = async () => {
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const openCommunity = () => router.push("/studio/browse?tab=community");

  const generateCarousel = async (input: {
    topic: string;
    modelId?: string;
    cover?: string;
    aspectRatio?: RatioKey;
    slidesCount?: number;
    language?: string;
    handle?: string;
  }) => {
    setGenerateError(null);
    if (!(await canGenerate())) return;

    setGenerating(true);
    try {
      const topic = input.topic.trim();
      const aspectRatio: RatioKey = input.aspectRatio ?? "4:5";
      const slidesCount = Math.min(10, Math.max(4, input.slidesCount ?? 7));
      const language = input.language?.trim() || inferPromptLanguage(topic);
      const handle = normalizeHandle(
        input.handle ||
          session?.user?.name ||
          session?.user?.email?.split("@")[0],
      );
      const cover = input.cover?.trim() ?? "";

      const created = await createProject({
        title: draftTitle(topic),
        aspectRatio,
      });
      if (!created.success) {
        setGenerateError(messages.errors.createCarousel);
        return;
      }

      stashPendingCover(created.projectId, cover);
      stashStudioIntent({
        type: "generate",
        projectId: created.projectId,
        topic,
        handle,
        language,
        aspectRatio,
        slidesCount,
        cover: cover.startsWith("data:") ? "" : cover,
        modelId: input.modelId,
      });

      const store = useCanvasStore.getState();
      store.setCurrentProjectId(created.projectId);
      store.setProjectTitle(draftTitle(topic));
      store.setGeneratingCarousel(true);

      trackEvent("carousel_created", {
        projectId: created.projectId,
        slidesCount,
        aspectRatio,
        language,
        modelId: input.modelId ?? null,
      });
      router.push(`/studio/editor?project=${created.projectId}`);
    } catch (err) {
      reportError(err, messages.errors.startGeneration);
      setGenerateError(
        err instanceof Error ? err.message : messages.errors.startGeneration,
      );
    } finally {
      setGenerating(false);
    }
  };

  const generateFromPrompt = async (input: StudioPromptSubmit) => {
    await generateCarousel({
      topic: input.topic,
      modelId: input.modelId,
    });
  };

  return {
    openBlank,
    openCommunity,
    generating,
    setGenerating,
    generateError,
    setGenerateError,
    generateFromPrompt,
    generateCarousel,
  };
}
