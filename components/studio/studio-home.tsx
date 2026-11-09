"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  useInvalidateStudioProjects,
  useUserProjects,
} from "@/lib/studio/queries";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioBoardGrid } from "@/components/studio/browse/studio-board-grid";
import { StudioProjectCard } from "@/components/studio/browse/studio-project-card";
import { StudioProjectList } from "@/components/studio/browse/studio-project-list";
import { StudioStartSection } from "@/components/studio/start/studio-start-section";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioSectionHeader } from "@/components/studio/ui/studio-section-header";
import { StudioViewToggle } from "@/components/studio/ui/studio-view-toggle";
import { saveAsNewProject } from "@/actions/projects";
import {
  aiPaletteToProjectPalette,
  parseAiPalette,
} from "@/lib/ai/generate-palette";
import { normalizeDocument } from "@/lib/canvas/document";
import { reportError } from "@/lib/report-error";
import { messages } from "@/lib/messages";
import { parseImportedTemplate } from "@/lib/templates/parse";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { STARTER_CAROUSEL_PROMPTS } from "@/lib/studio/onboarding";
import { useTranslations } from "next-intl";

type ViewMode = "list" | "grid";

export function StudioHome() {
  const t = useTranslations("studio");
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic")?.trim() ?? "";
  const { status } = useSession();
  const authPending = status === "loading";
  const signedIn = status !== "unauthenticated";
  const create = useStudioCreate();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const projectsQuery = useUserProjects("", signedIn);
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data],
  );
  const loadingProjects =
    signedIn && !projectsQuery.data && !projectsQuery.isError;
  const refreshProjects = useInvalidateStudioProjects();
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!topic) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("topic");
    url.searchParams.delete("generate");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [topic]);

  useEffect(() => {
    const onSidebarSearch = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof query === "string") setSearch(query);
    };
    window.addEventListener("studio:sidebar-search", onSidebarSearch);
    return () =>
      window.removeEventListener("studio:sidebar-search", onSidebarSearch);
  }, []);

  const q = search.trim().toLowerCase();
  const visibleProjects = useMemo(
    () =>
      projects
        .filter((p) => {
          if (!q) return true;
          return (p.title || "Untitled").toLowerCase().includes(q);
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
    [projects, q],
  );

  const focusMode = !loadingProjects && projects.length === 0;
  const empty =
    !q && !loadingProjects && projects.length === 0
      ? true
      : visibleProjects.length === 0;

  return (
    <StudioContent>
      <StudioContentBody className="pt-8">
        <StudioStartSection
          topic={topic}
          focusMode={focusMode}
          onBlank={create.openBlank}
          onTemplates={() => router.push("/studio/browse?tab=community")}
          onBrandKit={() => router.push("/studio/brand-kit")}
          onImportJson={async (file) => {
            create.setGenerateError(null);
            create.setGenerating(true);
            try {
              const text = await file.text();
              const raw = JSON.parse(text) as unknown;
              const parsed = parseImportedTemplate(raw);
              if (!parsed.ok || parsed.template.slides.length === 0) {
                throw new Error(
                  parsed.ok === false
                    ? parsed.error
                    : messages.errors.notCanvasJson,
                );
              }
              const template = parsed.template;
              const aspectRatio: RatioKey = template.aspectRatio || "4:5";
              const dims = CANVAS_RATIOS[aspectRatio];
              let document = normalizeDocument(null);
              try {
                const row =
                  raw && typeof raw === "object"
                    ? (raw as Record<string, unknown>)
                    : null;
                if (row?.palette) {
                  document = {
                    ...document,
                    palette: aiPaletteToProjectPalette(
                      parseAiPalette(row.palette),
                    ),
                  };
                }
              } catch {
                // optional
              }
              const res = await saveAsNewProject({
                title:
                  template.title ||
                  file.name.replace(/\.json$/i, "") ||
                  "Imported",
                aspectRatio,
                width: dims.width,
                height: dims.height,
                slides: template.slides.map((canvasJSON) => ({
                  canvasJSON,
                  thumbnail: null,
                })),
                document,
              });
              if (!res.success || !("projectId" in res)) {
                throw new Error(
                  "error" in res ? res.error : messages.errors.importJson,
                );
              }
              await refreshProjects();
              router.push(`/studio/editor?project=${res.projectId}`);
            } catch (err) {
              reportError(err, messages.errors.importJson);
              create.setGenerateError(
                err instanceof Error ? err.message : messages.errors.importJson,
              );
            } finally {
              create.setGenerating(false);
            }
          }}
          onGenerate={create.generateFromPrompt}
          generating={create.generating}
          generateError={create.generateError}
        />

        <section className="mt-8">
          <StudioSectionHeader
            title={t("recent")}
            trailing={
              signedIn ? (
                <StudioViewToggle view={view} onChange={setView} />
              ) : null
            }
          />

          {!hasMounted || authPending || (signedIn && loadingProjects) ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : empty ? (
            <div className="py-6">
              <p className="text-[13px] text-muted-foreground">
                {q ? t("nothingFound") : t("tryStarter")}
              </p>
              {!q ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {STARTER_CAROUSEL_PROMPTS.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      disabled={create.generating}
                      onClick={() => {
                        trackEvent("studio_starter_chip", { id: starter.id });
                        void create.generateCarousel({ topic: starter.topic });
                      }}
                      className="inline-flex h-9 items-center rounded-full bg-muted/40 px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
                    >
                      {starter.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : view === "list" ? (
            <div className="overflow-x-auto">
              <StudioProjectList
                projects={visibleProjects.slice(0, 12)}
                onOpen={(id) => router.push(`/studio/editor?project=${id}`)}
                onChanged={refreshProjects}
              />
            </div>
          ) : (
            <StudioBoardGrid>
              {visibleProjects.slice(0, 12).map((project) => (
                <StudioProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() =>
                    router.push(`/studio/editor?project=${project.id}`)
                  }
                  onChanged={refreshProjects}
                />
              ))}
            </StudioBoardGrid>
          )}
        </section>
      </StudioContentBody>
    </StudioContent>
  );
}
