"use client";

import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommunityProjectListItem } from "@/actions/community";
import { cn } from "@/lib/utils";

const cols =
  "grid-cols-[minmax(0,1.6fr)_72px_88px_minmax(0,1fr)_minmax(0,0.9fr)]";

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function CommunityRows({
  items,
  onOpen,
}: {
  items: CommunityProjectListItem[];
  onOpen: (id: string) => void;
}) {
  const t = useTranslations("studio.browse");
  return (
    <div className="min-w-0 overflow-x-auto">
      <div
        className={cn(
          "mb-1 grid min-w-[640px] gap-3 px-2 pb-2 text-[12px] text-muted-foreground",
          cols,
        )}
      >
        <span>{t("colName")}</span>
        <span>{t("colSlides")}</span>
        <span>{t("colCategory")}</span>
        <span>{t("colUpdated")}</span>
        <span>{t("colAuthor")}</span>
      </div>

      <div className="min-w-[640px] divide-y-0">
        {items.map((item) => {
          const when = formatWhen(
            item.communityUpdatedAt ?? item.publishedAt,
          );
          const editor = item.updatedByName ?? item.authorName ?? t("creator");

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              className={cn(
                "grid w-full cursor-pointer items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/40",
                cols,
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-muted/40">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="size-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.aspectRatio}
                  </p>
                </div>
              </div>

              <span className="text-[13px] text-muted-foreground">
                {item.slideCount}
              </span>
              <span className="truncate text-[13px] text-muted-foreground">
                {item.category ?? "—"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] text-foreground">{when}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                  {t("byAuthor", { name: editor })}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={item.authorImage ?? undefined} alt="" />
                  <AvatarFallback className="text-[9px]">
                    {(item.authorName ?? "?").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-[13px] text-foreground">
                  {item.authorName ?? t("creator")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
