"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Loader2, Search, X } from "lucide-react";

import { FilterMenu } from "@/components/canvas/sidebar/filter-menu";
import { GallerySection } from "@/components/canvas/sidebar/gallery-card";
import { useCanvasManager } from "@/context/canvas-manager";
import type { PixabayHit, PixabayImageType, PixabayPage } from "@/lib/pixabay";
import {
  RECENT_PREVIEW,
  RECENT_STORAGE_KEY,
  readRecentIcons,
  rememberIcon,
  type RecentIcon,
} from "@/lib/pixabay-recent";
import { cn } from "@/lib/utils";

const TYPES = [
  { id: "vector" as const, label: "Vectors" },
  { id: "illustration" as const, label: "Illustrations" },
  { id: "photo" as const, label: "Photos" },
];

type IconHit = Pick<PixabayHit, "id" | "name" | "previewUrl" | "pageUrl"> & {
  type: PixabayImageType;
};

async function searchIcons(
  query: string,
  type: PixabayImageType,
  page: number,
  order: "popular" | "latest",
  signal: AbortSignal,
): Promise<PixabayPage> {
  const url = new URL("/api/pixabay/search", window.location.origin);
  if (query) url.searchParams.set("q", query);
  url.searchParams.set("type", type);
  url.searchParams.set("page", String(page));
  url.searchParams.set("order", order);

  const res = await fetch(url, { signal, cache: "no-store" });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error =
      data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Search failed";
    throw new Error(error);
  }
  return data as PixabayPage;
}

async function downloadAsset(
  id: string,
  type: PixabayImageType,
): Promise<{ kind: "svg"; svg: string } | { kind: "image"; dataUrl: string }> {
  const res = await fetch("/api/pixabay/asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type }),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok || !data || typeof data !== "object") {
    const error =
      data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Couldn't download the asset";
    throw new Error(error);
  }
  const kind = (data as { kind?: unknown }).kind;
  if (kind === "svg" && typeof (data as { svg?: unknown }).svg === "string") {
    return { kind: "svg", svg: (data as { svg: string }).svg };
  }
  if (kind === "image" && typeof (data as { dataUrl?: unknown }).dataUrl === "string") {
    return { kind: "image", dataUrl: (data as { dataUrl: string }).dataUrl };
  }
  throw new Error("Couldn't download the asset");
}

function IconTile({
  item,
  busy,
  disabled,
  onClick,
}: {
  item: IconHit;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={item.name}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex aspect-square min-w-0 items-center justify-center rounded-xl bg-muted/25 p-2 transition-colors",
        "hover:bg-muted/55 disabled:opacity-50",
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.previewUrl} alt={item.name} className="size-full object-contain" draggable={false} loading="lazy" />
      )}
    </button>
  );
}

