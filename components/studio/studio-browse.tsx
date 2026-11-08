"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ScrollContainer from "react-indiana-drag-scroll";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Search,
} from "lucide-react";

import {
  useInvalidateStudioProjects,
  useUserArtifacts,
  useUserFolders,
  useUserProjects,
} from "@/lib/studio/queries";
import { StudioBoardGrid } from "@/components/studio/browse/studio-board-grid";
import { StudioProjectCard } from "@/components/studio/browse/studio-project-card";
import { StudioProjectList } from "@/components/studio/browse/studio-project-list";
import { StudioPaletteCard } from "@/components/studio/browse/studio-palette-card";
import { StudioTextList } from "@/components/studio/browse/studio-text-row";
import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
// --- Template Imports ---
import { getTemplates, type TemplateListItem } from "@/actions/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/categories";
import { CategoryDropdown } from "./studio-category-dropdown";

// --- Shared UI Imports ---
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MainTab = "all" | "texts" | "palettes" | "carousels" | "starred" | "templates";

export function StudioBrowse() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const signedIn = status !== "unauthenticated";

  // --- Shared State ---
  const [activeTab, setActiveTab] = useState<MainTab>(
    (searchParams.get("tab") as MainTab) || "all"
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sort, setSort] = useState("last-opened");

  // --- Project State & Data ---
  const folderId = searchParams.get("folder");
  const projectsQuery = useUserProjects(folderId ?? "", signedIn);
  const textsQuery = useUserArtifacts("TEXT", signedIn && activeTab === "texts", folderId ?? "");
  const palettesQuery = useUserArtifacts(
    "PALETTE",
    signedIn && activeTab === "palettes",
    folderId ?? "",
  );
  const foldersQuery = useUserFolders(signedIn);
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data]
  );
  const texts = useMemo(
    () => textsQuery.data?.artifacts ?? [],
    [textsQuery.data]
  );
  const palettes = useMemo(
    () => palettesQuery.data?.artifacts ?? [],
    [palettesQuery.data]
  );
  const folders = useMemo(
    () => foldersQuery.data?.folders ?? [],
    [foldersQuery.data]
  );
  const loadingProjects = signedIn && !projectsQuery.data && !projectsQuery.isError;
  const loadingTexts = signedIn && activeTab === "texts" && !textsQuery.data && !textsQuery.isError;
  const loadingPalettes =
    signedIn && activeTab === "palettes" && !palettesQuery.data && !palettesQuery.isError;
  const refreshProjects = useInvalidateStudioProjects();
  const showProjects =
    activeTab === "all" || activeTab === "carousels" || activeTab === "starred";

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === folderId) ?? null,
    [folders, folderId]
  );

  const visibleProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (activeTab === "starred" && !p.isSaved) return false;
        if (q && !(p.title || "Untitled").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [projects, activeTab, search]);

  const visibleTexts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return texts
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.title} ${a.previewText ?? ""} ${a.prompt ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [texts, search]);

  const visiblePalettes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return palettes
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.title} ${a.previewText ?? ""} ${a.prompt ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [palettes, search]);

  // --- Template State & Data ---
  const [templateCategory, setTemplateCategory] = useState("all");
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const allCategories = ["all", ...TEMPLATE_CATEGORIES];

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const listRes = await getTemplates({
        category: templateCategory === "all" ? undefined : templateCategory,
        search: search.trim() || undefined,
      });
      setTemplates(listRes.success ? listRes.templates : []);
    } finally {
      setLoadingTemplates(false);
    }
  }, [templateCategory, search]);

  useEffect(() => {
    if (activeTab !== "templates") return;
    const t = window.setTimeout(() => void fetchTemplates(), search ? 220 : 0);
    return () => window.clearTimeout(t);
  }, [fetchTemplates, search, activeTab]);

  const openTemplate = (id: string) => {
    setOpeningId(id);
    router.push(`/studio/editor?template=${id}`);
  };

  // --- Global Event Listeners & URL Sync ---
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    setActiveTab((urlTab as MainTab) || "all");
  }, [searchParams]);

  useEffect(() => {
    const onSidebarSearch = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof query === "string") setSearch(query);
    };
    window.addEventListener("studio:sidebar-search", onSidebarSearch);
    return () => window.removeEventListener("studio:sidebar-search", onSidebarSearch);
  }, []);

  const setTabAndUrl = (next: MainTab) => {
    setActiveTab(next);
    const params = new URLSearchParams();
    if (next !== "all") params.set("tab", next);
    if (folderId) params.set("folder", folderId);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // --- Scroll Logic for Template Categories ---
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "templates") {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [checkScroll, activeTab, templateCategory]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const pageTitle = activeFolder
    ? activeFolder.name
    : activeTab === "texts"
      ? "Texts"
      : activeTab === "palettes"
        ? "Palettes"
        : activeTab === "starred"
          ? "Starred"
          : activeTab === "templates"
            ? "Templates"
            : "Carousels";

  const pageDescription = activeFolder
    ? "Manage projects in this folder."
    : activeTab === "texts"
      ? "Generated post captions and copy ready to turn into carousels."
      : activeTab === "palettes"
        ? "Color systems generated for carousels and your brand kit."
        : activeTab === "starred"
          ? "Quick access to your most important and frequently used projects."
          : activeTab === "templates"
            ? "Start quickly with our beautifully designed, customizable templates."
            : "Create, manage, and organize all your carousels in one place.";

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        <div className="flex flex-col-reverse md:flex-row items-start gap-8">
          <div className="flex-1 min-w-0 w-full">

            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                {pageTitle}
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {pageDescription}
              </p>
            </div>

            <div className="mb-6 flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">

              <div className="relative w-full sm:w-64 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${
                    activeTab === "templates"
                      ? "templates"
                      : activeTab === "texts"
                        ? "texts"
                        : activeTab === "palettes"
                          ? "palettes"
                          : "carousels"
                  }`}
                  className="h-9 w-full rounded-full border-none bg-muted/40 pl-9 pr-4 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-1"
                />
              </div>

              {activeTab === "templates" && (
                <CategoryDropdown selectedCategory={templateCategory} onSelectCategory={setTemplateCategory} />
              )}

              <div className="ml-auto flex items-center gap-2 sm:gap-3">

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 rounded-full border-none bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60 data-[state=open]:bg-muted">
                      Sort <ChevronDown className="ml-1 size-3.5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    {[
                      { id: "last-opened", label: "Last opened" },
                      { id: "last-modified", label: "Last modified" },
                      { id: "alphabetical", label: "Alphabetically" },
                      { id: "last-created", label: "Last created" },
                    ].map((option) => (
                      <DropdownMenuItem key={option.id} onClick={() => setSort(option.id)} className="flex items-center gap-2 rounded-lg text-[13px]">
                        <div className="flex w-4 items-center justify-center">
                          {sort === option.id && <Check className="size-4" />}
                        </div>
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex h-9 items-center gap-0.5 rounded-lg bg-muted/40 p-0.5 shadow-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("grid")}
                    className={cn("h-8 w-8 rounded-md shadow-none", view === "grid" ? "bg-background text-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground")}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("list")}
                    className={cn("h-8 w-8 rounded-md shadow-none", view === "list" ? "bg-background text-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground")}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {activeTab === "texts" ? (
              loadingTexts && texts.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : visibleTexts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[22px] text-neutral-950 dark:text-foreground">
                    {search.trim() ? "Nothing found" : "No texts yet"}
                  </p>
                  <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">
                    {search.trim()
                      ? "Try another search."
                      : "Generate a post caption from the studio home prompt."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <StudioTextList
                    artifacts={visibleTexts}
                    onOpen={(id) => router.push(`/studio/artifacts/${id}`)}
                  />
                </div>
              )
            ) : activeTab === "palettes" ? (
              loadingPalettes && palettes.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : visiblePalettes.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[22px] text-neutral-950 dark:text-foreground">
                    {search.trim() ? "Nothing found" : "No palettes yet"}
                  </p>
                  <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">
                    {search.trim()
                      ? "Try another search."
                      : "Generate a palette from the studio home prompt."}
                  </p>
                </div>
              ) : (
                <StudioBoardGrid>
                  {visiblePalettes.map((artifact) => (
                    <StudioPaletteCard
                      key={artifact.id}
                      artifact={artifact}
                      onOpen={() => router.push(`/studio/artifacts/${artifact.id}`)}
                    />
                  ))}
                </StudioBoardGrid>
              )
            ) : activeTab === "templates" ? (
              loadingTemplates && templates.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[22px] text-neutral-950 dark:text-foreground">No templates found</p>
                  <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">Try another category or search query.</p>
                </div>
              ) : (
                <StudioBoardGrid>
                  {templates.map((tpl) => (
                    <button key={tpl.id} type="button" disabled={openingId === tpl.id} onClick={() => openTemplate(tpl.id)} className="group flex flex-col gap-2.5 text-left disabled:opacity-50 cursor-pointer">
                      <div className="relative aspect-4/5 overflow-hidden rounded-xl border-none bg-muted/40 shadow-none transition-colors group-hover:bg-muted/60">
                        {tpl.previewUrl ? (
                          <img src={tpl.previewUrl} alt="" className="size-full object-cover" draggable={false} />
                        ) : (
                          <span className="flex h-full items-center justify-center px-3 text-center text-[12px] text-muted-foreground/70">{tpl.title}</span>
                        )}
                        {openingId === tpl.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <Loader2 className="size-3.5 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="px-0.5">
                        <p className="truncate text-[13px] font-medium text-foreground">{tpl.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {tpl.slideCount} slides{tpl.badge ? ` · ${tpl.badge}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </StudioBoardGrid>
              )
            ) : (
              loadingProjects && projects.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : view === "list" ? (
                visibleProjects.length > 0 && (
                  <div className="overflow-x-auto">
                    <StudioProjectList projects={visibleProjects} onOpen={(id) => router.push(`/studio/editor?project=${id}`)} onChanged={refreshProjects} />
                  </div>
                )
              ) : (
                <StudioBoardGrid>
                  {visibleProjects.map((project) => (
                    <StudioProjectCard key={project.id} project={project} onOpen={() => router.push(`/studio/editor?project=${project.id}`)} onChanged={refreshProjects} />
                  ))}
                </StudioBoardGrid>
              )
            )}

            {signedIn &&
            !loadingProjects &&
            showProjects &&
            visibleProjects.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[22px] text-neutral-950 dark:text-foreground">
                  {search.trim()
                    ? "Nothing found"
                    : folderId
                      ? "Folder is empty"
                      : activeTab === "starred"
                        ? "No starred carousels"
                        : "No carousels yet"}
                </p>
                <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">
                  {search.trim()
                    ? "Try another search."
                    : "Create a blank carousel or start from a template."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </StudioContentBody>

    </StudioContent>
  );
}