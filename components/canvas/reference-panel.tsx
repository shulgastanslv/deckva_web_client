"use client";

import React, { useRef, useState } from "react";
import { Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useSlidesController } from "@/context/canvas-manager";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { runFromReferences } from "@/lib/ai/run-from-references";
import Image from "next/image";

/** Side panel — drop reference slides, then recreate a carousel from them. */
export function ReferencePanel() {
  const isOpen = useCanvasStore((s) => s.isReferenceOpen);
  const images = useCanvasStore((s) => s.referenceImages);
  const setOpen = useCanvasStore((s) => s.setReferenceOpen);
  const addImages = useCanvasStore((s) => s.addReferenceImages);
  const removeImage = useCanvasStore((s) => s.removeReferenceImage);
  const clearImages = useCanvasStore((s) => s.clearReferenceImages);
  const slidesController = useSlidesController();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const ingestFiles = async (list: FileList | File[] | null | undefined) => {
    if (!list) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setError(null);
    const urls = await Promise.all(
      files.map((file) => fileToDataUrl(file, { maxEdge: 1280, quality: 0.82 })),
    );
    addImages(urls);
  };

  const onRecreate = async () => {
    if (!slidesController || images.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await runFromReferences({
        images,
        slides: Math.max(images.length, 5),
        store: useCanvasStore,
        slidesController,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recreate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside
      className={cn(
        "flex w-lg shrink-0 flex-col border-l border-border/50 bg-background/80 backdrop-blur-md",
      )}
    >
      <div className="flex h-10 items-center justify-between px-3 border-b border-border/40">
        <span className="text-[14px] font-medium tracking-wider text-foreground">
          Drop reference slides here
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full"
          onClick={() => setOpen(false)}
          title="Close"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void ingestFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void ingestFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl bg-muted/30 px-3 py-6 transition-colors",
            dragOver && "bg-muted/60",
          )}
          title="Drag and drop reference images"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-muted/60">
            <UploadCloud className="size-4 text-muted-foreground" />
          </div>
          <p className="text-center text-[13px] text-muted-foreground">
            Drop reference slides here
          </p>
        </button>

        {images.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <span className="text-[12px] text-muted-foreground">
                {images.length} reference{images.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                className="text-[12px] text-muted-foreground hover:text-foreground"
                onClick={() => clearImages()}
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {images.map((url, index) => (
                <div
                  key={`${index}-${url.slice(0, 24)}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted/40"
                >
                  <Image
                    src={url}
                    alt={`Reference ${index + 1}`}
                    className="absolute inset-0 size-full object-cover"
                    width={160}
                    height={200}
                    unoptimized
                  />
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground"
                    onClick={() => removeImage(index)}
                    title="Remove"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="px-0.5 text-[12px] leading-snug text-muted-foreground">
            Add a few carousel screenshots, then recreate a new deck in that style.
          </p>
        )}

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={images.length === 0 || busy || !slidesController}
          onClick={() => void onRecreate()}
          className="h-9 w-full gap-1.5 rounded-full"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {busy ? "Recreating…" : "Recreate from references"}
        </Button>
      </div>
    </aside>
  );
}
