"use client";

import { useTranslations } from "next-intl";

import type { CommunityProjectListItem } from "@/actions/community";
import { formatBoardDate } from "@/components/studio/lib/format";
import { StudioProjectOwner } from "@/components/studio/browse/studio-project-owner";
import { cn } from "@/lib/utils";

function CommunityStackPreview({
  item,
  untitled,
}: {
  item: CommunityProjectListItem;
  untitled: string;
}) {
  const urls = item.thumbnail ? [item.thumbnail] : [];
  const layers = Math.min(3, Math.max(1, item.slideCount));
  const stacked = layers > 1;

  return (
    <span className="relative block aspect-4/5 w-full">
      {stacked
        ? Array.from({ length: layers - 1 }, (_, i) => {
            const depth = layers - 1 - i;
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
                {urls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urls[0]}
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
              {item.title || untitled}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}

export function CommunityMasonry({
  items,
  onOpen,
}: {
  items: CommunityProjectListItem[];
  onOpen: (id: string) => void;
}) {
  const tc = useTranslations("common");

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const when = item.communityUpdatedAt ?? item.publishedAt;
        return (
          <article
            key={item.id}
            className="group relative flex cursor-pointer flex-col gap-2.5 select-none"
          >
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className="relative w-full text-left"
            >
              <CommunityStackPreview item={item} untitled={tc("untitled")} />

              {item.slideCount > 1 ? (
                <span className="absolute right-3.5 bottom-3.5 z-[4] rounded-md bg-background/90 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
                  {item.slideCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className="w-full px-0.5 text-left"
            >
              <p className="truncate text-[13px] font-medium text-foreground">
                {item.title || tc("untitled")}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <StudioProjectOwner
                  name={item.authorName}
                  image={item.authorImage}
                  className="min-w-0"
                />
                <p className="shrink-0 text-[11px] text-muted-foreground">
                  {item.slideCount}
                  {when ? ` · ${formatBoardDate(when)}` : ""}
                </p>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
