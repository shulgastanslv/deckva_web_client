"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { getGenerationStatus } from "@/actions/ai";
import { createProject, saveAsNewProject } from "@/actions/projects";
import {
  BlankProjectDialog,
  type BlankProjectInput,
} from "@/components/studio/create/blank-project-dialog";
import {
  StudioFigmaImportDialog,
  type StudioFigmaImportResult,
} from "@/components/studio/create/studio-figma-import-dialog";
import { inferPromptLanguage, normalizeHandle } from "@/lib/ai/prompt";
import { trackEvent } from "@/lib/analytics";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { stashPendingCover } from "@/lib/studio/pending-cover";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { useCanvasStore } from "@/store/useCanvasStore";

async function canGenerate(): Promise<boolean> {
  try {
    const status = await getGenerationStatus();
    if (status.entitlement.canGenerate) return true;
  } catch {
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

type StudioCreateValue = {
  openBlank: () => void;
  openFigmaImport: () => void;
  openCommunity: () => void;
  generating: boolean;
  setGenerating: (v: boolean) => void;
  generateError: string | null;
  setGenerateError: (v: string | null) => void;
  generateFromPrompt: (input: StudioPromptSubmit) => Promise<void>;
  generateCarousel: (input: {
    topic: string;
    modelId?: string;
    cover?: string;
    aspectRatio?: RatioKey;
    slidesCount?: number;
    language?: string;
    handle?: string;
  }) => Promise<void>;
};

const StudioCreateContext = createContext<StudioCreateValue | null>(null);

export function StudioCreateProvider({
  children,
  onNeedAuth,
}: {
  children: ReactNode;
  onNeedAuth?: () => void;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [blankOpen, setBlankOpen] = useState(false);
  const [figmaOpen, setFigmaOpen] = useState(false);
  const [blankBusy, setBlankBusy] = useState(false);

  const requireAuth = useCallback(() => {
    if (status === "authenticated") return true;
    onNeedAuth?.();
    return false;
  }, [status, onNeedAuth]);

  const openBlank = useCallback(() => {
    if (!requireAuth()) return;
    setBlankOpen(true);
  }, [requireAuth]);

  const openFigmaImport = useCallback(() => {
    if (!requireAuth()) return;
    setFigmaOpen(true);
  }, [requireAuth]);

  const openCommunity = useCallback(() => {
    router.push("/studio/browse?tab=community");
  }, [router]);

  const createBlankProject = useCallback(
    async (input: BlankProjectInput) => {
      setBlankBusy(true);
      setGenerateError(null);
      try {
        const created = await createProject({
          title: input.title,
          aspectRatio: input.aspectRatio,
          slidesCount: input.slidesCount,
        });
        if (created.success === false) {
          toast.error(created.error);
          throw new Error(created.error);
        }
        trackEvent("blank_project_created", {
          projectId: created.projectId,
          slidesCount: input.slidesCount,
          aspectRatio: input.aspectRatio,
        });
        router.push(`/studio/editor?project=${created.projectId}`);
      } catch (err) {
        reportError(err, messages.errors.createProject);
        throw err;
      } finally {
        setBlankBusy(false);
      }
    },
    [router],
  );

  const createFromFigma = useCallback(
    async (result: StudioFigmaImportResult) => {
      setGenerateError(null);
      const dims = CANVAS_RATIOS[result.aspectRatio];
      const saved = await saveAsNewProject({
        title: result.title,
        aspectRatio: result.aspectRatio,
        width: dims.width,
        height: dims.height,
        slides: result.slides.map((canvasJSON) => ({
          canvasJSON,
          thumbnail: null,
        })),
      });
      if (!saved.success || !("projectId" in saved)) {
        const message =
          "error" in saved ? saved.error : messages.errors.createProject;
        toast.error(message);
        throw new Error(message);
      }
      router.push(`/studio/editor?project=${saved.projectId}`);
    },
    [router],
  );

  const generateCarousel = useCallback(
    async (input: {
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
    },
    [router, session?.user?.email, session?.user?.name],
  );

  const generateFromPrompt = useCallback(
    async (input: StudioPromptSubmit) => {
      await generateCarousel({
        topic: input.topic,
        modelId: input.modelId,
        cover: input.cover,
        slidesCount: input.slidesCount,
      });
    },
    [generateCarousel],
  );

  const value = useMemo<StudioCreateValue>(
    () => ({
      openBlank,
      openFigmaImport,
      openCommunity,
      generating,
      setGenerating,
      generateError,
      setGenerateError,
      generateFromPrompt,
      generateCarousel,
    }),
    [
      openBlank,
      openFigmaImport,
      openCommunity,
      generating,
      generateError,
      generateFromPrompt,
      generateCarousel,
    ],
  );

  return (
    <StudioCreateContext.Provider value={value}>
      {children}
      <BlankProjectDialog
        open={blankOpen}
        onOpenChange={setBlankOpen}
        busy={blankBusy}
        onSubmit={createBlankProject}
      />
      <StudioFigmaImportDialog
        open={figmaOpen}
        onOpenChange={setFigmaOpen}
        onNeedAuth={onNeedAuth}
        onImport={createFromFigma}
      />
    </StudioCreateContext.Provider>
  );
}

export function useStudioCreate(): StudioCreateValue {
  const ctx = useContext(StudioCreateContext);
  if (!ctx) {
    throw new Error("useStudioCreate must be used within StudioCreateProvider");
  }
  return ctx;
}
