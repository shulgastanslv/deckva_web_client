"use client";

import { Star } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import type { ProjectListItem } from "@/actions/projects";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectMenu } from "@/components/studio/browse/studio-project-menu";
import { StudioProjectOwner } from "@/components/studio/browse/studio-project-owner";
import { StudioTypeArt } from "@/components/studio/ui/studio-type-art";
import { cn } from "@/lib/utils";

export function StudioProjectCard({
  project,
  selected = false,
  inTrash = false,
  onOpen,
  onToggleSelect,
  onChanged,
}: {
  project: ProjectListItem;
  selected?: boolean;
  inTrash?: boolean;
  onOpen: () => void;
  onToggleSelect?: (opts?: { additive?: boolean }) => void;
  onChanged: () => void;
}) {
  const tc = useTranslations("common");
  return (
    <article
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2.5 select-none",
        selected && "ring-2 ring-foreground/20 rounded-2xl",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            onToggleSelect?.({ additive: true });
            return;
          }
          onOpen();
        }}
        className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted/40 text-left transition-colors group-hover:bg-muted/60"
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
          <span className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
            <StudioTypeArt
              kind="carousel"
              seed={project.id.length}
              className="size-12 rounded-2xl"
            />
            <span className="text-[12px] text-muted-foreground/70">
              {project.title || tc("untitled")}
            </span>
          </span>
        )}
        <span
          role="button"
          tabIndex={0}
          aria-pressed={selected}
          className={cn(
            "absolute top-2 left-2 z-[1] flex size-5 items-center justify-center rounded-md border border-border/60 bg-background",
            selected
              ? "border-foreground bg-foreground text-background"
              : "hover:border-foreground/40",
          )}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleSelect?.({ additive: true });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect?.({ additive: true });
            }
          }}
        >
          {selected ? (
            <span className="block size-2 rounded-[2px] bg-background" />
          ) : null}
        </span>
        {project.isSaved ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-background/90 p-1.5">
            <Star className="size-3 fill-current text-foreground" />
          </span>
        ) : null}
      </button>

      <div
        className="absolute top-1.5 right-1.5 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <StudioProjectMenu
          project={project}
          inTrash={inTrash}
          onChanged={onChanged}
        />
      </div>

      <button type="button" onClick={onOpen} className="w-full px-0.5 text-left">
        <p className="truncate text-[13px] font-medium text-foreground">
          {project.title || tc("untitled")}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <StudioProjectOwner
            name={project.authorName}
            image={project.authorImage}
            className="min-w-0"
          />
          <p className="shrink-0 text-[11px] text-muted-foreground">
            {project.slideCount} · {formatBoardDate(project.updatedAt)}
          </p>
        </div>
      </button>
    </article>
  );
}
