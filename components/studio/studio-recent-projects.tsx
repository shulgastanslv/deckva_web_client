"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Eye,
  FolderOpen,
  Layers,
  Loader2,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";

import {
  deleteProject,
  duplicateProject,
  getUserProjects,
  toggleSaveProject,
  updateProjectTitle,
  type ProjectListItem,
} from "@/actions/projects";
import { GalleryMenu } from "@/components/canvas/sidebar/gallery-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { cn } from "@/lib/utils";

type SourceTab = "projects" | "starred";
type Category =
  | "for-you"
  | "4:5"
  | "1:1"
  | "9:16"
  | "16:9"
  | "name";

const PREVIEW_LIMIT = 10;

const SOURCE_TABS: {
  id: SourceTab;
  label: string;
  icon: typeof FolderOpen;
}[] = [
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "starred", label: "Starred", icon: Star },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "4:5", label: "Feed 4:5" },
  { id: "1:1", label: "Square" },
  { id: "9:16", label: "Stories" },
  { id: "16:9", label: "Landscape" },
  { id: "name", label: "A–Z" },
];

function formatUpdated(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function ratioAspectClass(ratio: string) {
  if (ratio === "1:1") return "aspect-square";
  if (ratio === "9:16") return "aspect-9/16";
  if (ratio === "16:9") return "aspect-video";
  return "aspect-4/5";
}

function projectBlurb(project: ProjectListItem) {
  const slides = project.slideCount;
  const slideLabel = `${slides} slide${slides === 1 ? "" : "s"}`;
  return `${slideLabel} · ${project.aspectRatio} · Updated ${formatUpdated(project.updatedAt)}`;
}

export function StudioRecentProjects({ userId }: { userId?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<SourceTab>("projects");
  const [category, setCategory] = useState<Category>("for-you");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

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
    return () => window.removeEventListener("core:projects-changed", onChanged);
  }, [userId, fetchProjects]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (source === "starred" && !p.isSaved) return false;
      if (
        category !== "for-you" &&
        category !== "name" &&
        p.aspectRatio !== category
      ) {
        return false;
      }
      if (q && !(p.title || "Untitled").toLowerCase().includes(q)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (category === "name") {
        return (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        });
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    return list;
  }, [projects, source, category, search]);

  const filtering =
    search.trim().length > 0 ||
    source !== "projects" ||
    category !== "for-you";
  const preview =
    showAll || filtering ? visible : visible.slice(0, PREVIEW_LIMIT);
  const hasMore = !filtering && !showAll && visible.length > PREVIEW_LIMIT;

  const openNew = () => {
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  if (!userId) return null;

  return (
    <section className="w-full">
      {/* Pill source tabs — reference row 1 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {SOURCE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = source === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSource(tab.id);
                setShowAll(false);
              }}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  active && tab.id === "starred" && "fill-current",
                )}
              />
              {tab.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={openNew}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="New project"
        >
          <Plus className="size-4" />
        </button>

        <div className="ml-auto mt-4 flex shrink-0 items-center gap-1">
          {searchOpen ? (
            <div className="relative w-[200px] sm:w-[240px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-9 rounded-full border-border bg-muted/40 pr-8 pl-9"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
                aria-label="Close search"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="Search projects"
            >
              <Search className="size-4" />
            </button>
          )}
          <Button
            asChild
            variant="ghost"
            className="h-9 rounded-full px-3 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <Link href="/studio/projects">See all</Link>
          </Button>
        </div>
      </div>

      {/* Underline categories — reference row 2 */}
      <div className="mt-3 flex items-center gap-5 overflow-x-auto border-b border-border/50">
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setShowAll(false);
              }}
              className={cn(
                "relative shrink-0 pb-2.5 text-[13px] transition-colors",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {cat.label}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
              ) : null}
            </button>
          );
        })}
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
          <p className="text-[13px] font-medium text-foreground">
            No projects yet
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Generate a carousel above — it will show up here.
          </p>
        </div>
      ) : preview.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
          <p className="text-[13px] text-muted-foreground">
            Nothing matches these filters.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 h-8 rounded-full text-[13px]"
            onClick={() => {
              setSearch("");
              setSource("projects");
              setCategory("for-you");
              setSearchOpen(false);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {preview.map((project) => {
              const author =
                project.authorName ||
                session?.user?.name ||
                session?.user?.email ||
                "You";
              const letter = (author[0] || "U").toUpperCase();
              const avatarSrc =
                session?.user?.image ||
                (userId
                  ? `https://api.dicebear.com/10.x/squircles/svg?seed=${userId}`
                  : undefined);

              return (
                <article
                  key={project.id}
                  className="group relative flex flex-col gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/studio/editor?project=${project.id}`)
                    }
                    className={cn(
                      "relative w-full overflow-hidden rounded-xl bg-muted text-left ring-1 ring-border/60 transition-[ring-color] hover:ring-foreground/20",
                      ratioAspectClass(project.aspectRatio),
                    )}
                  >
                    {project.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.previewUrl}
                        alt=""
                        className="size-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-3 text-center text-[11px] font-medium leading-tight text-muted-foreground">
                        {project.title || "Untitled"}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 inline-flex size-6 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur-sm">
                      <Layers className="size-3.5" />
                    </span>
                  </button>

                  <div
                    className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GalleryMenu
                      title={project.title}
                      createdAt={project.createdAt}
                      createdBy={project.authorName}
                      ratio={project.aspectRatio}
                      onRename={async (title) => {
                        setProjects((prev) =>
                          prev.map((p) =>
                            p.id === project.id ? { ...p, title } : p,
                          ),
                        );
                        const res = await updateProjectTitle(project.id, title);
                        if (!res.success) void fetchProjects();
                      }}
                      onDuplicate={async () => {
                        const res = await duplicateProject(project.id);
                        if (res.success) void fetchProjects();
                      }}
                      onDelete={async () => {
                        setProjects((prev) =>
                          prev.filter((p) => p.id !== project.id),
                        );
                        const res = await deleteProject(project.id);
                        if (!res.success) void fetchProjects();
                      }}
                      starred={project.isSaved}
                      onStar={async () => {
                        setProjects((prev) =>
                          prev.map((p) =>
                            p.id === project.id
                              ? { ...p, isSaved: !p.isSaved }
                              : p,
                          ),
                        );
                        const res = await toggleSaveProject(project.id);
                        if (!res.success) void fetchProjects();
                      }}
                    />
                  </div>

                  <div className="min-w-0 px-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/studio/editor?project=${project.id}`)
                      }
                      className="w-full text-left"
                    >
                      <h3 className="truncate text-[14px] font-semibold tracking-tight text-foreground">
                        {project.title || "Untitled"}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                        {projectBlurb(project)}
                      </p>
                    </button>

                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={avatarSrc} alt="" />
                        <AvatarFallback className="bg-muted text-[9px] font-semibold">
                          {letter}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground/90">
                        {author}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-2.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3" />
                          {project.slideCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Bookmark
                            className={cn(
                              "size-3",
                              project.isSaved && "fill-current text-foreground",
                            )}
                          />
                          {project.isSaved ? 1 : 0}
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full px-4 text-[13px]"
                onClick={() => setShowAll(true)}
              >
                Show more ({visible.length - PREVIEW_LIMIT})
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
