"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { FabricObject, Image as FabricImage } from "fabric";
import {
  Image as ImagePlus,
  SpinnerGap as Loader2,
  ArrowsLeftRight as Replace,
  FloppyDisk as Save,
  Trash as Trash2,
} from "@phosphor-icons/react";
import {
  createMediaAsset,
  deleteMediaAsset,
  listMediaAssets,
  type MediaAssetDTO,
} from "@/actions/assets";
import {
  importGoogleDriveFileAction,
  listConnectors,
  listGoogleDriveFilesAction,
  type GoogleDriveImageFile,
} from "@/actions/connectors";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { Button } from "@/components/ui/button";
import { useCanvasManager } from "@/context/canvas-manager";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { canFillShape } from "@/lib/canvas/objects";
import { cn } from "@/lib/utils";

function driveThumbUrl(fileId: string) {
  return `/api/connectors/google-drive/files/${encodeURIComponent(fileId)}?thumb=1`;
}

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
  const t = useTranslations("editor.assets");
  const tc = useTranslations("common");
  const manager = useCanvasManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAssetDTO[]>([]);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveImageFile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useEffectEvent(async () => {
    const result = await listMediaAssets();
    if (result.success) setAssets(result.assets);
  });

  const refreshDrive = useEffectEvent(async () => {
    const connectors = await listConnectors();
    if (!connectors.success) return;
    const drive = connectors.connectors.find((c) => c.id === "google-drive");
    if (drive?.status !== "connected") {
      setDriveFiles([]);
      return;
    }
    const listed = await listGoogleDriveFilesAction();
    if (listed.success && listed.connected) {
      setDriveFiles(listed.files.slice(0, 8));
    }
  });

  useEffect(() => {
    void refresh();
    void refreshDrive();
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

  const applyDataUrl = async (dataUrl: string) => {
    if (!manager) return;
    if (isDeviceFrame) {
      await manager.objects.fillDeviceFrame(target as FabricImage, dataUrl);
      manager.commit();
      return;
    }
    if (isImage) {
      const img = target as FabricImage;
      const w = Math.max(1, img.getScaledWidth());
      const h = Math.max(1, img.getScaledHeight());
      const { left, top, originX, originY, angle } = img;
      await img.setSrc(dataUrl, { crossOrigin: "anonymous" });
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
      return;
    }
    if (canFill && canFillShape(target.type)) {
      await manager.objects.fillFrameWithImage(target, dataUrl);
      manager.commit();
      return;
    }
    await manager.objects.addImage(dataUrl, { maxSize: 480 });
    manager.commit();
  };

  const applyAsset = async (asset: MediaAssetDTO) => {
    if (!manager || busyId) return;
    setBusyId(asset.id);
    try {
      await applyDataUrl(asset.dataUrl);
    } catch (err) {
      reportError(err, messages.errors.addAsset);
    } finally {
      setBusyId(null);
    }
  };

  const applyDriveFile = async (file: GoogleDriveImageFile) => {
    if (!manager || busyId) return;
    setBusyId(file.id);
    try {
      const res = await fetch(
        `/api/connectors/google-drive/files/${encodeURIComponent(file.id)}`,
      );
      if (!res.ok) throw new Error(messages.errors.addFile);
      const blob = await res.blob();
      const localName = file.name.replace(/\.[^.]+$/, "") || file.name;
      const localFile = new File([blob], file.name || "drive-image", {
        type: blob.type || file.mimeType || "image/png",
      });
      const dataUrl = await fileToDataUrl(localFile, {
        maxEdge: 1800,
        quality: 0.9,
      });
      const imported = await importGoogleDriveFileAction({
        fileId: file.id,
        dataUrl,
        name: localName,
      });
      if (imported.success === false) {
        reportError(new Error(imported.error), imported.error);
        return;
      }
      await applyDataUrl(imported.asset.dataUrl);
      await refresh();
    } catch (err) {
      reportError(err, messages.errors.addFile);
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
    <CollapsibleGroup id="rs-assets" title={t("title")} defaultOpen>
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
            className="h-10 flex-1 gap-1.5 rounded-md bg-muted/60 dark:bg-muted/25 text-[13px] hover:bg-muted/80 dark:hover:bg-muted/40"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-3.5" />
            {isImage || canFill ? t("replace") : t("upload")}
          </Button>
          {isImage && currentSrc ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 flex-1 gap-1.5 rounded-md bg-muted/60 dark:bg-muted/25 text-[13px] hover:bg-muted/80 dark:hover:bg-muted/40"
              disabled={saving}
              onClick={() => void saveCurrent()}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {tc("save")}
            </Button>
          ) : null}
        </div>

        {assets.length === 0 && driveFiles.length === 0 ? (
          <p className="px-1 text-[12px] leading-snug text-muted-foreground">
            {t("uploadHint")}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {assets.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5">
                {assets.slice(0, 12).map((asset) => (
                  <div key={asset.id} className="group relative">
                    <button
                      type="button"
                      title={
                        isImage || canFill
                          ? `${t("replace")} ${asset.name}`
                          : `${t("addToCanvas")} ${asset.name}`
                      }
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
                      title={t("remove")}
                      onClick={() => void remove(asset.id)}
                      className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-md bg-background/90 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      <Trash2 className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {driveFiles.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <p className="px-0.5 text-[11px] font-medium text-muted-foreground">
                  {t("googleDrive")}
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {driveFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      title={`${t("googleDrive")}: ${file.name}`}
                      disabled={busyId !== null}
                      onClick={() => void applyDriveFile(file)}
                      className={cn(
                        "aspect-square w-full overflow-hidden rounded-xl bg-muted/60 dark:bg-muted/25 transition-colors",
                        "hover:bg-muted/80 dark:hover:bg-muted/40 disabled:opacity-50",
                      )}
                    >
                      {busyId === file.id ? (
                        <span className="flex size-full items-center justify-center">
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={driveThumbUrl(file.id)}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {(isImage || canFill) && assets.length > 0 ? (
          <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
            <Replace className="size-3" />
            {isImage ? t("replaceImage") : t("fillShape")}
          </p>
        ) : null}
      </div>
    </CollapsibleGroup>
  );
}
