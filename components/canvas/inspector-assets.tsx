"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { FabricObject, Image as FabricImage } from "fabric";
import { ImagePlus, Loader2, Replace, Save, Trash2 } from "lucide-react";
import {
  createMediaAsset,
  deleteMediaAsset,
  listMediaAssets,
  type MediaAssetDTO,
} from "@/actions/assets";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { Button } from "@/components/ui/button";
import { useCanvasManager } from "@/context/canvas-manager";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { canFillShape } from "@/lib/canvas/objects";
import { cn } from "@/lib/utils";

type Props = {
  target: FabricObject;
  isImage: boolean;
  canFill: boolean;
};

async function toDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const res = await fetch(src);
  if (!res.ok) throw new Error("Couldn't read the image");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function InspectorAssets({ target, isImage, canFill }: Props) {
  const manager = useCanvasManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAssetDTO[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useEffectEvent(async () => {
    const result = await listMediaAssets();
    if (result.success) setAssets(result.assets);
  });

  useEffect(() => {
    void refresh();
  }, []);

  const isDeviceFrame =
    isImage && (target as FabricObject & { swibpRole?: string }).swibpRole === "frame";

  const currentSrc =
    isImage && typeof (target as FabricImage).getSrc === "function"
      ? (target as FabricImage).getSrc()
      : null;

  const saveCurrent = async () => {
    if (!currentSrc || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toDataUrl(currentSrc);
      const result = await createMediaAsset({
        name: "Canvas image",
        dataUrl,
        tags: ["canvas"],
      });
      if (result.success === false) {
        reportError(new Error(result.error), result.error);
        return;
      }
      await refresh();
    } catch (err) {
      reportError(err, messages.errors.addFile);
    } finally {
      setSaving(false);
    }
  };

  const applyAsset = async (asset: MediaAssetDTO) => {
    if (!manager || busyId) return;
    setBusyId(asset.id);
    try {
      if (isDeviceFrame) {
        await manager.objects.fillDeviceFrame(target as FabricImage, asset.dataUrl);
        manager.commit();
      } else if (isImage) {
        const img = target as FabricImage;
        const w = Math.max(1, img.getScaledWidth());
        const h = Math.max(1, img.getScaledHeight());
        const { left, top, originX, originY, angle } = img;
        await img.setSrc(asset.dataUrl, { crossOrigin: "anonymous" });
        img.set({
          scaleX: w / (img.width || 1),
          scaleY: h / (img.height || 1),
          left,
          top,
          originX,
          originY,
          angle,
        });
        img.setCoords();
        manager.canvas.requestRenderAll();
        manager.commit();
      } else if (canFill && canFillShape(target.type)) {
        await manager.objects.fillFrameWithImage(target, asset.dataUrl);
        manager.commit();
      } else {
        await manager.objects.addImage(asset.dataUrl, { maxSize: 480 });
        manager.commit();
      }
    } catch (err) {
      reportError(err, messages.errors.addAsset);
    } finally {
      setBusyId(null);
    }
  };

  const uploadNew = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await fileToDataUrl(file);
        const result = await createMediaAsset({
          name: file.name.replace(/\.[^.]+$/, "") || "Asset",
          dataUrl,
        });
        if (result.success === false) {
          reportError(new Error(result.error), result.error);
          break;
        }
        await refresh();
        await applyAsset(result.asset);
      }
    } catch (err) {
      reportError(err, messages.errors.addFile);
    }
  };

  const remove = async (id: string) => {
    const result = await deleteMediaAsset(id);
    if (result.success === false) {
      reportError(new Error(result.error), result.error);
      return;
    }
    await refresh();
  };

  return (
    <CollapsibleGroup id="rs-assets" title="Assets" defaultOpen>
      <div className="flex flex-col gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void uploadNew(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 flex-1 gap-1.5 rounded-full bg-muted/60 dark:bg-muted/25 text-[13px] hover:bg-muted/80 dark:hover:bg-muted/40"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-3.5" />
            {isImage || canFill ? "Replace" : "Upload"}
          </Button>
          {isImage && currentSrc ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 flex-1 gap-1.5 rounded-full bg-muted/60 dark:bg-muted/25 text-[13px] hover:bg-muted/80 dark:hover:bg-muted/40"
              disabled={saving}
              onClick={() => void saveCurrent()}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save
            </Button>
          ) : null}
        </div>

        {assets.length === 0 ? (
          <p className="px-1 text-[12px] leading-snug text-muted-foreground">
            Upload images here to reuse them on this object or across slides.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {assets.slice(0, 12).map((asset) => (
              <div key={asset.id} className="group relative">
                <button
                  type="button"
                  title={isImage || canFill ? `Apply ${asset.name}` : `Add ${asset.name}`}
                  disabled={busyId !== null}
                  onClick={() => void applyAsset(asset)}
                  className={cn(
                    "aspect-square w-full overflow-hidden rounded-xl bg-muted/60 dark:bg-muted/25 transition-colors",
                    "hover:bg-muted/80 dark:hover:bg-muted/40 disabled:opacity-50",
                  )}
                >
                  {busyId === asset.id ? (
                    <span className="flex size-full items-center justify-center">
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.dataUrl} alt="" className="size-full object-cover" />
                  )}
                </button>
                <button
                  type="button"
                  title="Remove"
                  onClick={() => void remove(asset.id)}
                  className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                >
                  <Trash2 className="size-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(isImage || canFill) && assets.length > 0 ? (
          <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
            <Replace className="size-3" />
            Tap a tile to {isImage ? "replace this image" : "fill the shape"}
          </p>
        ) : null}
      </div>
    </CollapsibleGroup>
  );
}
