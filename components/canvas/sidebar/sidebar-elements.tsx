"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  Code2,
  ImageIcon,
  Link2,
  Loader2,
  Search,
  Shapes,
  Smartphone,
  Type,
} from "lucide-react";
import type { Group } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useElementLibrary,
  type ElementItem,
} from "@/components/canvas/use-element-library";
import type { FrameKind } from "@/lib/canvas/frames";
import { ImageUploadIcon } from "@/components/canvas/shapes-icons";
import { FramesPicker } from "@/components/canvas/sidebar/frames-picker";
import { CodeBlockSettings } from "@/components/canvas/code-block-inspector";
import { ChipScroll } from "@/components/canvas/sidebar/chip-scroll";
import { isCodeBlock } from "@/lib/canvas/code-block";
import { useSelectedObject } from "@/hooks/use-selected-object";

type Category = "photos" | "text" | "shapes" | "frames" | "code";

const CATEGORIES: {
  id: Category;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "text", label: "Text", icon: Type },
  { id: "shapes", label: "Shapes", icon: Shapes },
  { id: "frames", label: "Frames", icon: Smartphone },
  { id: "code", label: "Code", icon: Code2 },
];

const TEXT_PREVIEW: Record<
  string,
  { sample: string; className: string }
> = {
  heading: {
    sample: "Add a heading",
    className: "text-[26px] font-bold leading-tight tracking-tight",
  },
  subtitle: {
    sample: "Add a subheading",
    className: "text-[18px] font-semibold leading-snug",
  },
  paragraph: {
    sample: "Add a little bit of body text",
    className: "text-[15px] font-normal leading-relaxed text-muted-foreground",
  },
  quote: {
    sample: "“Add a quote”",
    className: "text-[17px] font-medium italic leading-snug",
  },
};

function filterItems(items: ElementItem[], search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      (item.title?.toLowerCase().includes(q) ?? false),
  );
}

