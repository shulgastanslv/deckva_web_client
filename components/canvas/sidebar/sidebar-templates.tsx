"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Loader2, LayoutGrid, FileJson, Crown, User } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  getTemplates,
  getTemplateById,
  getTemplateCategories,
  renameTemplate,
  duplicateTemplate,
  deleteTemplate,
  type TemplateListItem,
} from "@/actions/templates";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { parseImportedTemplate } from "@/lib/templates/parse";
import { useCanvasStore } from "@/store/useCanvasStore";
import { GalleryCard, GallerySection, carouselMeta, splitGallery } from "@/components/canvas/sidebar/gallery-card";
import { GalleryMenu } from "@/components/canvas/sidebar/gallery-menu";
import { FilterMenu } from "@/components/canvas/sidebar/filter-menu";
import { PreviewTemplateDialog } from "@/components/canvas/preview-template-dialog";
import { EditTemplateDialog } from "@/components/edit-template-dialog";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";

export function SidebarTemplates() {
  const { data: session } = useSession();
  const { applyPayload, insertTemplateSlide } = useApplyTemplate();
  const currentRatio = useCanvasStore((s) => s.currentRatio);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [ownership, setOwnership] = useState<"all" | "mine">("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [editTemplate, setEditTemplate] = useState<TemplateListItem | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    aspectRatio?: RatioKey;
    slides: FabricCanvasJSON[];
    thumbnails: Array<string | null>;
  } | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, catsRes] = await Promise.all([
        getTemplates({
          category: category === "all" ? undefined : category,
          search: search.trim() || undefined,
          mine: ownership === "mine",
        }),
        getTemplateCategories(),
      ]);

      if (!listRes.success) {
        alert("Couldn't load templates");
        setTemplates([]);
        return;
      }

      setTemplates(listRes.templates);
      if (catsRes.success) setCategories(catsRes.categories);
    } finally {
      setLoading(false);
    }
  }, [category, ownership, search]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchTemplates();
    }, search ? 220 : 0);
    return () => window.clearTimeout(t);
  }, [fetchTemplates, search]);

  useEffect(() => {
    const onChanged = () => void fetchTemplates();
    window.addEventListener("core:templates-changed", onChanged);
    return () => window.removeEventListener("core:templates-changed", onChanged);
  }, [fetchTemplates]);

  const handleRename = async (id: string, title: string) => {
    setTemplates((prev) => prev.map((tpl) => (tpl.id === id ? { ...tpl, title } : tpl)));
    const res = await renameTemplate(id, title);
    if (!res.success) void fetchTemplates();
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateTemplate(id);
    if (res.success) void fetchTemplates();
  };

  const handleDelete = async (tpl: TemplateListItem) => {
    if (!window.confirm(`Delete “${tpl.title}”? This cannot be undone.`)) return;
    setTemplates((prev) => prev.filter((item) => item.id !== tpl.id));
    const res = await deleteTemplate(tpl.id);
    if (!res.success) {
      alert("Failed to delete template");
      void fetchTemplates();
    }
  };

  const templateMenu = (tpl: TemplateListItem) => {
    const canManage = Boolean(
      session?.user && (tpl.authorId === session.user.id || session.user.role === "ADMIN"),
    );
    return (
      <div onClick={(event) => event.stopPropagation()}>
        <GalleryMenu
          title={tpl.title}
          createdAt={tpl.createdAt}
          createdBy={tpl.authorName}
          category={tpl.category}
          ratio={tpl.aspectRatio}
          canRename={canManage}
          onRename={canManage ? (title) => void handleRename(tpl.id, title) : undefined}
          onEdit={canManage ? () => setEditTemplate(tpl) : undefined}
          onDuplicate={session?.user ? () => void handleDuplicate(tpl.id) : undefined}
          onDelete={canManage ? () => void handleDelete(tpl) : undefined}
        />
      </div>
    );
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file || importing) return;
    setImporting(true);
    setError(null);
    try {
      const parsed = parseImportedTemplate(await file.text());
      if (parsed.ok === false) {
        setError(parsed.error);
        return;
      }

      const store = useCanvasStore.getState();
      setPreview({
        title: parsed.template.title?.trim() || file.name.replace(/\.json$/i, ""),
        aspectRatio: parsed.template.aspectRatio ?? store.currentRatio,
        slides: parsed.template.slides,
        thumbnails: parsed.template.thumbnails,
      });
    } catch (err) {
      console.error(err);
      setError("Couldn't import that template");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApply = async (id: string) => {
    if (applyingId) return;
    setApplyingId(id);
    setError(null);
    try {
      const res = await getTemplateById(id);
      if (!res.success) {
        alert("Couldn't open the template");
        return;
      }
      setPreview({
        title: res.template.title,
        aspectRatio: res.template.aspectRatio,
        slides: res.template.slides,
        thumbnails: res.template.thumbnails,
      });
    } finally {
      setApplyingId(null);
    }
  };

  const insertPreviewSlides = async (indices: number[]) => {
    if (!preview || applyingId) return;
    const ordered = [...new Set(indices)]
      .filter((index) => index >= 0 && index < preview.slides.length)
      .sort((a, b) => a - b);
    if (ordered.length === 0) return;
    setApplyingId("insert");
    try {
      for (const index of ordered) {
        await insertTemplateSlide(preview.slides[index]!, preview.thumbnails[index] ?? null);
      }
      setPreview(null);
    } catch (err) {
      console.error(err);
      setError("Couldn't insert those slides");
    } finally {
      setApplyingId(null);
    }
  };

  const replaceWithPreview = async () => {
    if (!preview || applyingId) return;
    setApplyingId("replace");
    try {
      await applyPayload({
        title: preview.title,
        aspectRatio: preview.aspectRatio ?? currentRatio,
        slides: preview.slides,
        thumbnails: preview.thumbnails,
      });
      const title = preview.title.trim();
      if (title) useCanvasStore.getState().setProjectTitle(title);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setError("Couldn't replace the carousel");
    } finally {
      setApplyingId(null);
    }
  };

  const tabs = useMemo(() => ["all", ...categories], [categories]);
  const filtering = search.trim().length > 0 || category !== "all" || ownership !== "all";
  const { recent, more } = splitGallery(templates, showAll || filtering);

  return (
    <div className="flex flex-col gap-4 p-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          void handleImportFile(file);
        }}
      />

      <div className="flex min-w-0 items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="h-8 w-full min-w-0 rounded-full bg-muted/50 pl-8 pr-7 text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {session?.user ? (
          <FilterMenu
            icon={User}
            value={ownership}
            onChange={(id) => setOwnership(id === "mine" ? "mine" : "all")}
            groups={[
              {
                label: "Ownership",
                options: [
                  { id: "all", label: "All" },
                  { id: "mine", label: "Mine" },
                ],
              },
            ]}
          />
        ) : null}
        <FilterMenu
          icon={LayoutGrid}
          value={category}
          onChange={setCategory}
          groups={[
            {
              label: "Category",
              options: tabs.map((tab) => ({
                id: tab,
                label: tab === "all" ? "All" : tab,
              })),
            },
          ]}
        />
        <button
          type="button"
          disabled={importing}
          title="Import a template from a JSON file"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            void handleImportFile(file);
          }}
          className="flex h-8 items-center justify-center gap-1.5 rounded-full  px-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
        >
          {importing ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <FileJson className="size-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-[13px] text-destructive px-1">{error}</p>
      )}

      {loading && templates.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="py-6 px-2 text-center space-y-3">
          <p className="text-[13px] text-muted-foreground">
            {ownership === "mine"
              ? "You haven’t published any templates yet."
              : "No templates found. Seed built-in presets or publish your own through Publish."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <GallerySection
            title={filtering ? "Templates" : "Recently used"}
            action={!filtering && more.length > 0 ? (showAll ? "Show less" : "See all") : undefined}
            onAction={() => setShowAll((open) => !open)}
          >
            {recent.map((tpl) => (
              <GalleryCard
                key={tpl.id}
                title={tpl.title}
                meta={carouselMeta(tpl.slideCount, tpl.aspectRatio)}
                previewUrl={tpl.previewUrl}
                busy={applyingId === tpl.id}
                onClick={() => void handleApply(tpl.id)}
                menu={templateMenu(tpl)}
                badge={
                  tpl.badge ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border/60">
                      <Crown className="size-2.5" />
                    </span>
                  ) : null
                }
              />
            ))}
          </GallerySection>
          {more.length > 0 ? (
            <GallerySection title="Templates">
              {more.map((tpl) => (
                <GalleryCard
                  key={tpl.id}
                  title={tpl.title}
                  meta={carouselMeta(tpl.slideCount, tpl.aspectRatio)}
                  previewUrl={tpl.previewUrl}
                  busy={applyingId === tpl.id}
                  onClick={() => void handleApply(tpl.id)}
                  menu={templateMenu(tpl)}
                  badge={
                    tpl.badge ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border/60">
                      <Crown className="size-2.5" />
                    </span>
                    ) : null
                  }
                />
              ))}
            </GallerySection>
          ) : null}
        </div>
      )}
      <PreviewTemplateDialog
        open={preview != null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        title={preview?.title ?? "Template"}
        aspectRatio={preview?.aspectRatio}
        currentRatio={currentRatio}
        slides={preview?.slides ?? []}
        thumbnails={preview?.thumbnails ?? []}
        busy={applyingId === "insert" || applyingId === "replace"}
        onInsert={(indices) => void insertPreviewSlides(indices)}
        onReplace={() => void replaceWithPreview()}
      />
      <EditTemplateDialog
        open={editTemplate != null}
        onOpenChange={(open) => {
          if (!open) setEditTemplate(null);
        }}
        template={editTemplate}
        onSaved={() => void fetchTemplates()}
      />
    </div>
  );
}
