"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  useInvalidateStudioProjects,
  useUserArtifacts,
  useUserProjects,
} from "@/lib/studio/queries";
import { AuthModal } from "@/components/auth";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioBoardGrid } from "@/components/studio/browse/studio-board-grid";
import { StudioProjectCard } from "@/components/studio/browse/studio-project-card";
import { StudioProjectList } from "@/components/studio/browse/studio-project-list";
import {
  buildRecentActivity,
  RECENT_FILTERS,
  StudioRecentActivityList,
  type RecentFilter,
} from "@/components/studio/browse/studio-recent-activity";
import { StudioTextList } from "@/components/studio/browse/studio-text-row";
import { StudioPaletteCard } from "@/components/studio/browse/studio-palette-card";
import { StudioStartSection } from "@/components/studio/start/studio-start-section";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioSectionHeader } from "@/components/studio/ui/studio-section-header";
import { StudioTypeArt } from "@/components/studio/ui/studio-type-art";
import { StudioViewToggle } from "@/components/studio/ui/studio-view-toggle";
import { Button } from "@/components/ui/button";
import { isGenerationKind } from "@/lib/studio/generation/registry";
import type { GenerationKind } from "@/lib/studio/generation/types";
import { getArtifactById } from "@/actions/artifacts";
import { saveAsNewProject } from "@/actions/projects";
import {
  aiPaletteToProjectPalette,
  parseAiPalette,
} from "@/lib/ai/generate-palette";
import { normalizeDocument } from "@/lib/canvas/document";
import { loadBrandKit, writeBrandKit } from "@/lib/studio/brand-kit";
import { reportError } from "@/lib/report-error";
import { messages } from "@/lib/messages";
import { parseImportedTemplate } from "@/lib/templates/parse";
import { CANVAS_RATIOS, type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";

export function StudioHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic")?.trim() ?? "";
  const generateParam = searchParams.get("generate")?.trim() ?? "";
  const [promptType, setPromptType] = useState<GenerationKind>(
    isGenerationKind(generateParam) ? generateParam : "text",
  );
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? undefined;
  const authPending = status === "loading";
  const signedIn = status === "authenticated" && Boolean(userId);
  const create = useStudioCreate();
  // Defer session/query branches until after mount — next-auth + react-query
  // often disagree between SSR and the first client paint (hydration mismatch).
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const rawName = session?.user?.name?.trim() || "";
  const helloName = rawName
    ? rawName.split(/\s+/)[0]
    : session?.user?.email?.split("@")[0] || null;

  const projectsQuery = useUserProjects("", signedIn);
  const textsQuery = useUserArtifacts("TEXT", signedIn);
  const palettesQuery = useUserArtifacts("PALETTE", signedIn);
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data],
  );
  const texts = useMemo(
    () => textsQuery.data?.artifacts ?? [],
    [textsQuery.data],
  );
  const palettes = useMemo(
    () => palettesQuery.data?.artifacts ?? [],
    [palettesQuery.data],
  );

  const loadingProjects =
    signedIn && !projectsQuery.data && !projectsQuery.isError;
  const loadingTexts = signedIn && !textsQuery.data && !textsQuery.isError;
  const loadingPalettes =
    signedIn && !palettesQuery.data && !palettesQuery.isError;
  const loading = loadingProjects || loadingTexts || loadingPalettes;

  const refreshProjects = useInvalidateStudioProjects();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<RecentFilter>("all");

  useEffect(() => {
    if (isGenerationKind(generateParam)) {
      setPromptType(generateParam);
    }
  }, [generateParam]);

  useEffect(() => {
    if (!topic && !generateParam) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("topic");
    url.searchParams.delete("generate");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [topic, generateParam]);

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

  const visibleProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (q && !(p.title || "Untitled").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [projects, q]);

  const visibleTexts = useMemo(() => {
    return texts
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.title} ${a.previewText ?? ""} ${a.prompt ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [texts, q]);

  const visiblePalettes = useMemo(() => {
    return palettes
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.title} ${a.previewText ?? ""} ${a.prompt ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [palettes, q]);

  const activity = useMemo(
    () =>
      buildRecentActivity({
        projects: visibleProjects,
        texts: visibleTexts,
        palettes: visiblePalettes,
        filter,
        limit: 16,
      }),
    [visibleProjects, visibleTexts, visiblePalettes, filter],
  );

  const emptyLabel = q
    ? "Nothing found."
    : filter === "texts"
      ? "No texts yet — generate one above."
      : filter === "palettes"
        ? "No palettes yet — generate one above."
        : filter === "carousels"
          ? "No carousels yet — create one above."
          : "Nothing recent yet — create something above.";

  return (
    <StudioContent>
      <StudioContentBody className="pt-8">
        <StudioStartSection
          name={signedIn ? helloName : null}
          topic={topic}
          initialType={promptType}
          onBlank={create.openBlank}
          onTemplates={create.openTemplates}
          onBrandKit={() => router.push("/studio/brand-kit")}
          onImportJson={async (file) => {
            create.setGenerateError(null);
            create.setGenerating(true);
            try {
              const text = await file.text();
              const parsed = parseImportedTemplate(JSON.parse(text) as unknown);
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
                document: normalizeDocument(null),
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
          onSelectKind={setPromptType}
          onGenerate={create.generateFromPrompt}
          generating={create.generating}
          generateError={create.generateError}
          palettes={palettes}
          defaultHandle={
            session?.user?.name || session?.user?.email?.split("@")[0]
          }
          onTextGenerate={async (value) => {
            setPromptType("text");
            await create.generateText({ topic: value });
          }}
          onPaletteClick={() => {
            setPromptType("palette");
          }}
          onCarouselGenerate={async (form) => {
            setPromptType("carousel");
            await create.generateCarousel(form);
          }}
          onCodeInsert={async (code) => {
            await create.openWithInsert({
              insert: "codeblock",
              content: code,
            });
          }}
          onListInsert={async (items) => {
            await create.openWithInsert({
              insert: "list",
              content: items.join("\n"),
              title: "Contents",
            });
          }}
          onBrandApply={async (item) => {
            create.setGenerateError(null);
            create.setGenerating(true);
            try {
              const res = await getArtifactById(item.id);
              if (!res.success || !("artifact" in res)) {
                create.setGenerateError(
                  "error" in res ? res.error : messages.errors.generic,
                );
                return false;
              }
              const palette = parseAiPalette(res.artifact.payload);
              const current = loadBrandKit();
              writeBrandKit({
                ...current,
                palette: aiPaletteToProjectPalette(palette),
              });
              router.push("/studio/brand-kit");
            } catch (err) {
              reportError(err, messages.errors.generic);
              create.setGenerateError(
                err instanceof Error ? err.message : messages.errors.generic,
              );
              return false;
            } finally {
              create.setGenerating(false);
            }
          }}
        />

        <section className="mt-8">
          <StudioSectionHeader
            title="Recent"
            trailing={
              signedIn && filter === "carousels" ? (
                <StudioViewToggle view={view} onChange={setView} />
              ) : null
            }
          />

          {signedIn ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {RECENT_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 pr-3 text-[13px] font-medium transition-colors",
                    filter === item.id
                      ? "bg-foreground text-background"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}

          {!hasMounted ||
          authPending ||
          (signedIn &&
            loading &&
            projects.length === 0 &&
            texts.length === 0 &&
            palettes.length === 0) ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : !signedIn ? (
            <div className="max-w-md py-4">
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Sign in to keep texts, palettes, and carousels in one place.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 h-auto rounded-full px-0 text-[13px] font-medium text-foreground underline-offset-4 hover:bg-transparent hover:underline"
                onClick={() => create.setAuthNeeded(true)}
              >
                Sign in
              </Button>
            </div>
          ) : filter === "carousels" ? (
            visibleProjects.length === 0 ? (
              <p className="py-8 text-[13px] text-muted-foreground">{emptyLabel}</p>
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
            )
          ) : filter === "texts" ? (
            visibleTexts.length === 0 ? (
              <p className="py-8 text-[13px] text-muted-foreground">{emptyLabel}</p>
            ) : (
              <div className="overflow-x-auto">
                <StudioTextList
                  artifacts={visibleTexts.slice(0, 16)}
                  onOpen={(id) => router.push(`/studio/artifacts/${id}`)}
                />
              </div>
            )
          ) : filter === "palettes" ? (
            visiblePalettes.length === 0 ? (
              <p className="py-8 text-[13px] text-muted-foreground">{emptyLabel}</p>
            ) : (
              <StudioBoardGrid>
                {visiblePalettes.slice(0, 12).map((artifact) => (
                  <StudioPaletteCard
                    key={artifact.id}
                    artifact={artifact}
                    onOpen={() => router.push(`/studio/artifacts/${artifact.id}`)}
                  />
                ))}
              </StudioBoardGrid>
            )
          ) : activity.length === 0 ? (
            <p className="py-8 text-[13px] text-muted-foreground">{emptyLabel}</p>
          ) : (
            <div className="overflow-x-auto">
              <StudioRecentActivityList
                items={activity}
                onOpen={(item) => {
                  if (item.kind === "carousel") {
                    router.push(`/studio/editor?project=${item.project.id}`);
                    return;
                  }
                  router.push(`/studio/artifacts/${item.artifact.id}`);
                }}
              />
            </div>
          )}
        </section>
      </StudioContentBody>

      <AuthModal
        isOpen={create.authNeeded}
        onOpenChange={(open) => {
          if (!open) create.setAuthNeeded(false);
        }}
      />
    </StudioContent>
  );
}
