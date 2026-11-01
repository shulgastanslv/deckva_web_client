"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  useInvalidateStudioProjects,
  useUserFolders,
  useUserProjects,
} from "@/lib/studio/queries";
import { AuthModal } from "@/components/auth";
import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import { StudioBoardGrid } from "@/components/studio/projects/studio-board-grid";
import { StudioProjectCard } from "@/components/studio/projects/studio-project-card";
import { StudioProjectList } from "@/components/studio/projects/studio-project-list";
import { StudioCreateTile } from "@/components/studio/start/studio-start-tile";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioPageHeader } from "@/components/studio/ui/studio-page-header";
import { StudioTab } from "@/components/studio/ui/studio-tab";
import { StudioViewToggle } from "@/components/studio/ui/studio-view-toggle";

export function StudioProjects() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const signedIn = status === "authenticated" && Boolean(userId);
  const create = useStudioCreate();

  const folderId = searchParams.get("folder");
  const projectsQuery = useUserProjects(folderId ?? "", signedIn);
  const foldersQuery = useUserFolders(signedIn);
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data],
  );
  const folders = useMemo(
    () => foldersQuery.data?.folders ?? [],
    [foldersQuery.data],
  );
  const loading = signedIn && !projectsQuery.data && !projectsQuery.isError;
  const refreshProjects = useInvalidateStudioProjects();
  const [filter, setFilter] = useState<"all" | "starred">(
    searchParams.get("filter") === "starred" ? "starred" : "all",
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    setFilter(searchParams.get("filter") === "starred" ? "starred" : "all");
  }, [searchParams]);

  useEffect(() => {
    const onSidebarSearch = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof query === "string") setSearch(query);
    };
    window.addEventListener("studio:sidebar-search", onSidebarSearch);
    return () =>
      window.removeEventListener("studio:sidebar-search", onSidebarSearch);
  }, []);

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === folderId) ?? null,
    [folders, folderId],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (filter === "starred" && !p.isSaved) return false;
        if (q && !(p.title || "Untitled").toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [projects, filter, search]);

  const setFilterAndUrl = (next: "all" | "starred") => {
    setFilter(next);
    const params = new URLSearchParams();
    if (next === "starred") params.set("filter", "starred");
    if (folderId) params.set("folder", folderId);
    const qs = params.toString();
    router.replace(qs ? `/studio/projects?${qs}` : "/studio/projects");
  };

  const pageTitle = activeFolder
    ? activeFolder.name
    : filter === "starred"
      ? "Starred"
      : "Projects";

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        <StudioPageHeader
          title={pageTitle}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search projects"
          actions={
            <div className="flex items-center gap-2.5">
              <StudioViewToggle view={view} onChange={setView} />
              <StudioCreateMenu
                onBlank={create.openBlank}
                onTemplates={create.openTemplates}
              />
            </div>
          }
          tabs={
            !folderId ? (
              <>
                <StudioTab
                  active={filter === "all"}
                  onClick={() => setFilterAndUrl("all")}
                >
                  All
                </StudioTab>
                <StudioTab
                  active={filter === "starred"}
                  onClick={() => setFilterAndUrl("starred")}
                >
                  Starred
                </StudioTab>
              </>
            ) : undefined
          }
        />

        {!signedIn ? (
          <div className="max-w-sm py-8">
            <p
              className="text-[22px] text-neutral-950 dark:text-foreground"
              style={{
                fontFamily:
                  "var(--font-studio-serif), ui-serif, Georgia, serif",
              }}
            >
              Sign in to see projects
            </p>
            <p className="mt-2 text-[14px] text-neutral-500 dark:text-muted-foreground">
              Your carousels will show up here.
            </p>
            <button
              type="button"
              className="mt-4 text-[13px] font-medium text-neutral-950 underline-offset-4 hover:underline dark:text-foreground"
              onClick={() => create.setAuthNeeded(true)}
            >
              Sign in
            </button>
          </div>
        ) : loading && projects.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : view === "list" ? (
          visible.length === 0 ? null : (
            <div className="overflow-x-auto">
              <StudioProjectList
                projects={visible}
                onOpen={(id) =>
                  router.push(`/studio/editor?project=${id}`)
                }
                onChanged={refreshProjects}
              />
            </div>
          )
        ) : (
          <StudioBoardGrid>
            {filter === "all" && !search.trim() && !folderId ? (
              <StudioCreateTile onClick={create.openBlank} />
            ) : null}
            {visible.map((project) => (
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

        {signedIn && !loading && visible.length === 0 ? (
          <div className="py-16 text-center">
            <p
              className="text-[22px] text-neutral-950 dark:text-foreground"
            >
              {search.trim()
                ? "Nothing found"
                : folderId
                  ? "Folder is empty"
                  : filter === "starred"
                    ? "No starred carousels"
                    : "No projects yet"}
            </p>
            <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">
              {search.trim()
                ? "Try another search."
                : "Create a blank carousel or start from a template."}
            </p>
          </div>
        ) : null}
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
