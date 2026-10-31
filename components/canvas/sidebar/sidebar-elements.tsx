"use client";

import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollapsibleGroup } from "@/components/ui/collapsible-group";
import { cn } from "@/lib/utils";
import { useElementLibrary } from "@/components/canvas/use-element-library";

export function SidebarElements() {
  const {
    manager,
    sections,
    frames,
    fileInputRef,
    frameInputRef,
    frameDragging,
    setFrameDragging,
    isDragging,
    setIsDragging,
    imageUrl,
    setImageUrl,
    urlLoading,
    urlError,
    setUrlError,
    addImageFromFile,
    fillFrameFromFile,
    handleImageFileChange,
    handleFrameFileChange,
    addImageFromUrl,
  } = useElementLibrary();

  return (
    <div className="flex flex-col text-[13px] text-foreground">
      <CollapsibleGroup id="elements-image" title="Image">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          className="hidden"
          disabled={!manager}
        />

        <button
          type="button"
          disabled={!manager}
          title="Upload, drop, or paste an image with Ctrl+V"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (manager) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) addImageFromFile(file);
          }}
          className={cn(
            "flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors disabled:opacity-40",
            isDragging
              ? "border-foreground/30 bg-muted"
              : "border-border/70 hover:border-foreground/20 hover:bg-muted/60",
          )}
        >
          <ImagePlus className="size-5 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground/80">Upload or drop</span>
          <span className="text-[13px] text-muted-foreground">PNG, JPG</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste image URL"
              value={imageUrl}
              disabled={!manager}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setUrlError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addImageFromUrl();
                }
              }}
              className="h-8 rounded-full border-border/50 bg-muted/30 pl-8 text-[13px] shadow-none"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!manager || urlLoading || !imageUrl.trim()}
            onClick={() => void addImageFromUrl()}
            className="h-8 shrink-0 rounded-full px-3 text-[13px]"
          >
            {urlLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
          </Button>
        </div>
        {urlError && <p className="text-[13px] text-destructive">{urlError}</p>}
      </CollapsibleGroup>

      <CollapsibleGroup id="elements-frames" title="Frames">
        <input
          type="file"
          ref={frameInputRef}
          onChange={handleFrameFileChange}
          accept="image/*"
          className="hidden"
          disabled={!manager}
        />
        <div className="grid grid-cols-4 gap-1">
          {frames.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              title={label}
              disabled={!manager}
              onClick={() => manager?.objects.addFrame(kind)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="max-w-full truncate text-[13px] leading-none">{label}</span>
            </button>
          ))}
        </div>
      </CollapsibleGroup>

      {sections.map((section) => (
        <CollapsibleGroup key={section.id} id={section.id} title={section.title}>
          <div className="grid grid-cols-4 gap-1">
            {section.items.map(({ label, icon: Icon, action, title }) => (
              <button
                key={label}
                type="button"
                title={title ?? label}
                onClick={action}
                disabled={!manager}
                className="flex flex-col items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="max-w-full truncate text-[13px] leading-none">{label}</span>
              </button>
            ))}
          </div>
        </CollapsibleGroup>
      ))}
    </div>
  );
}
