"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  getUserProjects,
  type ProjectListItem,
} from "@/actions/projects";
import {
  getTemplates,
  type TemplateListItem,
} from "@/actions/templates";
import { AuthModal } from "@/components/auth";
import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioGenerateDialog } from "@/components/studio/create/studio-generate-dialog";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioBoardGrid } from "@/components/studio/projects/studio-board-grid";
import { StudioProjectCard } from "@/components/studio/projects/studio-project-card";
import { StudioProjectList } from "@/components/studio/projects/studio-project-list";
import { StudioGeneratePrompt } from "@/components/studio/start/studio-generate-prompt";
import { StudioGreeting } from "@/components/studio/start/studio-greeting";
import { StudioStartRow } from "@/components/studio/start/studio-start-row";
import {
  StudioCreateTile,
  StudioStartTile,
} from "@/components/studio/start/studio-start-tile";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioSectionHeader } from "@/components/studio/ui/studio-section-header";
import { StudioViewToggle } from "@/components/studio/ui/studio-view-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "list" | "grid";

export function StudioHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const signedIn = status === "authenticated" && Boolean(userId);
  const create = useStudioCreate();

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [templateCategory, setTemplateCategory] = useState<string>("all");

  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserProjects();
      if (res.success) setProjects(res.projects);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) void fetchProjects();
    else {
      setProjects([]);
      setLoading(false);
    }
  }, [userId, fetchProjects]);

  useEffect(() => {
    const onChanged = () => {
      if (userId) void fetchProjects();
    };
    window.addEventListener("core:projects-changed", onChanged);
    window.addEventListener("studio:org-changed", onChanged);
    return () => {
      window.removeEventListener("core:projects-changed", onChanged);
      window.removeEventListener("studio:org-changed", onChanged);
    };
  }, [userId, fetchProjects]);

  useEffect(() => {
    const onSidebarSearch = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof query === "string") setSearch(query);
    };
    window.addEventListener("studio:sidebar-search", onSidebarSearch);
    return () =>
      window.removeEventListener("studio:sidebar-search", onSidebarSearch);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getTemplates();
      if (cancelled) return;
      if (res.success) setTemplates(res.templates);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(templates.map((t) => t.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [templates]);

  const startTemplates = useMemo(() => {
    const filtered =
      templateCategory === "all"
        ? templates
        : templates.filter((t) => t.category === templateCategory);
    return filtered.slice(0, 8);
  }, [templates, templateCategory]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (q && !(p.title || "Untitled").toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [projects, search]);

  const openTemplate = (id: string) => {
    if (status !== "authenticated") {
      create.setAuthNeeded(true);
      return;
    }
    router.push(`/studio/editor?template=${id}`);
  };

  const categoryLabel =
    templateCategory === "all"
      ? "Carousel templates"
      : `Templates for ${templateCategory}`;

  return (
    <StudioContent>
      <StudioContentBody className="pt-4 sm:pt-6">
        <div className="mb-8">
          <StudioGreeting name={session?.user?.name || session?.user?.email} />
        </div>


          

        <section>
          <StudioSectionHeader
            title="Jump back to recents"
            trailing={
              signedIn ? (
                <StudioViewToggle view={view} onChange={setView} />
              ) : null
            }
          />

          {!signedIn ? (
            <div className="max-w-md py-6">
              <p className="text-[14px] leading-relaxed text-neutral-500 dark:text-muted-foreground">
                Sign in to keep your carousels and jump back into drafts.
              </p>
              <button
                type="button"
                className="mt-3 text-[13px] font-medium text-neutral-950 underline-offset-4 hover:underline dark:text-foreground"
                onClick={() => create.setAuthNeeded(true)}
              >
                Sign in
              </button>
            </div>
          ) : loading && projects.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-4 animate-spin text-neutral-400" />
            </div>
          ) : visible.length === 0 ? (
            <p className="py-8 text-[13px] text-neutral-500 dark:text-muted-foreground">
              {search.trim()
                ? "Nothing found."
                : "No carousels yet — create one above."}
            </p>
          ) : view === "list" ? (
            <div className="overflow-x-auto">
              <StudioProjectList
                projects={visible.slice(0, 12)}
                onOpen={(id) =>
                  router.push(`/studio/editor?project=${id}`)
                }
                onChanged={fetchProjects}
              />
            </div>
          ) : (
            <StudioBoardGrid>
              {visible.slice(0, 12).map((project) => (
                <StudioProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() =>
                    router.push(`/studio/editor?project=${project.id}`)
                  }
                  onChanged={fetchProjects}
                />
              ))}
            </StudioBoardGrid>
          )}
        </section>
      </StudioContentBody>

      <StudioGenerateDialog
        open={create.generateOpen}
        onOpenChange={(open) => {
          if (!open) create.closeGenerate();
          else create.setGenerateOpen(true);
        }}
        theme={create.theme}
        onThemeChange={create.setTheme}
        submitting={create.submitting}
        onSubmit={create.submitGenerate}
      />

      <AuthModal
        isOpen={create.authNeeded}
        onOpenChange={(open) => {
          if (!open) create.setAuthNeeded(false);
        }}
      />
    </StudioContent>
  );
}
