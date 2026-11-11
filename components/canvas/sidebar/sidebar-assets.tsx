"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import {
  createMediaAsset,
  deleteMediaAsset,
  importLegacyAssets,
  listMediaAssets,
  updateMediaAsset,
  type MediaAssetDTO,
} from "@/actions/assets";
import { FilterMenu } from "@/components/canvas/sidebar/filter-menu";
import { GallerySection } from "@/components/canvas/sidebar/gallery-card";
import { UploadOrDrop } from "@/components/canvas/sidebar/upload-or-drop";
import {
  sidebarActionBtn,
  sidebarFieldInput,
  sidebarPanel,
  sidebarSegmented,
  sidebarSegmentedItem,
  sidebarSegmentedItemIdle,
} from "@/components/canvas/sidebar/sidebar-ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCanvasManager } from "@/context/canvas-manager";
import {
  ASSETS_STORAGE_KEY,
  readUserAssets,
} from "@/lib/canvas/user-assets";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import {
  BRAND_KIT_CHANGED,
  loadBrandKit,
  type BrandKitLogo,
} from "@/lib/studio/brand-kit";
import { cn } from "@/lib/utils";

const LEGACY_IMPORT_KEY = "deckva.user-assets.imported";

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseTagInput(value: string): string[] {
  return value
    .split(/[,#\n]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export function SidebarAssets() {
  const manager = useCanvasManager();
  const [assets, setAssets] = useState<MediaAssetDTO[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [logos, setLogos] = useState<BrandKitLogo[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaAssetDTO | null>(null);
  const [editing, setEditing] = useState<MediaAssetDTO | null>(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [pending, startTransition] = useTransition();
  const skipFilterFetch = useRef(true);

  const refresh = useEffectEvent(async (opts?: { query?: string; tag?: string | null }) => {
    const result = await listMediaAssets({
      query: opts?.query ?? query,
      tag: opts?.tag === undefined ? activeTag ?? undefined : opts.tag ?? undefined,
    });
    if (result.success === false) {
      setError(result.error);
      return;
    }
    setAssets(result.assets);
    setAllTags(result.tags);
    setError(null);
  });

  useEffect(() => {
    setLogos(loadBrandKit().logos);
    const onBrand = () => setLogos(loadBrandKit().logos);
    window.addEventListener(BRAND_KIT_CHANGED, onBrand);
    return () => window.removeEventListener(BRAND_KIT_CHANGED, onBrand);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!window.localStorage.getItem(LEGACY_IMPORT_KEY)) {
          const legacy = readUserAssets(
            window.localStorage.getItem(ASSETS_STORAGE_KEY),
          );
          if (legacy.length > 0) {
            const imported = await importLegacyAssets(
              legacy.map((item) => ({
                name: item.name,
                dataUrl: item.dataUrl,
                createdAt: item.createdAt,
              })),
            );
            if (imported.success) {
              window.localStorage.setItem(LEGACY_IMPORT_KEY, "1");
              if (imported.imported > 0) {
                window.localStorage.removeItem(ASSETS_STORAGE_KEY);
              }
            }
          } else {
            window.localStorage.setItem(LEGACY_IMPORT_KEY, "1");
          }
        }
      } catch {
        /* ignore migration errors; still load DB */
      }
      if (!cancelled) {
        startTransition(() => {
          void refresh({ query, tag: activeTag });
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // Initial load + legacy import only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipFilterFetch.current) {
      skipFilterFetch.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      startTransition(() => {
        void refresh({ query, tag: activeTag });
      });
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, activeTag]);

  const addFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const tags = parseTagInput(uploadTags);
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await fileToDataUrl(file, {
          maxEdge: 1800,
          quality: 0.9,
        });
        const result = await createMediaAsset({
          name: file.name.replace(/\.[^.]+$/, "") || "Asset",
          dataUrl,
          tags,
        });
        if (result.success === false) {
          setError(result.error);
          reportError(new Error(result.error), result.error);
          break;
        }
      }
      await refresh();
    } catch (err) {
      setError(messages.errors.addFile);
      reportError(err, messages.errors.addFile);
    } finally {
      setUploading(false);
    }
  };

  const addToCanvas = async (item: { id: string; dataUrl: string }) => {
    if (!manager || loadingId) return;
    setLoadingId(item.id);
    setError(null);
    try {
      await manager.objects.addImage(item.dataUrl, { maxSize: 480 });
      manager.commit();
    } catch (err) {
      reportError(err, messages.errors.addAsset);
      setError(messages.errors.addAsset);
    } finally {
      setLoadingId(null);
    }
  };

  const openEdit = (asset: MediaAssetDTO) => {
    setEditing(asset);
    setEditName(asset.name);
    setEditTags(asset.tags.join(", "));
  };

  const saveEdit = async () => {
    if (!editing) return;
    const result = await updateMediaAsset({
      id: editing.id,
      name: editName,
      tags: parseTagInput(editTags),
    });
    if (result.success === false) {
      setError(result.error);
      reportError(new Error(result.error), result.error);
      return;
    }
    setEditing(null);
    if (preview?.id === result.asset.id) setPreview(result.asset);
    await refresh();
  };

  const removeAsset = async (id: string) => {
    const result = await deleteMediaAsset(id);
    if (result.success === false) {
      setError(result.error);
      reportError(new Error(result.error), result.error);
      return;
    }
    if (preview?.id === id) setPreview(null);
    if (editing?.id === id) setEditing(null);
    await refresh();
  };

  return (
    <div className={cn(sidebarPanel, "overflow-hidden")}>
      <div className="flex items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or tag"
            className={cn(sidebarFieldInput, "pl-9 pr-9")}
          />
          {query ? (
            <button
              type="button"
              title="Clear"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        {allTags.length > 0 ? (
          <FilterMenu
            value={activeTag ?? "all"}
            defaultValue="all"
            ariaLabel="Filter by tag"
            onChange={(id) => setActiveTag(id === "all" ? null : id)}
            groups={[
              {
                label: "Tags",
                options: [
                  { id: "all", label: "All tags" },
                  ...allTags.map((tag) => ({ id: tag, label: `#${tag}` })),
                ],
              },
            ]}
          />
        ) : null}
      </div>

      <div className="relative">
        <Tag className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={uploadTags}
          onChange={(e) => setUploadTags(e.target.value)}
          placeholder="Tags for uploads (logo, icon)"
          className={cn(sidebarFieldInput, "pl-9")}
        />
      </div>

      <UploadOrDrop
        multiple
        disabled={!manager}
        busy={uploading}
        hint="PNG, JPG, SVG · saved to library"
        onFiles={(files) => void addFiles(files)}
      />

      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

      {logos.length > 0 ? (
        <GallerySection title="Brand logos">
          {logos.map((item) => (
            <AssetTile
              key={item.id}
              name={item.name}
              dataUrl={item.dataUrl}
              busy={loadingId === item.id}
              disabled={loadingId !== null}
              onAdd={() => void addToCanvas(item)}
            />
          ))}
        </GallerySection>
      ) : null}

      {pending && assets.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : assets.length === 0 ? (
        logos.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Upload logos and photos here. Tag them to find them later.
          </p>
        ) : null
      ) : (
        <GallerySection title={`Library · ${assets.length}`}>
          {assets.map((item) => (
            <AssetTile
              key={item.id}
              name={item.name}
              dataUrl={item.dataUrl}
              busy={loadingId === item.id}
              disabled={loadingId !== null}
              onAdd={() => void addToCanvas(item)}
              onPreview={() => setPreview(item)}
              onEdit={() => openEdit(item)}
              onRemove={() => void removeAsset(item.id)}
            />
          ))}
        </GallerySection>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-md gap-4 rounded-[1.5rem] p-5 sm:max-w-md">
          <DialogHeader className="gap-1 pr-6">
            <DialogTitle className="truncate text-[15px]">
              {preview?.name}
            </DialogTitle>
          </DialogHeader>
          {preview ? (
            <div className="flex flex-col gap-3.5">
              <div className="flex max-h-72 items-center justify-center overflow-hidden rounded-[1.25rem] bg-muted/60 p-4 dark:bg-muted/25">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.dataUrl}
                  alt={preview.name}
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preview.tags.length > 0 ? (
                  preview.tags.map((tag) => (
                    <span
                      key={tag}
                      className="h-7 rounded-md bg-muted/60 px-2.5 text-[12px] leading-7 text-muted-foreground dark:bg-muted/25"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] text-muted-foreground">No tags</span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground">
                {[
                  preview.width && preview.height
                    ? `${preview.width}×${preview.height}`
                    : null,
                  formatBytes(preview.bytes),
                  preview.mimeType,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ) : null}
          <DialogFooter className="mx-0 mb-0 gap-2 border-0 bg-transparent p-0 sm:flex-row sm:items-center sm:justify-between">
            <div className={cn(sidebarSegmented, "h-10 w-auto shrink-0")}>
              <button
                type="button"
                className={cn(
                  sidebarSegmentedItem,
                  "px-3.5",
                  sidebarSegmentedItemIdle,
                )}
                onClick={() => preview && openEdit(preview)}
              >
                <Pencil className="mr-1.5 size-3.5" />
                Edit
              </button>
              <button
                type="button"
                className={cn(
                  sidebarSegmentedItem,
                  "px-3.5 text-destructive",
                  sidebarSegmentedItemIdle,
                )}
                onClick={() => preview && void removeAsset(preview.id)}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Delete
              </button>
            </div>
            <button
              type="button"
              disabled={!manager || !preview}
              className={cn(sidebarActionBtn, "h-10 px-4")}
              onClick={() => preview && void addToCanvas(preview)}
            >
              <Plus className="size-3.5" />
              Add to canvas
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-sm gap-4 rounded-[1.5rem] p-5">
          <DialogHeader className="gap-1 pr-6">
            <DialogTitle className="text-[15px]">Edit asset</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
              className={sidebarFieldInput}
            />
            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags, comma separated"
              className={sidebarFieldInput}
            />
          </div>
          <DialogFooter className="mx-0 mb-0 gap-2 border-0 bg-transparent p-0 sm:flex-row">
            <button
              type="button"
              className={cn(sidebarActionBtn, "h-10 flex-1")}
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(
                sidebarActionBtn,
                "h-10 flex-1 bg-foreground text-background hover:bg-foreground/90 dark:hover:bg-foreground/90",
              )}
              onClick={() => void saveEdit()}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssetTile({
  name,
  dataUrl,
  busy,
  disabled,
  onAdd,
  onPreview,
  onEdit,
  onRemove,
}: {
  name: string;
  dataUrl: string;
  busy: boolean;
  disabled: boolean;
  onAdd: () => void;
  onPreview?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative min-w-0">
      <button
        type="button"
        title={name}
        disabled={disabled}
        onClick={onAdd}
        className={cn(
          "flex aspect-square min-w-0 w-full items-center justify-center rounded-xl bg-muted/50 p-2 transition-colors dark:bg-muted/30",
          "hover:bg-muted/80 dark:hover:bg-muted/40 disabled:opacity-50",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={name}
            className="size-full object-contain"
            draggable={false}
          />
        )}
      </button>
      <div className="absolute right-1 top-1 flex flex-col gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        {onPreview ? (
          <button
            type="button"
            title="Preview"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex size-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground hover:text-foreground"
          >
            <Eye className="size-3" />
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex size-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3" />
          </button>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            title="Remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex size-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-3" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
