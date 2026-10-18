"use client";

import React, { useRef } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";
import Image from "next/image";

/** Side panel opened from the split-screen toolbar button — load a reference image. */
export function ReferencePanel() {
  const isOpen = useCanvasStore((s) => s.isReferenceOpen);
  const imageUrl = useCanvasStore((s) => s.referenceImageUrl);
  const setOpen = useCanvasStore((s) => s.setReferenceOpen);
  const setImageUrl = useCanvasStore((s) => s.setReferenceImageUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const onFile = (file: File | undefined) => {
    if (!file?.type.startsWith("image/")) return;
    if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
  };

  return (
    <aside
      className={cn(
        "flex w-lg shrink-0 flex-col border-l border-border/50 bg-background/80 backdrop-blur-md",
      )}
    >
      <div className="flex h-10 items-center justify-between px-3 border-b border-border/40">
        <span className="text-[14px] font-medium tracking-wider text-foreground">
          Reference
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

      <div className="flex flex-1 flex-col gap-2 p-3 min-h-0">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {imageUrl ? (
          <div className="relative flex-1 min-h-[160px] rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt="Reference"
              className="absolute inset-0 size-full object-contain"
              width={100}
              height={100}
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-[13px] rounded-full"
                onClick={() => fileRef.current?.click()}
                title="Replace"
              >
                Replace
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-[13px] rounded-full"
                onClick={() => {
                  if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
                  setImageUrl(null);
                }}
                title="Remove"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
            className="flex flex-1 min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl  transition-colors"
            title="Drag and drop an image or select a file"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/70 shadow-xs hover:scale-105 transition-transform cursor-pointer">
              <UploadCloud className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[13px] text-muted-foreground">
                Drag and drop an image or select a file
              </p>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
