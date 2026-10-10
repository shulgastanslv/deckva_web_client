"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LayoutGrid, Search, X } from "lucide-react";

import { FilterMenu } from "@/components/canvas/sidebar/filter-menu";
import { GallerySection } from "@/components/canvas/sidebar/gallery-card";
import { useCanvasManager } from "@/context/canvas-manager";
import type { IconScoutAsset, IconScoutHit, IconScoutPage } from "@/lib/iconscout";
import {
  RECENT_PREVIEW,
  RECENT_STORAGE_KEY,
  readRecentIcons,
  rememberIcon,
  type RecentIcon,
} from "@/lib/iconscout-recent";
import { cn } from "@/lib/utils";

const ASSETS = [
  { id: "icon" as const, label: "Icons" },
  { id: "illustration" as const, label: "Illustrations" },
  { id: "3d" as const, label: "3D" },
];

async function searchIcons(
  query: string,
  asset: IconScoutAsset,
  page: number,
  signal: AbortSignal,
): Promise<IconScoutPage> {
  const url = new URL("/api/iconscout/search", window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("asset", asset);
  url.searchParams.set("page", String(page));

  const res = await fetch(url, { signal, cache: "no-store" });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error =
      data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Search failed";
    throw new Error(error);
  }
  return data as IconScoutPage;
}

async function downloadSvg(uuid: string): Promise<string> {
  const res = await fetch("/api/iconscout/svg", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uuid }),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok || !data || typeof data !== "object" || typeof (data as { svg?: unknown }).svg !== "string") {
    const error =
      data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Couldn't download the SVG";
    throw new Error(error);
  }
  return (data as { svg: string }).svg;
}

function IconTile({
  item,
  busy,
  disabled,
  onClick,
}: {
  item: IconScoutHit;
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
  const [asset, setAsset] = useState<IconScoutAsset>("icon");
  const [items, setItems] = useState<IconScoutHit[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paging, setPaging] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentIcon[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const searchGen = useRef(0);

  useEffect(() => {
    setRecent(readRecentIcons(window.localStorage.getItem(RECENT_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
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
      void searchIcons(q, asset, 1, controller.signal)
        .then((result) => {
          if (gen !== searchGen.current) return;
          setItems(result.items);
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
  }, [query, asset]);

  const loadMore = async () => {
    const q = query.trim();
    if (paging || loading || q.length < 2 || page >= lastPage) return;
    setPaging(true);
    try {
      const result = await searchIcons(q, asset, page + 1, new AbortController().signal);
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...result.items.filter((item) => !seen.has(item.id))];
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

  const addHit = async (hit: IconScoutHit, kind: IconScoutAsset) => {
    if (!manager || loadingId) return;
    setLoadingId(hit.id);
    setError(null);
    try {
      if (kind === "icon") {
        try {
          const svg = await downloadSvg(hit.id);
          await manager.objects.addSvgIcon(svg, { maxSize: 280 });
        } catch {
          // CDN preview works when api-download is slow; no download credit.
          await manager.objects.addImage(hit.previewUrl, { maxSize: 280 });
        }
      } else {
        await manager.objects.addImage(hit.previewUrl, { maxSize: 280 });
      }
      manager.commit();
      remember({ ...hit, asset: kind });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Couldn't add that image");
    } finally {
      setLoadingId(null);
    }
  };

  const visibleRecent = showAllRecent ? recent : recent.slice(0, RECENT_PREVIEW);
  const searching = query.trim().length >= 2;

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden p-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search IconScout..."
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
        <FilterMenu
          icon={LayoutGrid}
          value={asset}
          onChange={(id) => {
            if (ASSETS.some((item) => item.id === id)) setAsset(id as IconScoutAsset);
          }}
          groups={[{ label: "Type", options: ASSETS.map((item) => ({ id: item.id, label: item.label })) }]}
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
              onClick={() => void addHit(item, item.asset)}
            />
          ))}
        </GallerySection>
      ) : null}

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-between">
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
            <p className="py-12 text-center text-[13px] text-muted-foreground">Search icons, illustrations, or 3D.</p>
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
                  onClick={() => void addHit(item, asset)}
                />
              ))}
            </div>
            {page < lastPage ? (
              <button
                type="button"
                disabled={paging}
                onClick={() => void loadMore()}
                className="mt-2 h-8 rounded-lg bg-muted/30 text-[13px] font-medium text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
              >
                {paging ? "Loading…" : "Load more"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