export function SidebarIcons() {
  const manager = useCanvasManager();
  const [query, setQuery] = useState("");
  const [imageType, setImageType] = useState<PixabayImageType>("vector");
  const [items, setItems] = useState<IconHit[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paging, setPaging] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentIcon[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [browseLatest, setBrowseLatest] = useState(false);
  const searchGen = useRef(0);

  useEffect(() => {
    setRecent(readRecentIcons(window.localStorage.getItem(RECENT_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 && !browseLatest) {
      setItems([]);
      setPage(1);
      setLastPage(1);
      setTotal(0);
      setLoading(false);
      setPaging(false);
      setError(null);
      return;
    }

    const gen = ++searchGen.current;
    const controller = new AbortController();
    setLoading(true);
    setPaging(false);
    setError(null);

    const timer = window.setTimeout(() => {
      void searchIcons(
        q.length >= 2 ? q : "",
        imageType,
        1,
        browseLatest && q.length < 2 ? "latest" : "popular",
        controller.signal,
      )
        .then((result) => {
          if (gen !== searchGen.current) return;
          setItems(
            result.items.map((item) => ({
              id: item.id,
              name: item.name,
              previewUrl: item.previewUrl,
              pageUrl: item.pageUrl,
              type: imageType,
            })),
          );
          setPage(result.page);
          setLastPage(result.lastPage);
          setTotal(result.total);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted || gen !== searchGen.current) return;
          setItems([]);
          setPage(1);
          setLastPage(1);
          setTotal(0);
          setError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => {
          if (gen === searchGen.current) setLoading(false);
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, imageType, browseLatest]);

  const loadMore = async () => {
    const q = query.trim();
    if (paging || loading || page >= lastPage) return;
    if (q.length < 2 && !browseLatest) return;
    setPaging(true);
    try {
      const result = await searchIcons(
        q.length >= 2 ? q : "",
        imageType,
        page + 1,
        browseLatest && q.length < 2 ? "latest" : "popular",
        new AbortController().signal,
      );
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        const next = result.items
          .filter((item) => !seen.has(item.id))
          .map((item) => ({
            id: item.id,
            name: item.name,
            previewUrl: item.previewUrl,
            pageUrl: item.pageUrl,
            type: imageType,
          }));
        return [...current, ...next];
      });
      setPage(result.page);
      setLastPage(result.lastPage);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setPaging(false);
    }
  };

  const remember = (hit: RecentIcon) => {
    setRecent((current) => {
      const next = rememberIcon(current, hit);
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addHit = async (hit: IconHit) => {
    if (!manager || loadingId) return;
    setLoadingId(hit.id);
    setError(null);
    try {
      const asset = await downloadAsset(hit.id, hit.type);
      if (asset.kind === "svg") {
        await manager.objects.addSvgIcon(asset.svg, { maxSize: 280 });
      } else {
        await manager.objects.addImage(asset.dataUrl, { maxSize: 280 });
      }
      manager.commit();
      remember(hit);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Couldn't add that image");
    } finally {
      setLoadingId(null);
    }
  };

  const visibleRecent = showAllRecent ? recent : recent.slice(0, RECENT_PREVIEW);
  const searching = query.trim().length >= 2 || browseLatest;

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden p-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setBrowseLatest(false);
              setQuery(event.target.value);
            }}
            placeholder="Search Pixabay..."
            className="h-8 w-full min-w-0 rounded-lg bg-muted/30 pl-8 pr-8 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:bg-muted/45"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setBrowseLatest(true);
          }}
          className={cn(
            "h-8 shrink-0 rounded-full px-3 text-[13px] font-medium transition-colors",
            browseLatest && !query.trim()
              ? "bg-foreground text-background"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          Latest
        </button>
        <FilterMenu
          icon={LayoutGrid}
          value={imageType}
          onChange={(id) => {
            if (TYPES.some((item) => item.id === id)) setImageType(id as PixabayImageType);
          }}
          groups={[{ label: "Type", options: TYPES.map((item) => ({ id: item.id, label: item.label })) }]}
        />
      </div>

      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

      {recent.length > 0 ? (
        <GallerySection
          title="Recently used"
          action={recent.length > RECENT_PREVIEW ? (showAllRecent ? "Show less" : "See all") : undefined}
          onAction={() => setShowAllRecent((open) => !open)}
        >
          {visibleRecent.map((item) => (
            <IconTile
              key={item.id}
              item={item}
              busy={loadingId === item.id}
              disabled={loadingId !== null}
              onClick={() => void addHit(item)}
            />
          ))}
        </GallerySection>
      ) : null}

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted-foreground/80">Results</span>
          <span className="tabular-nums text-[13px] text-muted-foreground/40">
            {searching ? `${items.length}${total > items.length ? ` / ${total}` : ""}` : ""}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : !searching ? (
          recent.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-muted-foreground">
              Search vectors, illustrations, or photos.
            </p>
          ) : null
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-muted-foreground">Nothing matched.</p>
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-3 gap-2">
              {items.map((item) => (
                <IconTile
                  key={item.id}
                  item={item}
                  busy={loadingId === item.id}
                  disabled={loadingId !== null}
                  onClick={() => void addHit(item)}
                />
              ))}
            </div>
            {page < lastPage ? (
              <button
                type="button"
                disabled={paging}
                onClick={() => void loadMore()}
                className="mt-2 h-8 rounded-full bg-muted/30 text-[13px] font-medium text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
              >
                {paging ? "Loading…" : "Load more"}
              </button>
            ) : null}
          </>
        )}

        <p className="pt-1 text-center text-[11px] text-muted-foreground/50">
          Images from{" "}
          <a
            href="https://pixabay.com/"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:text-muted-foreground hover:underline"
          >
            Pixabay
          </a>
        </p>
      </div>
    </div>
  );
}
