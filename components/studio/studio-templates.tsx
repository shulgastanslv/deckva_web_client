"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  getTemplateCategories,
  getTemplates,
  type TemplateListItem,
} from "@/actions/templates";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StudioTemplates() {
  const router = useRouter();
  const { status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, catsRes] = await Promise.all([
        getTemplates({
          category: category === "all" ? undefined : category,
          search: search.trim() || undefined,
        }),
        getTemplateCategories(),
      ]);
      if (listRes.success) setTemplates(listRes.templates);
      else setTemplates([]);
      if (catsRes.success) setCategories(catsRes.categories);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchTemplates();
    }, search ? 220 : 0);
    return () => window.clearTimeout(t);
  }, [fetchTemplates, search]);

  const tabs = useMemo(() => ["all", ...categories], [categories]);

  const openTemplate = (id: string) => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    setOpeningId(id);
    router.push(`/studio/editor?template=${id}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-8 pb-16 pt-16">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Templates</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Pick a layout — it opens in the editor as your starting carousel.
          </p>
        </div>

        <div className="relative mt-8 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="h-10 rounded-full border-border bg-card pl-10 pr-10"
          />
          {search ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCategory(tab)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                category === tab
                  ? "border-border bg-secondary text-foreground"
                  : "border-border/70 text-muted-foreground hover:bg-muted",
              )}
            >
              {tab === "all" ? "All" : tab}
            </button>
          ))}
        </div>

        {loading && templates.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <p className="py-16 text-center text-base text-muted-foreground">
            No templates found
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                disabled={openingId === tpl.id}
                onClick={() => openTemplate(tpl.id)}
                className="group flex flex-col gap-1.5 text-left disabled:opacity-60"
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border bg-muted shadow-none">
                  {tpl.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tpl.previewUrl}
                      alt=""
                      className="size-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium leading-tight text-muted-foreground">
                      {tpl.title}
                    </span>
                  )}
                  {openingId === tpl.id ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Loader2 className="size-3.5 animate-spin" />
                    </div>
                  ) : null}
                </div>
                <div className="px-0.5">
                  <p className="truncate text-sm font-semibold">{tpl.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {tpl.slideCount} slides · {tpl.aspectRatio}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
