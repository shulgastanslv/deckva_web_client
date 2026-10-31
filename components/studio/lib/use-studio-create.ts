"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { getActiveOrganization } from "@/actions/organizations";
import { createProject, getUserProjects } from "@/actions/projects";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { FREE_CAROUSEL_LIMIT } from "@/lib/studio/plans";
import type { RatioKey } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

async function requireCarouselSlot(): Promise<boolean> {
  const [orgRes, projectsRes] = await Promise.all([
    getActiveOrganization(),
    getUserProjects(),
  ]);
  if (orgRes.success && orgRes.organization?.isUpgrade) return true;
  const count = projectsRes.success ? projectsRes.projects.length : 0;
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
    if (!(await requireCarouselSlot())) return;
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const openTemplates = () => router.push("/studio/templates");

  const generateFromPrompt = async (topic: string) => {
    setGenerateError(null);
    if (!requireAuth()) return;
    if (!(await requireCarouselSlot())) return;

    setGenerating(true);
    try {
      const aspectRatio: RatioKey = "4:5";
      const created = await createProject({
        title: draftTitle(topic),
        aspectRatio,
      });
      if (!created.success) {
        setGenerateError("Couldn't create the carousel");
        return;
      }

      const handle = normalizeHandle(
        session?.user?.name || session?.user?.email?.split("@")[0],
      );

      stashStudioIntent({
        type: "generate",
        projectId: created.projectId,
        topic: topic.trim(),
        handle,
        language: inferPromptLanguage(topic),
        aspectRatio,
        slidesCount: 7,
      });

      // Show the editor fallback immediately across the navigation.
      const store = useCanvasStore.getState();
      store.setCurrentProjectId(created.projectId);
      store.setProjectTitle(draftTitle(topic));
      store.setGeneratingCarousel(true);

      notifyProjectsChanged();
      router.push(`/studio/editor?project=${created.projectId}`);
    } catch (err) {
      console.error(err);
      setGenerateError(
        err instanceof Error ? err.message : "Couldn't start generation",
      );
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
