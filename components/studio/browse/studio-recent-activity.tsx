"use client";

import type { ArtifactListItem } from "@/actions/artifacts";
import type { ProjectListItem } from "@/actions/projects";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectOwner } from "@/components/studio/browse/studio-project-owner";
import { StudioProjectThumb } from "@/components/studio/browse/studio-project-thumb";
import { StudioBadge } from "@/components/studio/ui/studio-badge";
import {
  StudioTypeArt,
  type StudioTypeArtKind,
} from "@/components/studio/ui/studio-type-art";
import { cn } from "@/lib/utils";

export type RecentFilter = "all" | "carousels" | "texts" | "palettes";

export type RecentActivityItem =
  | {
      key: string;
      kind: "carousel";
      updatedAt: string;
      project: ProjectListItem;
    }
  | {
      key: string;
      kind: "text" | "palette";
      updatedAt: string;
      artifact: ArtifactListItem;
    };

export const activityCols =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]";

export function buildRecentActivity(input: {
  projects: ProjectListItem[];
  texts: ArtifactListItem[];
  palettes: ArtifactListItem[];
  filter: RecentFilter;
  limit?: number;
}): RecentActivityItem[] {
  const items: RecentActivityItem[] = [];

  if (input.filter === "all" || input.filter === "carousels") {
    for (const project of input.projects) {
      items.push({
        key: `carousel:${project.id}`,
        kind: "carousel",
        updatedAt: project.updatedAt,
        project,
      });
    }
  }
  if (input.filter === "all" || input.filter === "texts") {
    for (const artifact of input.texts) {
      items.push({
        key: `text:${artifact.id}`,
        kind: "text",
        updatedAt: artifact.updatedAt,
        artifact,
      });
    }
  }
  if (input.filter === "all" || input.filter === "palettes") {
    for (const artifact of input.palettes) {
      items.push({
        key: `palette:${artifact.id}`,
        kind: "palette",
        updatedAt: artifact.updatedAt,
        artifact,
      });
    }
  }

  items.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return items.slice(0, input.limit ?? 16);
}

function KindBadge({
  kind,
  colors,
}: {
  kind: RecentActivityItem["kind"];
  colors?: string[] | null;
}) {
  const label =
    kind === "carousel" ? "Carousel" : kind === "text" ? "Text" : "Palette";
  return (
    <span className="inline-flex items-center gap-1.5">
      <StudioTypeArt
        kind={kind}
        colors={colors}
        seed={kind.length * 7}
        className="size-5 rounded-md"
      />
      <StudioBadge>{label}</StudioBadge>
    </span>
  );
}

export function StudioRecentActivityRow({
  item,
  onOpen,
}: {
  item: RecentActivityItem;
  onOpen: (item: RecentActivityItem) => void;
}) {
  if (item.kind === "carousel") {
    const project = item.project;
    return (
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={cn(
          "group grid w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-muted/40",
          activityCols,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          {project.previewUrl ? (
            <StudioProjectThumb project={project} />
          ) : (
            <StudioTypeArt
              kind="carousel"
              seed={project.id.length}
              className="size-8"
            />
          )}
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[14px] font-semibold text-foreground">
                {project.title || "Untitled"}
              </span>
              {project.isSaved ? <StudioBadge>Starred</StudioBadge> : null}
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
              {project.slideCount} slides · {project.aspectRatio}
            </span>
          </span>
        </span>
        <span className="hidden md:block">
          <KindBadge kind="carousel" />
        </span>
        <span className="hidden min-w-0 md:block">
          <StudioProjectOwner
            name={project.authorName}
            image={project.authorImage}
          />
        </span>
        <span className="truncate text-[13px] text-muted-foreground">
          {formatBoardDate(project.updatedAt)}
        </span>
      </button>
    );
  }

  const artifact = item.artifact;
  const preview =
    item.kind === "text"
      ? artifact.previewText || "Post text"
      : artifact.previewText || "Color palette";

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "group grid w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-muted/40",
        activityCols,
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <StudioTypeArt
          kind={item.kind}
          colors={artifact.previewColors}
          seed={artifact.id.length + artifact.title.length}
        />
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold text-foreground">
            {artifact.title ||
              (item.kind === "text" ? "Untitled text" : "Untitled palette")}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
            {preview}
          </span>
        </span>
      </span>
      <span className="hidden md:block">
        <KindBadge kind={item.kind} colors={artifact.previewColors} />
      </span>
      <span className="hidden truncate text-[13px] text-muted-foreground md:block">
        {preview}
      </span>
      <span className="truncate text-[13px] text-muted-foreground">
        {formatBoardDate(artifact.updatedAt)}
      </span>
    </button>
  );
}

export function StudioRecentActivityList({
  items,
  onOpen,
}: {
  items: RecentActivityItem[];
  onOpen: (item: RecentActivityItem) => void;
}) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "mb-1 grid gap-3 px-2 pb-2 text-[12px] text-muted-foreground",
          activityCols,
        )}
      >
        <span>Name</span>
        <span className="hidden md:block">Type</span>
        <span className="hidden md:block">Details</span>
        <span>Updated</span>
      </div>
      <div>
        {items.map((item) => (
          <StudioRecentActivityRow key={item.key} item={item} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export const RECENT_FILTERS: {
  id: RecentFilter;
  label: string;
  art: StudioTypeArtKind;
}[] = [
  { id: "all", label: "All", art: "all" },
  { id: "carousels", label: "Carousels", art: "carousel" },
  { id: "texts", label: "Texts", art: "text" },
  { id: "palettes", label: "Palettes", art: "palette" },
];
