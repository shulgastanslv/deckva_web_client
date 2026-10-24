"use client";

import type { ProjectListItem } from "@/actions/projects";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectMenu } from "@/components/studio/projects/studio-project-menu";
import { StudioProjectThumb } from "@/components/studio/projects/studio-project-thumb";
import { StudioBadge } from "@/components/studio/ui/studio-badge";
import { cn } from "@/lib/utils";

export const recentCols =
  "grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_40px]";

export function StudioProjectRow({
  project,
  onOpen,
  onChanged,
}: {
  project: ProjectListItem;
  onOpen: () => void;
  onChanged: () => void;
}) {
  return (
    <div
      className={cn(
        "group grid items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-muted/40",
        recentCols,
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <StudioProjectThumb project={project} />
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[14px] font-semibold text-neutral-950 dark:text-foreground">
              {project.title || "Untitled"}
            </span>
            {project.isSaved ? <StudioBadge>Starred</StudioBadge> : null}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-neutral-500 dark:text-muted-foreground">
            Modified by {project.authorName || "you"}
          </span>
        </span>
      </button>
      <p className="truncate text-[13px] text-neutral-500 dark:text-muted-foreground">
        {project.slideCount} slides
      </p>
      <p className="truncate text-[13px] text-neutral-500 dark:text-muted-foreground">
        {project.aspectRatio}
      </p>
      <p className="truncate text-[13px] text-neutral-500 dark:text-muted-foreground">
        {formatBoardDate(project.updatedAt)}
      </p>
      <p className="truncate text-[13px] text-neutral-500 dark:text-muted-foreground">
        {project.authorName || "You"}
      </p>
      <div
        className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <StudioProjectMenu project={project} onChanged={onChanged} />
      </div>
    </div>
  );
}
