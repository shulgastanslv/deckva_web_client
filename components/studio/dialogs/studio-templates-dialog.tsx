"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

import { getTemplates, type TemplateListItem } from "@/actions/templates";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/categories";
import { cn } from "@/lib/utils";

export function StudioTemplatesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const categories = useMemo(() => ["all", ...TEMPLATE_CATEGORIES], []);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTemplates({
        category: category === "all" ? undefined : category,
        search: search.trim() || undefined,
      });
      const list = res.success ? res.templates : [];
      setTemplates(list);
      setSelectedId((current) => {
        if (current && list.some((item) => item.id === current)) return current;
        return list[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(
      () => {
        void fetchTemplates();
      },
      search ? 220 : 0,
    );
    return () => window.clearTimeout(t);
  }, [open, fetchTemplates, search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setCategory("all");
      setSelectedId(null);
      setOpeningId(null);
    }
  }, [open]);

  const selected = templates.find((item) => item.id === selectedId) ?? null;

  const useTemplate = (id: string) => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    setOpeningId(id);
    onOpenChange(false);
    router.push(`/studio/editor?template=${encodeURIComponent(id)}`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(900px,calc(100dvh-2rem))] w-[min(1120px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-background p-0"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-4">
            <div className="min-w-0">
              <DialogTitle className="text-[18px] font-semibold tracking-tight">
                Templates
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
                Browse designs and open one in the editor.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates"
                  className="h-9 w-56 rounded-full bg-muted/40 pr-3 pl-9 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:bg-muted/55"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-full"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="relative block border-b border-border/40 px-5 py-3 sm:hidden">
            <Search className="pointer-events-none absolute top-1/2 left-8 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates"
              className="h-9 w-full rounded-full bg-muted/40 pr-3 pl-9 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:bg-muted/55"
            />
          </div>

          <div className="flex min-h-0 flex-1">
            <aside className="hidden w-48 shrink-0 overflow-y-auto border-r border-border/40 p-3 md:block">
              <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Categories
              </p>
              <ul className="space-y-0.5">
                {categories.map((tab) => {
                  const active = category === tab;
                  return (
                    <li key={tab}>
                      <button
                        type="button"
                        onClick={() => setCategory(tab)}
                        className={cn(
                          "w-full truncate rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors",
                          active
                            ? "bg-muted/60 font-semibold text-foreground"
                            : "text-muted-foreground hover:bg-muted/35 hover:text-foreground",
                        )}
                      >
                        {tab === "all" ? "All templates" : tab}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex gap-1.5 overflow-x-auto px-4 py-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.slice(0, 12).map((tab) => {
                  const active = category === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCategory(tab)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                        active
                          ? "bg-foreground text-background"
                          : "bg-muted/40 text-muted-foreground",
                      )}
                    >
                      {tab === "all" ? "All" : tab}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-5">
                {loading && templates.length === 0 ? (
                  <div className="flex h-full items-center justify-center py-20">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                    <p className="text-[16px] font-medium text-foreground">
                      No templates found
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Try another category or search.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {templates.map((tpl) => {
                      const active = tpl.id === selectedId;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedId(tpl.id)}
                          onDoubleClick={() => useTemplate(tpl.id)}
                          className={cn(
                            "group flex flex-col gap-2 rounded-2xl p-1.5 text-left transition-colors",
                            active ? "bg-muted/50" : "hover:bg-muted/30",
                          )}
                        >
                          <div
                            className={cn(
                              "relative aspect-4/5 overflow-hidden rounded-xl bg-muted/40",
                              active && "ring-2 ring-[#4262ff]/50",
                            )}
                          >
                            {tpl.previewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={tpl.previewUrl}
                                alt=""
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                draggable={false}
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center px-3 text-center text-[12px] text-muted-foreground">
                                {tpl.title}
                              </span>
                            )}
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden w-[280px] shrink-0 flex-col border-l border-border/40 lg:flex">
              {selected ? (
                <>
                  <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="aspect-4/5 overflow-hidden rounded-2xl bg-muted/40">
                      {selected.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selected.previewUrl}
                          alt=""
                          className="size-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-muted-foreground">
                          {selected.title}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">
                      {selected.title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {selected.category}
                      {" · "}
                      {selected.aspectRatio}
                      {" · "}
                      {selected.slideCount} slides
                      {selected.badge ? ` · ${selected.badge}` : ""}
                    </p>
                    {selected.authorName ? (
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        by {selected.authorName}
                      </p>
                    ) : null}
                  </div>
                  <div className="border-t border-border/40 p-4">
                    <Button
                      type="button"
                      className="h-10 w-full rounded-full text-[13px] font-medium"
                      disabled={openingId === selected.id}
                      onClick={() => useTemplate(selected.id)}
                    >
                      {openingId === selected.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          Use this template
                          <ArrowRight className="size-3.5 opacity-70" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-muted-foreground">
                  Select a template to preview
                </div>
              )}
            </aside>
          </div>

          {selected ? (
            <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3 lg:hidden">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{selected.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {selected.slideCount} slides · {selected.aspectRatio}
                </p>
              </div>
              <Button
                type="button"
                className="h-9 shrink-0 rounded-full px-4 text-[13px]"
                disabled={openingId === selected.id}
                onClick={() => useTemplate(selected.id)}
              >
                {openingId === selected.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Use"
                )}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
