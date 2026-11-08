"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  createPaletteArtifact,
  createTextArtifact,
  linkCarouselArtifact,
} from "@/actions/artifacts";
import { createProject } from "@/actions/projects";
import {
  generatePalette as generatePaletteAi,
  generateText as generateTextAi,
} from "@/actions/ai";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import {
  fetchActiveOrganization,
  fetchUserProjects,
  invalidateStudioArtifacts,
} from "@/lib/studio/queries";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { stashPendingCover } from "@/lib/studio/pending-cover";
import {
  stashStudioIntent,
  type StudioInsertIntent,
} from "@/lib/studio/pending-intent";
import { FREE_CAROUSEL_LIMIT } from "@/lib/studio/plans";
import type { GenerationKind, StudioPromptSubmit } from "@/lib/studio/generation/types";
import type { RatioKey } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

async function requireCarouselSlot(client: QueryClient): Promise<boolean> {
  const [orgResult, projectsResult] = await Promise.allSettled([
    fetchActiveOrganization(client),
    fetchUserProjects(client),
  ]);
  if (
    orgResult.status === "fulfilled" &&
    orgResult.value.organization?.isUpgrade
  ) {
    return true;
  }
  const count =
    projectsResult.status === "fulfilled" ? projectsResult.value.projects.length : 0;
  if (count >= FREE_CAROUSEL_LIMIT) {
    window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
    return false;
  }
  return true;
}

function notifyProjectsChanged() {
  window.dispatchEvent(new CustomEvent("core:projects-changed"));
}

function draftTitle(topic: string): string {
  const trimmed = topic.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 64) return trimmed;
  return `${trimmed.slice(0, 61).trimEnd()}…`;
}

export function useStudioCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [authNeeded, setAuthNeeded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const requireAuth = () => {
    if (status === "authenticated") return true;
    setAuthNeeded(true);
    return false;
  };

  const openBlank = async () => {
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot(queryClient))) return;
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const openWithInsert = async (
    intent: Omit<StudioInsertIntent, "type">,
  ) => {
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot(queryClient))) return;
    stashStudioIntent({ type: "insert", ...intent });
    router.push("/studio/editor");
  };

  const openTemplates = () => router.push("/studio/browse?tab=templates");

  const generateText = async (input: {
    topic: string;
    parentArtifactId?: string | null;
  }) => {
    const topic = input.topic.trim();
    setGenerateError(null);
    if (!requireAuth()) return;

    setGenerating(true);
    try {
      const { text } = await generateTextAi(topic);
      const created = await createTextArtifact({
        prompt: topic,
        text,
        parentId: input.parentArtifactId,
      });
      if (!created.success) {
        setGenerateError(
          "error" in created ? created.error : messages.errors.generic,
        );
        return;
      }
      await invalidateStudioArtifacts(queryClient);
      notifyProjectsChanged();
      router.push(`/studio/artifacts/${created.artifactId}`);
    } catch (err) {
      reportError(err, messages.errors.startGeneration);
      setGenerateError(
        err instanceof Error ? err.message : messages.errors.startGeneration,
      );
    } finally {
      setGenerating(false);
    }
  };

  const generatePalette = async (input: {
    topic: string;
    parentArtifactId?: string | null;
  }) => {
    const topic = input.topic.trim();
    setGenerateError(null);
    if (!requireAuth()) return;

    setGenerating(true);
    try {
      const palette = await generatePaletteAi(
        topic,
        inferPromptLanguage(topic),
      );
      const created = await createPaletteArtifact({
        prompt: topic,
        palette,
        title: palette.name,
        parentId: input.parentArtifactId,
      });
      if (!created.success) {
        setGenerateError(
          "error" in created ? created.error : messages.errors.generic,
        );
        return;
      }
      await invalidateStudioArtifacts(queryClient);
      notifyProjectsChanged();
      router.push(`/studio/artifacts/${created.artifactId}`);
    } catch (err) {
      reportError(err, messages.errors.startGeneration);
      setGenerateError(
        err instanceof Error ? err.message : messages.errors.startGeneration,
      );
    } finally {
      setGenerating(false);
    }
  };

  const generateCarousel = async (input: {
    topic: string;
    cover?: string;
    aspectRatio?: RatioKey;
    slidesCount?: number;
    language?: string;
    handle?: string;
    parentArtifactId?: string | null;
  }) => {
    const topic = input.topic.trim();
    const cover = input.cover?.trim() ?? "";
    setGenerateError(null);
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot(queryClient))) return;

    setGenerating(true);
    try {
      const aspectRatio: RatioKey = input.aspectRatio ?? "4:5";
      const slidesCount = Math.min(10, Math.max(4, input.slidesCount ?? 7));
      const language =
        input.language?.trim() || inferPromptLanguage(topic);
      const handle = normalizeHandle(
        input.handle ||
          session?.user?.name ||
          session?.user?.email?.split("@")[0],
      );

      const created = await createProject({
        title: draftTitle(topic),
        aspectRatio,
      });
      if (!created.success) {
        setGenerateError(messages.errors.createCarousel);
        return;
      }

      await linkCarouselArtifact({
        projectId: created.projectId,
        title: draftTitle(topic),
        prompt: topic,
        parentId: input.parentArtifactId,
        topic,
      });

      const intentCover = cover.startsWith("data:") ? "" : cover;
      stashPendingCover(created.projectId, cover);
      stashStudioIntent({
        type: "generate",
        projectId: created.projectId,
        topic,
        handle,
        language,
        aspectRatio,
        slidesCount,
        cover: intentCover,
        parentArtifactId: input.parentArtifactId ?? null,
      });

      const store = useCanvasStore.getState();
      store.setCurrentProjectId(created.projectId);
      store.setProjectTitle(draftTitle(topic));
      store.setGeneratingCarousel(true);

      await invalidateStudioArtifacts(queryClient);
      notifyProjectsChanged();
      router.push(`/studio/editor?project=${created.projectId}`);
    } catch (err) {
      reportError(err, messages.errors.startGeneration);
      setGenerateError(messages.errors.startGeneration);
    } finally {
      setGenerating(false);
    }
  };

  const generateFromPrompt = async (
    input: StudioPromptSubmit & { cover?: string },
  ) => {
    const shared = {
      topic: input.topic,
      parentArtifactId: input.parentArtifactId,
    };
    if (input.type === "text") {
      await generateText(shared);
      return;
    }
    if (input.type === "palette") {
      await generatePalette(shared);
      return;
    }
    await generateCarousel({
      ...shared,
      cover: input.cover,
    });
  };

  const openGenerateKind = (kind: GenerationKind) => {
    router.push(`/studio?generate=${kind}`);
  };

  return {
    authNeeded,
    setAuthNeeded,
    openBlank,
    openWithInsert,
    openTemplates,
    openGenerateKind,
    generating,
    setGenerating,
    generateError,
    setGenerateError,
    generateFromPrompt,
    generateText,
    generatePalette,
    generateCarousel,
  };
}
