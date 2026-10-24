"use client";

import type { ProjectListItem } from "@/actions/projects";
import {
  recentCols,
  StudioProjectRow,
} from "@/components/studio/projects/studio-project-row";
import { cn } from "@/lib/utils";

export function StudioProjectList({
  projects,
  onOpen,
  onChanged,
}: {
  projects: ProjectListItem[];
  onOpen: (id: string) => void;
  onChanged: () => void;
}) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "mb-1 grid gap-3 px-2 pb-2 text-[12px] text-muted-foreground",
          recentCols,
        )}
      >
        <span>Name</span>
        <span>Slides</span>
        <span>Format</span>
        <span>Last opened</span>
        <span>Owner</span>
        <span />
      </div>
      <div>
        {projects.map((project) => (
          <StudioProjectRow
            key={project.id}
            project={project}
            onOpen={() => onOpen(project.id)}
            onChanged={onChanged}
          />
        ))}
      </div>
    </div>
  );
}
