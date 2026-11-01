"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { GallerySection } from "@/components/canvas/sidebar/gallery-card";
import { useCanvasManager } from "@/context/canvas-manager";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import {
  ASSETS_STORAGE_KEY,
  readUserAssets,
  rememberAsset,
  removeAsset,
  type UserAsset,
} from "@/lib/canvas/user-assets";
import {
  BRAND_KIT_CHANGED,
  loadBrandKit,
  type BrandKitLogo,
} from "@/lib/studio/brand-kit";
import { cn } from "@/lib/utils";

function AssetTile({
  item,
  busy,
  disabled,
  onAdd,
  onRemove,
}: {
  item: { id: string; name: string; dataUrl: string };
  busy: boolean;
  disabled: boolean;
  onAdd: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative min-w-0">
      <button
        type="button"
        title={item.name}
        disabled={disabled}
        onClick={onAdd}
        className={cn(
          "flex aspect-square min-w-0 w-full items-center justify-center rounded-xl bg-muted/25 p-2 transition-colors",
          "hover:bg-muted/55 disabled:opacity-50",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.dataUrl}
            alt={item.name}
            className="size-full object-contain"
            draggable={false}
          />
        )}
      </button>
      {onRemove ? (
        <button
          type="button"
          title="Remove asset"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <Trash2 className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

export function SidebarAssets() {
  const manager = useCanvasManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [logos, setLogos] = useState<BrandKitLogo[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAssets(readUserAssets(window.localStorage.getItem(ASSETS_STORAGE_KEY)));
    setLogos(loadBrandKit().logos);
    const onBrand = () => setLogos(loadBrandKit().logos);
    window.addEventListener(BRAND_KIT_CHANGED, onBrand);
    return () => window.removeEventListener(BRAND_KIT_CHANGED, onBrand);
  }, []);

  const persist = (next: UserAsset[]) => {
    setAssets(next);
    window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(next));
  };

  const addFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    try {
      let next = assets;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await fileToDataUrl(file);
        const asset: UserAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name.replace(/\.[^.]+$/, "") || "Asset",
          dataUrl,
          createdAt: Date.now(),
        };
        next = rememberAsset(next, asset);
      }
      persist(next);
    } catch (err) {
      setError(messages.errors.addFile);
      reportError(err, messages.errors.addFile);
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

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden p-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={!manager}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center text-[13px] transition-colors disabled:opacity-40",
          dragging
            ? "border-foreground/30 bg-muted"
            : "border-border/70 hover:border-foreground/20 hover:bg-muted/60",
        )}
      >
        <ImagePlus className="size-5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground/80">Upload or drop</span>
        <span className="text-muted-foreground">PNG, JPG, SVG</span>
      </button>

      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

      {logos.length > 0 ? (
        <GallerySection title="Brand logos">
          {logos.map((item) => (
            <AssetTile
              key={item.id}
              item={item}
              busy={loadingId === item.id}
              disabled={loadingId !== null}
              onAdd={() => void addToCanvas(item)}
            />
          ))}
        </GallerySection>
      ) : null}

      {assets.length === 0 ? (
        logos.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Upload logos and photos here, or add them in Brand kit.
          </p>
        ) : null
      ) : (
        <GallerySection title="Your assets">
          {assets.map((item) => (
            <AssetTile
              key={item.id}
              item={item}
              busy={loadingId === item.id}
              disabled={loadingId !== null}
              onAdd={() => void addToCanvas(item)}
              onRemove={() => persist(removeAsset(assets, item.id))}
            />
          ))}
        </GallerySection>
      )}
    </div>
  );
}
