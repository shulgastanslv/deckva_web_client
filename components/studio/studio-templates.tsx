"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { getTemplates, type TemplateListItem } from "@/actions/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/categories";
import { AuthModal } from "@/components/auth";
import { StudioBoardGrid } from "@/components/studio/projects/studio-board-grid";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioPageHeader } from "@/components/studio/ui/studio-page-header";
import { StudioTab } from "@/components/studio/ui/studio-tab";

export function StudioTemplates() {
  const router = useRouter();
  const { status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    const onSidebarSearch = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof query === "string") setSearch(query);
    };
    window.addEventListener("studio:sidebar-search", onSidebarSearch);
    return () =>
      window.removeEventListener("studio:sidebar-search", onSidebarSearch);
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await getTemplates({
        category: category === "all" ? undefined : category,
        search: search.trim() || undefined,
      });
      setTemplates(listRes.success ? listRes.templates : []);
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

  const openTemplate = (id: string) => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    setOpeningId(id);
    router.push(`/studio/editor?template=${id}`);
  };

  return (
    <StudioContent>
      <StudioPageHeader
        title="Templates"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search templates"
        tabs={
          <>
            <StudioTab active={category === "all"} onClick={() => setCategory("all")}>
              All
            </StudioTab>
            {TEMPLATE_CATEGORIES.map((tab) => (
              <StudioTab
                key={tab}
                active={category === tab}
                onClick={() => setCategory(tab)}
              >
                {tab}
              </StudioTab>
            ))}
          </>
        }
      />

      <StudioContentBody>
        {loading && templates.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center">
            <p
              className="text-[22px] text-neutral-950 dark:text-foreground"
              style={{
                fontFamily:
                  "var(--font-studio-serif), ui-serif, Georgia, serif",
              }}
            >
              No templates
            </p>
            <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">
              Try another category or search.
            </p>
          </div>
        ) : (
          <StudioBoardGrid>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                disabled={openingId === tpl.id}
                onClick={() => openTemplate(tpl.id)}
                className="group flex flex-col gap-2.5 text-left disabled:opacity-50"
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border/40 bg-muted/40 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] group-hover:border-border group-hover:shadow-sm">
                  {tpl.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tpl.previewUrl}
                      alt=""
                      className="size-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-3 text-center text-[12px] text-muted-foreground/70">
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
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {tpl.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {tpl.slideCount} slides
                    {tpl.badge ? ` · ${tpl.badge}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </StudioBoardGrid>
        )}
      </StudioContentBody>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </StudioContent>
  );
}