export function SidebarElements() {
  const {
    manager,
    sections,
    fileInputRef,
    frameInputRef,
    isDragging,
    setIsDragging,
    imageUrl,
    setImageUrl,
    urlLoading,
    urlError,
    setUrlError,
    addImageFromFile,
    handleImageFileChange,
    handleFrameFileChange,
    addImageFromUrl,
  } = useElementLibrary();

  const { selectedObject } = useSelectedObject();
  const [category, setCategory] = useState<Category>("frames");
  const [search, setSearch] = useState("");

  const codeGroup =
    selectedObject && isCodeBlock(selectedObject)
      ? (selectedObject as Group)
      : null;

  const textItems = useMemo(() => {
    const section = sections.find((s) => s.id === "elements-text");
    return filterItems(section?.items ?? [], search);
  }, [sections, search]);

  const shapeItems = useMemo(() => {
    const section = sections.find((s) => s.id === "elements-shapes");
    return filterItems(section?.items ?? [], search);
  }, [sections, search]);

  const tabItems = useMemo(
    () =>
      CATEGORIES.map(({ id, label, icon: Icon }) => ({
        id,
        label,
        icon: <Icon />,
      })),
    [],
  );

  return (
    <div className="flex w-full min-w-0 max-w-full p-2 flex-col overflow-x-hidden text-[14px] text-foreground">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
        disabled={!manager}
      />
      <input
        type="file"
        ref={frameInputRef}
        onChange={handleFrameFileChange}
        accept="image/*"
        className="hidden"
        disabled={!manager}
      />

      <div className="sticky top-0 z-10 w-full min-w-0 space-y-3 bg-background/95 px-3 pt-3 pb-2 backdrop-blur-sm">
        {category !== "code" ? (
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-full bg-muted/70 px-3.5 dark:bg-muted/35">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                category === "photos"
                  ? "Search photos..."
                  : category === "text"
                    ? "Search text..."
                    : category === "shapes"
                      ? "Search shapes..."
                      : category === "frames"
                        ? "Search devices..."
                        : "Search..."
              }
              className="h-full min-w-0 w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
          </label>
        ) : null}

        <ChipScroll
          items={tabItems}
          value={category}
          onChange={(id) => {
            setCategory(id as Category);
            setSearch("");
          }}
          ariaLabel="Element categories"
        />
      </div>

      <div
        role="tabpanel"
        aria-label={CATEGORIES.find((item) => item.id === category)?.label}
        className="w-full min-w-0 space-y-3 px-3 pt-1 pb-4"
      >
        {category === "photos" ? (
          <div className="space-y-2.5">
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
                "flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-muted/60 px-4 py-6 text-center transition-colors disabled:opacity-40 dark:bg-muted/25",
                isDragging
                  ? "bg-muted/40"
                  : "hover:bg-muted/80 dark:hover:bg-muted/40",
              )}
            >
              <ImageUploadIcon size={44} className="shrink-0" />
              <span className="text-[15px] font-medium text-foreground/80">
                Upload or drop
              </span>
              <span className="text-[13px] text-muted-foreground">
                PNG, JPG — or paste with Ctrl+V
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              <div className="relative min-w-0 flex-1">
                <Link2 className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
                  className="h-11 rounded-full border-0 bg-muted/60 pl-10 text-[14px] shadow-none hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-muted/25 dark:hover:bg-muted/40"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!manager || urlLoading || !imageUrl.trim()}
                onClick={() => void addImageFromUrl()}
                className="h-11 shrink-0 rounded-full px-4 text-[14px]"
              >
                {urlLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
            {urlError ? (
              <p className="text-[14px] text-destructive">{urlError}</p>
            ) : null}
          </div>
        ) : null}

        {category === "text" ? (
          <div className="space-y-2">
            {textItems.map((item) => {
              const key = item.label.toLowerCase();
              const preview = TEXT_PREVIEW[key] ?? {
                sample: item.label,
                className: "text-[16px] font-medium",
              };
              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.title ?? item.label}
                  disabled={!manager}
                  onClick={item.action}
                  className="flex w-full min-w-0 items-center overflow-hidden rounded-2xl bg-muted/50 px-4 py-4 text-left transition-colors hover:bg-muted disabled:opacity-40 dark:bg-muted/25 dark:hover:bg-muted/40"
                >
                  <span className={cn("w-full truncate", preview.className)}>
                    {preview.sample}
                  </span>
                </button>
              );
            })}
            {textItems.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-muted-foreground">
                No text styles found
              </p>
            ) : null}
          </div>
        ) : null}

        {category === "shapes" ? (
          <div className="grid w-full grid-cols-3 gap-2">
            {shapeItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.title ?? item.label}
                  disabled={!manager}
                  onClick={item.action}
                  className="flex min-w-0 flex-col items-center gap-2 overflow-hidden rounded-2xl bg-muted/50 px-1.5 py-3 text-center transition-colors hover:bg-muted disabled:opacity-40 dark:bg-muted/25 dark:hover:bg-muted/40"
                >
                  <span className="flex h-14 w-full items-center justify-center text-foreground">
                    <Icon size={44} />
                  </span>
                  <span className="w-full truncate text-[12px] font-medium text-foreground">
                    {item.label}
                  </span>
                </button>
              );
            })}
            {shapeItems.length === 0 ? (
              <p className="col-span-3 py-10 text-center text-[14px] text-muted-foreground">
                No shapes found
              </p>
            ) : null}
          </div>
        ) : null}

        {category === "frames" ? (
          <FramesPicker
            disabled={!manager}
            search={search}
            onBackground={(color) => {
              void manager?.setBackground({ type: "solid", color });
            }}
            onPlace={(kind, layout, options) => {
              if (!manager) return;
              void (async () => {
                await manager.objects.addFrameLayout(
                  kind as FrameKind,
                  layout,
                  undefined,
                  { fit: options.fit },
                );
                manager.commit();
              })();
            }}
          />
        ) : null}

        {category === "code" ? (
          <CodeBlockSettings
            group={codeGroup}
            showAddButton
            onAdd={(options) => manager?.objects.addCodeBlock(options)}
            onOpenFrames={() => setCategory("frames")}
          />
        ) : null}
      </div>
    </div>
  );
}
