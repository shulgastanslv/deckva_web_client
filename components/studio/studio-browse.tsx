"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  Search,
} from "lucide-react";

import {
  listCommunityProjects,
  type CommunityProjectListItem,
} from "@/actions/community";
import {
  COMMUNITY_SORT_OPTIONS,
  type CommunitySortId,
} from "@/lib/community/categories";
import {
  useInvalidateStudioProjects,
  useUserFolders,
  useUserProjects,
} from "@/lib/studio/queries";
import { CommunityPreviewDialog } from "@/components/studio/dialogs/community-preview-dialog";
import { CommunityCategoryDropdown } from "@/components/studio/browse/community-category-dropdown";
import { CommunityMasonry } from "@/components/studio/browse/community-masonry";
import { CommunityRows } from "@/components/studio/browse/community-rows";
import { StudioBoardGrid } from "@/components/studio/browse/studio-board-grid";
import { StudioProjectCard } from "@/components/studio/browse/studio-project-card";
import { StudioProjectList } from "@/components/studio/browse/studio-project-list";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { AuthModal } from "@/components/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MainTab = "all" | "starred" | "community";

export function StudioBrowse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const signedIn = status !== "unauthenticated";

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<MainTab>(
    tabParam === "starred" || tabParam === "community" || tabParam === "templates"
      ? tabParam === "templates"
        ? "community"
        : (tabParam as MainTab)
      : "all",
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [communityView, setCommunityView] = useState<"cards" | "rows">("cards");
  const [sort, setSort] = useState("last-opened");
  const [communitySort, setCommunitySort] =
    useState<CommunitySortId>("newest");
  const [communityCategory, setCommunityCategory] = useState<string>("all");

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
  const loadingProjects =
    signedIn && !projectsQuery.data && !projectsQuery.isError;
  const refreshProjects = useInvalidateStudioProjects();
  const showProjects = activeTab === "all" || activeTab === "starred";

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === folderId) ?? null,
    [folders, folderId],
  );

  const visibleProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (activeTab === "starred" && !p.isSaved) return false;
        if (q && !(p.title || "Untitled").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [projects, activeTab, search]);

  const [community, setCommunity] = useState<CommunityProjectListItem[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const fetchCommunity = useCallback(async () => {
    setLoadingCommunity(true);
    try {
      const listRes = await listCommunityProjects({
        search: search.trim() || undefined,
        category: communityCategory,
        sort: communitySort,
      });
      setCommunity(listRes.success ? listRes.projects : []);
    } finally {
      setLoadingCommunity(false);
    }
  }, [search, communityCategory, communitySort]);

  useEffect(() => {
    if (activeTab !== "community") return;
    const t = window.setTimeout(() => void fetchCommunity(), search ? 220 : 0);
    return () => window.clearTimeout(t);
  }, [fetchCommunity, search, activeTab]);

  useEffect(() => {
    const onChanged = () => {
      if (activeTab === "community") void fetchCommunity();
    };
    window.addEventListener("core:community-changed", onChanged);
    return () => window.removeEventListener("core:community-changed", onChanged);
  }, [activeTab, fetchCommunity]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    setActiveTab(
      urlTab === "starred"
        ? "starred"
        : urlTab === "community" || urlTab === "templates"
          ? "community"
          : "all",
    );
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

  const pageTitle = activeFolder
    ? activeFolder.name
    : activeTab === "starred"
      ? "Starred"
      : activeTab === "community"
        ? "Community"
        : "Projects";

  const pageDescription = activeFolder
    ? "Manage projects in this folder."
    : activeTab === "starred"
      ? "Quick access to starred projects."
      : activeTab === "community"
        ? "Browse and remix carousels from creators."
        : "All your generated carousels.";

  const communitySortLabel =
    COMMUNITY_SORT_OPTIONS.find((o) => o.id === communitySort)?.label ?? "Sort";

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        <div className="mb-6">
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            {pageDescription}
          </p>
        </div>

        <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <div className="relative w-full sm:w-64 sm:flex-none">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "community"
                  ? "Search community"
                  : "Search projects"
              }
              className="h-9 w-full rounded-full border-none bg-muted/40 pr-4 pl-9 text-[13px] shadow-none placeholder:text-muted-foreground/70 focus:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {activeTab === "community" ? (
              <>
                <CommunityCategoryDropdown
                  value={communityCategory}
                  onChange={setCommunityCategory}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 rounded-full border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60"
                    >
                      {communitySortLabel}{" "}
                      <ChevronDown className="ml-1 size-3.5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-2xl p-1.5"
                  >
                    {COMMUNITY_SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setCommunitySort(option.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-xl text-[13px] focus:bg-muted/50"
                      >
                        <div className="flex w-4 items-center justify-center">
                          {communitySort === option.id ? (
                            <Check className="size-4" />
                          ) : null}
                        </div>
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex h-9 items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCommunityView("cards")}
                    aria-label="Cards view"
                    className={cn(
                      "size-8 rounded-full shadow-none",
                      communityView === "cards"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCommunityView("rows")}
                    aria-label="Rows view"
                    className={cn(
                      "size-8 rounded-full shadow-none",
                      communityView === "rows"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </>
            ) : null}

            {showProjects ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 rounded-full border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60 data-[state=open]:bg-muted/60"
                    >
                      Sort <ChevronDown className="ml-1 size-3.5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-2xl p-1.5"
                  >
                    {[
                      { id: "last-opened", label: "Last opened" },
                      { id: "last-modified", label: "Last modified" },
                      { id: "alphabetical", label: "Alphabetically" },
                      { id: "last-created", label: "Last created" },
                    ].map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setSort(option.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-xl text-[13px] focus:bg-muted/50"
                      >
                        <div className="flex w-4 items-center justify-center">
                          {sort === option.id ? <Check className="size-4" /> : null}
                        </div>
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex h-9 items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("grid")}
                    className={cn(
                      "size-8 rounded-full border-none shadow-none",
                      view === "grid"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("list")}
                    className={cn(
                      "size-8 rounded-full border-none shadow-none",
                      view === "list"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {activeTab === "community" ? (
          loadingCommunity && community.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : community.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[22px] text-foreground">
                {search.trim() || communityCategory !== "all"
                  ? "Nothing matches"
                  : "Nothing in community yet"}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Publish a carousel from the editor to share it here.
              </p>
            </div>
          ) : communityView === "rows" ? (
            <CommunityRows
              items={community}
              onOpen={(id) => setPreviewId(id)}
            />
          ) : (
            <CommunityMasonry
              items={community}
              onOpen={(id) => setPreviewId(id)}
            />
          )
        ) : loadingProjects && projects.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : view === "list" ? (
          visibleProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <StudioProjectList
                projects={visibleProjects}
                onOpen={(id) => router.push(`/studio/editor?project=${id}`)}
                onChanged={refreshProjects}
              />
            </div>
          ) : null
        ) : (
          <StudioBoardGrid>
            {visibleProjects.map((project) => (
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

        {signedIn &&
        !loadingProjects &&
        showProjects &&
        visibleProjects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[22px] text-foreground">
              {search.trim()
                ? "Nothing found"
                : folderId
                  ? "Folder is empty"
                  : activeTab === "starred"
                    ? "No starred projects"
                    : "No projects yet"}
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {search.trim()
                ? "Try another search."
                : "Generate a carousel from the home prompt."}
            </p>
          </div>
        ) : null}

        <CommunityPreviewDialog
          projectId={previewId}
          open={Boolean(previewId)}
          onOpenChange={(next) => {
            if (!next) setPreviewId(null);
          }}
          onAuthRequired={() => setAuthOpen(true)}
        />
        <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
      </StudioContentBody>
    </StudioContent>
  );
}
