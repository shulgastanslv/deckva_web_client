"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { createProject } from "@/actions/projects";
import { fetchActiveOrganization, fetchUserProjects } from "@/lib/studio/queries";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import { stashPendingCover } from "@/lib/studio/pending-cover";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { FREE_CAROUSEL_LIMIT } from "@/lib/studio/plans";
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

  const openTemplates = () => router.push("/studio/templates");

  const generateFromPrompt = async (input: {
    topic: string;
    cover?: string;
  }) => {
    const topic = input.topic.trim();
    const cover = input.cover?.trim() ?? "";
    setGenerateError(null);
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot(queryClient))) return;

    setGenerating(true);
    try {
      const aspectRatio: RatioKey = "4:5";
      const created = await createProject({
        title: draftTitle(topic),
        aspectRatio,
      });
      if (!created.success) {
        setGenerateError(messages.errors.createCarousel);
        return;
      }

      const handle = normalizeHandle(
        session?.user?.name || session?.user?.email?.split("@")[0],
      );

      // Keep http(s) covers in the intent; data URLs live in memory (sessionStorage quota).
      const intentCover = cover.startsWith("data:") ? "" : cover;
      stashPendingCover(created.projectId, cover);
      stashStudioIntent({
        type: "generate",
        projectId: created.projectId,
        topic,
        handle,
        language: inferPromptLanguage(topic),
        aspectRatio,
        slidesCount: 7,
        cover: intentCover,
      });

      // Show the editor fallback immediately across the navigation.
      const store = useCanvasStore.getState();
      store.setCurrentProjectId(created.projectId);
      store.setProjectTitle(draftTitle(topic));
      store.setGeneratingCarousel(true);

      notifyProjectsChanged();
      router.push(`/studio/editor?project=${created.projectId}`);
    } catch (err) {
      reportError(err, messages.errors.startGeneration);
      setGenerateError(messages.errors.startGeneration);
    } finally {
      setGenerating(false);
    }
  };

  return {
    authNeeded,
    setAuthNeeded,
    openBlank,
    openTemplates,
    generating,
    generateError,
    setGenerateError,
    generateFromPrompt,
  };
}
