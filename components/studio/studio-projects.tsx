"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusIcon, Rows3Icon } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  deleteProject,
  duplicateProject,
  getUserProjects,
  toggleSaveProject,
  updateProjectTitle,
  type ProjectListItem,
} from "@/actions/projects";
import { AuthModal } from "@/components/auth";
import { GalleryMenu } from "@/components/canvas/sidebar/gallery-menu";
import { Button } from "@/components/ui/button";
import { stashStudioIntent } from "@/lib/studio/pending-intent";

function formatUpdated(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function StudioProjects() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [authOpen, setAuthOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, [userId, fetchProjects]);

  useEffect(() => {
    const onChanged = () => {
      if (userId) void fetchProjects();
    };
    window.addEventListener("core:projects-changed", onChanged);
    return () => window.removeEventListener("core:projects-changed", onChanged);
  }, [userId, fetchProjects]);

  const openNew = () => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const cards = useMemo(() => projects, [projects]);

  if (!userId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-8 text-center text-foreground">
        <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
          Sign in to browse and open your saved carousels.
        </p>
        <Button
          type="button"
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setAuthOpen(true)}
        >
          Sign in
        </Button>
        <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-8 pb-16 pt-16">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
        </div>

        {loading && projects.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <button
              type="button"
              onClick={openNew}
              className="group flex flex-col gap-1.5 text-left"
            >
              <div className="flex aspect-4/5 items-center justify-center rounded-2xl border border-border bg-muted shadow-none transition-colors duration-200 group-hover:bg-muted">
                <PlusIcon className="size-7 stroke-[1.25] text-muted-foreground group-hover:text-foreground" />
              </div>
              <span className="px-0.5 text-sm font-semibold">New Project</span>
            </button>

            {cards.map((project) => (
              <div key={project.id} className="group relative flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/studio/editor?project=${project.id}`)
                  }
                  className="relative aspect-4/5 overflow-hidden rounded-xl border border-border bg-muted text-left shadow-none"
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
                    <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium leading-tight text-muted-foreground">
                      {project.title || "Untitled"}
                    </span>
                  )}
                </button>
                <div className="absolute top-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>
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
                <div className="px-0.5">
                  <p className="truncate text-sm font-semibold">
                    {project.title || "Untitled"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    Updated {formatUpdated(project.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
