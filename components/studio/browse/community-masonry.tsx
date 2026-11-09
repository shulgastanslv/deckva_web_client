"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommunityProjectListItem } from "@/actions/community";
import { cn } from "@/lib/utils";

const ASPECT: Record<string, string> = {
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "3:2": "3 / 2",
};

function formatShortDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function CommunityMasonry({
  items,
  onOpen,
}: {
  items: CommunityProjectListItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 xl:columns-5">
      {items.map((item) => {
        const aspect = ASPECT[item.aspectRatio] ?? "4 / 5";
        const when = formatShortDate(
          item.communityUpdatedAt ?? item.publishedAt,
        );
        const editor = item.updatedByName ?? item.authorName ?? "Creator";

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="group mb-4 block w-full break-inside-avoid text-left"
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl bg-muted/40 transition-colors",
                "group-hover:bg-muted/55",
              )}
              style={{ aspectRatio: aspect }}
            >
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail}
                  alt=""
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  draggable={false}
                />
              ) : (
                <span className="flex h-full items-center justify-center px-3 text-center text-[12px] text-muted-foreground/70">
                  {item.title}
                </span>
              )}

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="line-clamp-2 text-[13px] font-medium text-white">
                  {item.title}
                </p>
                {item.category ? (
                  <p className="mt-1 text-[11px] text-white/75">{item.category}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 px-0.5">
              <Avatar className="size-6">
                <AvatarImage src={item.authorImage ?? undefined} alt="" />
                <AvatarFallback className="text-[9px]">
                  {(item.authorName ?? "?").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground">
                  {item.authorName ?? "Creator"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {when ? `Updated ${when}` : `${item.slideCount} slides`}
                  {item.communityUpdatedAt ? ` · ${editor}` : ""}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
