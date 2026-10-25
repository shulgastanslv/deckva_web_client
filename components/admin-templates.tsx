"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FolderSync, Loader2, Search, Trash2, Upload } from "lucide-react";

import {
  deleteTemplate,
  getTemplates,
  importBuiltinTemplates,
  importTemplateJson,
  updateTemplateMeta,
  type TemplateListItem,
} from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Built-in",
  ...PLATFORMS.map((platform) => platform.id),
] as const;

export function AdminTemplates() {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { title: string; category: string; badge: string }>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await getTemplates({
        category: category === "all" ? undefined : category,
        search: search.trim() || undefined,
      });
      if (!res.success) {
        setTemplates([]);
        setMessage("Failed to load templates");
        return;
      }
      setTemplates(res.templates);
      const next: Record<string, { title: string; category: string; badge: string }> = {};
      for (const tpl of res.templates) {
        next[tpl.id] = {
          title: tpl.title,
          category: tpl.category,
          badge: tpl.badge ?? "",
        };
      }
      setDrafts(next);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, search ? 220 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const categoryOptions = useMemo(() => {
    const extras = templates
      .map((tpl) => tpl.category)
      .filter((value) => !CATEGORIES.includes(value as (typeof CATEGORIES)[number]));
    return [...CATEGORIES, ...Array.from(new Set(extras))];
  }, [templates]);

  const save = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setBusyId(id);
    setMessage(null);
    try {
      const res = await updateTemplateMeta(id, {
        title: draft.title,
        category: draft.category,
        badge: draft.badge,
      });
      if (!res.success) {
        setMessage("Failed to save template");
        return;
      }
      setMessage("Template saved");
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusyId(id);
    setMessage(null);
    try {
      const res = await deleteTemplate(id);
      if (!res.success) {
        setMessage("Failed to delete template");
        return;
      }
      setMessage("Template deleted");
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const syncFromDisk = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await importBuiltinTemplates();
      if (!res.success) {
        setMessage("Import failed");
        return;
      }
      const errNote =
        res.errors.length > 0 ? ` · ${res.errors.length} file error(s)` : "";
      setMessage(
        `Synced templates: +${res.created} new, ${res.updated} updated${errNote}`,
      );
      await load();
    } finally {
      setSeeding(false);
    }
  };

  const onUploadJson = async (file: File | undefined) => {
    if (!file) return;
    setSeeding(true);
    setMessage(null);
    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        setMessage("That file is not valid JSON");
        return;
      }
      const res = await importTemplateJson({
        json,
        sourceKey: `upload:${file.name}`,
        badge: "Imported",
      });
      if (!res.success) {
        setMessage("Import failed");
        return;
      }
      setMessage(
        res.action === "updated"
          ? `Updated template from ${file.name}`
          : `Imported ${file.name}`,
      );
      await load();
    } finally {
      setSeeding(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates"
            className="h-9 rounded-full bg-muted/50 pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[160px] rounded-full bg-muted/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-3"
          onClick={() => void load()}
        >
          Refresh
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-9 rounded-full px-3"
          disabled={seeding}
          onClick={() => void syncFromDisk()}
        >
          {seeding ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FolderSync className="size-3.5" />
          )}
          Sync templates/
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-9 rounded-full px-3"
          disabled={seeding}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Upload JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => void onUploadJson(event.target.files?.[0])}
        />
      </div>

      {message ? <p className="text-[13px] text-muted-foreground">{message}</p> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading…
        </div>
      ) : templates.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-muted-foreground">
          No templates found.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((tpl) => {
            const draft = drafts[tpl.id] ?? {
              title: tpl.title,
              category: tpl.category,
              badge: tpl.badge ?? "",
            };
            const busy = busyId === tpl.id;
            return (
              <li
                key={tpl.id}
                className="rounded-2xl bg-muted/50 p-3.5"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {tpl.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tpl.previewUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                        No preview
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Title</Label>
                        <Input
                          value={draft.title}
                          disabled={busy}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [tpl.id]: { ...draft, title: event.target.value },
                            }))
                          }
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Category</Label>
                        <Select
                          value={draft.category}
                          disabled={busy}
                          onValueChange={(value) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [tpl.id]: { ...draft, category: value },
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Badge</Label>
                      <Input
                        value={draft.badge}
                        disabled={busy}
                        placeholder="Optional badge"
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [tpl.id]: { ...draft, badge: event.target.value },
                          }))
                        }
                        className="h-8"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <p className="text-[10px] text-muted-foreground">
                        {tpl.slideCount} slides · {tpl.aspectRatio}
                        {tpl.authorName ? ` · ${tpl.authorName}` : ""}
                        {" · "}
                        {new Date(tpl.createdAt).toLocaleDateString()}
                        {tpl.builtin ? " · Built-in" : ""}
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busy}
                          onClick={() => void save(tpl.id)}
                          className="rounded-full"
                        >
                          {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busy}
                          onClick={() => void remove(tpl.id, tpl.title)}
                          className={cn("rounded-full")}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
