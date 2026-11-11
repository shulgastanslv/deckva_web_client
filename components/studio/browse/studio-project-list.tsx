"use client";

import { useTranslations } from "next-intl";

import type { ProjectListItem } from "@/actions/projects";
import {
  recentCols,
  StudioProjectRow,
} from "@/components/studio/browse/studio-project-row";
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
  const t = useTranslations("studio.browse");
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "mb-1 grid gap-3 px-2 pb-2 text-[12px] text-muted-foreground",
          recentCols,
        )}
      >
        <span>{t("colName")}</span>
        <span className="hidden md:block">{t("colSlides")}</span>
        <span className="hidden md:block">{t("colFormat")}</span>
        <span>{t("colLastOpened")}</span>
        <span className="hidden md:block">{t("colOwner")}</span>
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
