"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Code as Code2,
  Image as ImageIcon,
  Link as Link2,
  SpinnerGap as Loader2,
  MagnifyingGlass as Search,
  Shapes,
  DeviceMobile as Smartphone,
  TextT as Type,
} from "@phosphor-icons/react";
import type { Group } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useElementLibrary,
  type ElementItem,
} from "@/components/canvas/use-element-library";
import type { FrameKind } from "@/lib/canvas/frames";
import { FramesPicker } from "@/components/canvas/sidebar/frames-picker";
import { CodeBlockSettings } from "@/components/canvas/code-block-inspector";
import { GalleryCard, GallerySection } from "@/components/canvas/sidebar/gallery-card";
import { UploadOrDrop } from "@/components/canvas/sidebar/upload-or-drop";
import {
  navIconClass,
  sidebarFieldInput,
  sidebarPanel,
} from "@/components/canvas/sidebar/sidebar-ui";
import { isCodeBlock } from "@/lib/canvas/code-block";
import { useSelectedObject } from "@/hooks/use-selected-object";
import {
  clearRecentPhotos,
  readRecentPhotos,
  resolveRecentPlaceSrc,
  RECENT_PHOTOS_CHANGED,
  type RecentPhoto,
} from "@/lib/canvas/recent-photos";

type Category = "photos" | "text" | "shapes" | "frames" | "code";

const CATEGORIES: {
  id: Category;
  labelKey: Category;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "photos", labelKey: "photos", icon: ImageIcon },
  { id: "text", labelKey: "text", icon: Type },
  { id: "shapes", labelKey: "shapes", icon: Shapes },
  { id: "frames", labelKey: "frames", icon: Smartphone },
  { id: "code", labelKey: "code", icon: Code2 },
];

const SEARCH_PLACEHOLDER: Record<
  Category,
  "searchPhotos" | "searchText" | "searchShapes" | "searchDevices" | "searchThemes"
> = {
  photos: "searchPhotos",
  text: "searchText",
  shapes: "searchShapes",
  frames: "searchDevices",
  code: "searchThemes",
};

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
  const t = useTranslations("editor.elements");
  const tc = useTranslations("common");
  const {
    manager,
    sections,
    frameInputRef,
    imageUrl,
    setImageUrl,
    urlLoading,
    urlError,
    setUrlError,
    addImageFromFile,
    handleFrameFileChange,
    addImageFromUrl,
    placeRecentPhoto,
  } = useElementLibrary();

  const { selectedObject } = useSelectedObject();
  const [category, setCategory] = useState<Category>("photos");
  const [search, setSearch] = useState("");
  const [recentPhotos, setRecentPhotos] = useState<RecentPhoto[]>([]);

  useEffect(() => {
    const sync = () => setRecentPhotos(readRecentPhotos());
    sync();
    window.addEventListener(RECENT_PHOTOS_CHANGED, sync);
    return () => window.removeEventListener(RECENT_PHOTOS_CHANGED, sync);
  }, []);

  const filteredRecent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recentPhotos;
    return recentPhotos.filter(
      (item) =>
        item.placeSrc.toLowerCase().includes(q) ||
        item.src.toLowerCase().includes(q),
    );
  }, [recentPhotos, search]);

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

  return (
    <div className={cn(sidebarPanel, "w-full max-w-full overflow-x-hidden")}>
      <input
        type="file"
        ref={frameInputRef}
        onChange={handleFrameFileChange}
        accept="image/*"
        className="hidden"
        disabled={!manager}
      />

      <div className="sticky top-0 z-10 w-full min-w-0 space-y-2 bg-background/95 pb-0.5 backdrop-blur-sm">
        <div
          role="tablist"
          aria-label={t("elementCategory")}
          className="grid grid-cols-5 gap-1"
        >
          {CATEGORIES.map(({ id, labelKey, icon: Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                title={t(labelKey)}
                onClick={() => {
                  setCategory(id);
                  setSearch("");
                }}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-md px-0.5 py-2 transition-colors",
                  active
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <Icon className={navIconClass} />
              </button>
            );
          })}
        </div>

        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(SEARCH_PLACEHOLDER[category])}
            className={cn(sidebarFieldInput, "pl-9")}
          />
        </div>
      </div>

      <div
        role="tabpanel"
        aria-label={t(category)}
        className="w-full min-w-0"
      >
        {category === "photos" ? (
          <div className="space-y-2.5">
            <UploadOrDrop
              disabled={!manager}
              title={t("uploadOrDrop")}
              hint={t("pasteHint")}
              minHeightClass="min-h-32"
              onFiles={(files) => {
                const file = files instanceof FileList ? files[0] : files[0];
                if (file) addImageFromFile(file);
              }}
            />

            <div className="flex items-center gap-1.5">
              <div className="relative min-w-0 flex-1">
                <Link2 className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder={t("pasteImageUrl")}
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
                  className="rounded-md border-0 bg-muted/60 pl-10 text-[13px] shadow-none hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-muted/25 dark:hover:bg-muted/40"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!manager || urlLoading || !imageUrl.trim()}
                onClick={() => void addImageFromUrl()}
                className="shrink-0 rounded-md px-3.5 text-[13px]"
              >
                {urlLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  tc("add")
                )}
              </Button>
            </div>
            {urlError ? (
              <p className="text-[13px] text-destructive">{urlError}</p>
            ) : null}

            {filteredRecent.length > 0 ? (
              <GallerySection
                title={t("recentlyUsed")}
                action={tc("clear")}
                onAction={() => clearRecentPhotos()}
              >
                {filteredRecent.map((item, index) => (
                  <GalleryCard
                    key={item.id}
                    title={`Photo ${index + 1}`}
                    previewUrl={item.src}
                    onClick={() => {
                      if (!manager) return;
                      placeRecentPhoto(resolveRecentPlaceSrc(item));
                    }}
                  />
                ))}
              </GallerySection>
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
              <p className="py-10 text-center text-[13px] text-muted-foreground">
                {t("noTextStyles")}
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
                  className="flex min-w-0 flex-col items-center gap-2 overflow-hidden rounded-2xl bg-muted/50 px-1.5 py-3 text-center transition-colors hover:bg-muted/70 disabled:opacity-40 dark:bg-muted/30 dark:hover:bg-muted/45"
                >
                  <span className="flex h-14 w-full items-center justify-center text-foreground">
                    <Icon size={24} />
                  </span>
                  <span className="w-full truncate text-[12px] font-medium text-foreground">
                    {item.label}
                  </span>
                </button>
              );
            })}
            {shapeItems.length === 0 ? (
              <p className="col-span-3 py-10 text-center text-[13px] text-muted-foreground">
                {t("noShapes")}
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
            search={search}
            onAdd={(options) => manager?.objects.addCodeBlock(options)}
          />
        ) : null}
      </div>
    </div>
  );
}
