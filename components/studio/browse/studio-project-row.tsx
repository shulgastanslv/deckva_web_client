"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import type { ProjectListItem } from "@/actions/projects";
import { StudioProjectMenu } from "@/components/studio/browse/studio-project-menu";
import { StudioProjectOwner } from "@/components/studio/browse/studio-project-owner";
import { StudioProjectThumb } from "@/components/studio/browse/studio-project-thumb";
import { StudioBadge } from "@/components/studio/ui/studio-badge";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function StudioProjectRow({
  project,
  selected = false,
  inTrash = false,
  appearIndex = 0,
  onOpen,
  onToggleSelect,
  onChanged,
}: {
  project: ProjectListItem;
  selected?: boolean;
  inTrash?: boolean;
  appearIndex?: number;
  onOpen: () => void;
  onToggleSelect?: (opts?: { additive?: boolean }) => void;
  onChanged: () => void;
}) {
  const t = useTranslations("studio.browse");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();

  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSelect?.({ additive: true });
  };

  const open = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      onToggleSelect?.({ additive: true });
      return;
    }
    onOpen();
  };

  return (
    <motion.tr
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: reduce ? 0 : Math.min(appearIndex * 0.035, 0.35),
        ease,
      }}
      className={cn(
        "group cursor-pointer border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/40",
        selected && "bg-muted/45",
      )}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          onToggleSelect?.({ additive: true });
          return;
        }
        onOpen();
      }}
    >
      <td className="py-2.5 pr-1 pl-2 align-middle">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={selected ? "Deselect" : "Select"}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          onClick={toggle}
        >
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-md border border-border/60 bg-background",
              selected && "border-foreground bg-foreground text-background",
            )}
          >
            {selected ? (
              <span className="block size-2 rounded-[2px] bg-background" />
            ) : null}
          </span>
        </button>
      </td>

      <td className="min-w-0 py-2.5 pr-3 align-middle">
        <button
          type="button"
          onClick={open}
          className="flex min-w-0 max-w-full items-center gap-3 text-left"
        >
          <StudioProjectThumb project={project} />
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[14px] font-medium text-foreground">
              {project.title || tc("untitled")}
            </span>
            {project.isSaved ? <StudioBadge>{t("starred")}</StudioBadge> : null}
          </span>
        </button>
      </td>

      <td className="hidden py-2.5 pr-3 align-middle md:table-cell">
        <StudioProjectOwner
          name={project.authorName}
          image={project.authorImage}
        />
      </td>

      <td className="hidden py-2.5 pr-3 align-middle text-[13px] text-muted-foreground md:table-cell">
        {t("slidesCount", { n: project.slideCount })}
      </td>

      <td className="hidden py-2.5 pr-3 align-middle text-[13px] text-muted-foreground md:table-cell">
        {project.aspectRatio}
      </td>

      <td
        className="py-2.5 pr-2 pl-1 align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <StudioProjectMenu
            project={project}
            inTrash={inTrash}
            onChanged={onChanged}
          />
        </div>
      </td>
    </motion.tr>
  );
}
