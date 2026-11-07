"use client";

import type { ArtifactListItem } from "@/actions/artifacts";
import { formatBoardDate } from "@/components/studio/lib/format";

export function StudioPaletteCard({
  artifact,
  onOpen,
}: {
  artifact: ArtifactListItem;
  onOpen: () => void;
}) {
  const colors = artifact.previewColors ?? [];

  return (
    <article className="group relative flex flex-col gap-2.5">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted/40 text-left transition-colors group-hover:bg-muted/30"
      >
        <div className="absolute inset-0 flex">
          {(colors.length > 0 ? colors : ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373"]).map(
            (color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-full flex-1"
                style={{ backgroundColor: color }}
              />
            ),
          )}
        </div>
      </button>

      <button type="button" onClick={onOpen} className="w-full px-0.5 text-left">
        <p className="truncate text-[13px] font-medium text-foreground">
          {artifact.title || artifact.previewText || "Untitled palette"}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          Palette · {formatBoardDate(artifact.updatedAt)}
        </p>
      </button>
    </article>
  );
}
