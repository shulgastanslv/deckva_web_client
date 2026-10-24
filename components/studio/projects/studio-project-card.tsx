"use client";

import { Star } from "lucide-react";

import type { ProjectListItem } from "@/actions/projects";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectMenu } from "@/components/studio/projects/studio-project-menu";

export function StudioProjectCard({
  project,
  onOpen,
  onChanged,
}: {
  project: ProjectListItem;
  onOpen: () => void;
  onChanged: () => void;
}) {
  return (
    <article className="group relative flex flex-col gap-2.5">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted text-left transition-colors group-hover:bg-muted/80"
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
          <span className="flex h-full items-center justify-center px-3 text-center text-[12px] text-muted-foreground/70">
            {project.title || "Untitled"}
          </span>
        )}
        {project.isSaved ? (
          <span className="absolute top-2 left-2 rounded-full bg-background/90 p-1">
            <Star className="size-3 fill-current text-foreground" />
          </span>
        ) : null}
      </button>

      <div
        className="absolute top-1.5 right-1.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <StudioProjectMenu project={project} onChanged={onChanged} />
      </div>

      <button type="button" onClick={onOpen} className="w-full px-0.5 text-left">
        <p className="truncate text-[13px] font-medium text-foreground">
          {project.title || "Untitled"}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {project.slideCount} slides · {formatBoardDate(project.updatedAt)}
        </p>
      </button>
    </article>
  );
}
