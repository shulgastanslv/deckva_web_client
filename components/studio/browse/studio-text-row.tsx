"use client";

import type { ArtifactListItem } from "@/actions/artifacts";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioTypeArt } from "@/components/studio/ui/studio-type-art";
import { cn } from "@/lib/utils";

export const textCols =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.8fr)]";

export function StudioTextRow({
  artifact,
  onOpen,
}: {
  artifact: ArtifactListItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group grid w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-muted/40",
        textCols,
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <StudioTypeArt
          kind="text"
          seed={artifact.id.length + artifact.title.length}
        />
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold text-foreground">
            {artifact.title || "Untitled text"}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-muted-foreground md:hidden">
            {artifact.previewText || "Text"}
          </span>
        </span>
      </span>
      <span className="hidden truncate text-[13px] text-muted-foreground md:block">
        {artifact.previewText || "—"}
      </span>
      <span className="hidden items-center gap-1.5 text-[13px] text-muted-foreground md:flex">
        <StudioTypeArt kind="text" seed={3} className="size-4 rounded-md" />
      </span>
      <span className="truncate text-[13px] text-muted-foreground">
        {formatBoardDate(artifact.updatedAt)}
      </span>
    </button>
  );
}

export function StudioTextList({
  artifacts,
  onOpen,
}: {
  artifacts: ArtifactListItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "mb-1 grid gap-3 px-2 pb-2 text-[12px] text-muted-foreground",
          textCols,
        )}
      >
        <span>Name</span>
        <span className="hidden md:block">Preview</span>
        <span className="hidden md:block">Type</span>
        <span>Updated</span>
      </div>
      <div>
        {artifacts.map((artifact) => (
          <StudioTextRow
            key={artifact.id}
            artifact={artifact}
            onOpen={() => onOpen(artifact.id)}
          />
        ))}
      </div>
    </div>
  );
}
