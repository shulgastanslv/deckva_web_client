"use client";

import { useTranslations } from "next-intl";

import type { ProjectListItem } from "@/actions/projects";
import { StudioProjectRow } from "@/components/studio/browse/studio-project-row";

export function StudioProjectList({
  projects,
  selectedIds,
  inTrash = false,
  onOpen,
  onToggleSelect,
  onChanged,
}: {
  projects: ProjectListItem[];
  selectedIds?: Set<string>;
  inTrash?: boolean;
  onOpen: (id: string) => void;
  onToggleSelect?: (id: string, opts?: { additive?: boolean }) => void;
  onChanged: () => void;
}) {
  const t = useTranslations("studio.browse");
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full border-collapse text-left md:table-fixed">
        <colgroup>
          <col className="w-10" />
          <col />
          <col />
          <col />
          <col />
          <col className="w-10" />
        </colgroup>
        <thead>
          <tr className="border-b border-border/50 text-[12px] text-muted-foreground">
            <th className="py-2 pr-1 pl-2 font-normal" scope="col">
              <span className="sr-only">Select</span>
            </th>
            <th className="py-2 pr-3 font-normal" scope="col">
              {t("colName")}
            </th>
            <th className="hidden w-[12rem] py-2 pr-3 font-normal md:table-cell" scope="col">
              {t("colCreatedBy")}
            </th>
            <th className="hidden w-[7rem] py-2 pr-3 font-normal md:table-cell" scope="col">
              {t("colSlides")}
            </th>
            <th className="hidden w-[5.5rem] py-2 pr-3 font-normal md:table-cell" scope="col">
              {t("colRatio")}
            </th>
            <th className="py-2 pr-2 pl-1 font-normal" scope="col">
              <span className="sr-only">{t("listView")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <StudioProjectRow
              key={project.id}
              project={project}
              selected={selectedIds?.has(project.id)}
              inTrash={inTrash}
              appearIndex={index}
              onOpen={() => onOpen(project.id)}
              onToggleSelect={(opts) => onToggleSelect?.(project.id, opts)}
              onChanged={onChanged}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
