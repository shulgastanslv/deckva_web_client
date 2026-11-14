"use client";

import { Star } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import type { ProjectListItem } from "@/actions/projects";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectMenu } from "@/components/studio/browse/studio-project-menu";
import { StudioProjectOwner } from "@/components/studio/browse/studio-project-owner";
import { cn } from "@/lib/utils";

function CarouselStackPreview({
  project,
  untitled,
}: {
  project: ProjectListItem;
  untitled: string;
}) {
  const urls =
    project.previewUrls?.length > 0
      ? project.previewUrls
      : project.previewUrl
        ? [project.previewUrl]
        : [];
  const peekCount = Math.min(
    3,
    Math.max(urls.length > 0 ? urls.length : 0, Math.min(project.slideCount, 3)),
  );
  const layers = Math.max(1, peekCount);
  const stacked = layers > 1;

  return (
    <span className="relative block aspect-4/5 w-full">
      {stacked
        ? Array.from({ length: layers - 1 }, (_, i) => {
            const depth = layers - 1 - i;
            const url = urls[depth] ?? null;
            return (
              <span
                key={`peek-${depth}`}
                aria-hidden
                className={cn(
                  "absolute overflow-hidden rounded-2xl bg-muted/50",
                  depth === 2 && "inset-0 left-3 top-2.5",
                  depth === 1 && "inset-0 left-1.5 top-1",
                )}
                style={{ zIndex: depth }}
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt=""
                    className="size-full object-cover opacity-55"
                    draggable={false}
                  />
                ) : (
                  <span className="block size-full bg-muted/70" />
                )}
              </span>
            );
          })
        : null}

      <span
        className={cn(
          "absolute z-[3] overflow-hidden rounded-2xl bg-muted/40 transition-colors group-hover:bg-muted/60",
          stacked ? "inset-0 right-2.5 bottom-2.5" : "inset-0",
        )}
      >
        {urls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urls[0]}
            alt=""
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-4 text-center">
            <span className="line-clamp-4 text-[13px] font-medium leading-snug text-muted-foreground">
              {project.title || untitled}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}

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
    <article className="group relative flex cursor-pointer flex-col gap-2.5 select-none">
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
        className="relative w-full text-left"
      >
        <CarouselStackPreview project={project} untitled={tc("untitled")} />

        <span
          role="button"
          tabIndex={0}
          aria-pressed={selected}
          className={cn(
            "absolute top-2 left-2 z-[4] flex size-5 items-center justify-center rounded-md border border-border/60 bg-background",
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

        {project.slideCount > 1 ? (
          <span className="absolute right-3.5 bottom-3.5 z-[4] rounded-md bg-background/90 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
            {project.slideCount}
          </span>
        ) : null}

        {project.isSaved ? (
          <span className="absolute bottom-3.5 left-2 z-[4] rounded-md bg-background/90 p-1.5">
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
