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
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-[12rem]" />
          <col className="w-[7rem]" />
          <col className="w-[5.5rem]" />
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
            <th className="py-2 pr-3 font-normal" scope="col">
              {t("colCreatedBy")}
            </th>
            <th className="py-2 pr-3 font-normal" scope="col">
              {t("colSlides")}
            </th>
            <th className="py-2 pr-3 font-normal" scope="col">
              {t("colRatio")}
            </th>
            <th className="py-2 pr-2 pl-1 font-normal" scope="col">
              <span className="sr-only">{t("listView")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <StudioProjectRow
              key={project.id}
              project={project}
              selected={selectedIds?.has(project.id)}
              inTrash={inTrash}
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
