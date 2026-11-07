"use client";

import type { ProjectListItem } from "@/actions/projects";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectMenu } from "@/components/studio/browse/studio-project-menu";
import { StudioProjectOwner } from "@/components/studio/browse/studio-project-owner";
import { StudioProjectThumb } from "@/components/studio/browse/studio-project-thumb";
import { StudioBadge } from "@/components/studio/ui/studio-badge";
import { cn } from "@/lib/utils";

export const recentCols =
  "grid-cols-[minmax(0,1fr)_auto_36px] md:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_40px]";

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
        "group grid items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-muted/40 cursor-pointer select-none",
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
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] text-neutral-500 dark:text-muted-foreground">
            <StudioProjectOwner
              name={project.authorName}
              image={project.authorImage}
              showName={false}
            />
            <span className="truncate">
              Modified by {project.authorName || "you"}
            </span>
          </span>
        </span>
      </button>
      <p className="hidden truncate text-[13px] text-neutral-500 md:block dark:text-muted-foreground">
        {project.slideCount} slides
      </p>
      <p className="hidden truncate text-[13px] text-neutral-500 md:block dark:text-muted-foreground">
        {project.aspectRatio}
      </p>
      <p className="truncate text-[13px] text-neutral-500 dark:text-muted-foreground">
        {formatBoardDate(project.updatedAt)}
      </p>
      <div className="hidden min-w-0 md:block">
        <StudioProjectOwner
          name={project.authorName}
          image={project.authorImage}
        />
      </div>
      <div
        className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <StudioProjectMenu project={project} onChanged={onChanged} />
      </div>
    </div>
  );
}
