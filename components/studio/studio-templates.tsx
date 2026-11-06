"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ScrollContainer from "react-indiana-drag-scroll";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Search,
} from "lucide-react";

import { getTemplates, type TemplateListItem } from "@/actions/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/templates/categories";
import { AuthModal } from "@/components/auth";
import { StudioBoardGrid } from "@/components/studio/browse/studio-board-grid";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function StudioTemplates() {
  const router = useRouter();
  const { status } = useSession();
  
  // --- Состояния данных ---
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [sort, setSort] = useState("last-opened");

  // --- Состояния и Ref для скролла ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Глобальный поиск из сайдбара
  useEffect(() => {
    const onSidebarSearch = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof query === "string") setSearch(query);
    };
    window.addEventListener("studio:sidebar-search", onSidebarSearch);
    return () =>
      window.removeEventListener("studio:sidebar-search", onSidebarSearch);
  }, []);

  // Загрузка шаблонов
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

  // Дебаунс для поиска
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

  // Проверка возможности скролла
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, category]);

  // Функция программного скролла
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const allCategories = ["all", ...TEMPLATE_CATEGORIES];

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        
        {/* --- HEADER BLOCK --- */}
        <header className="mb-6 shrink-0">
          <div className="flex w-full flex-col gap-4">
            
            {/* Заголовок и описание */}
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-foreground sm:text-[28px]">
                Templates
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Swipe to explore {allCategories.length} categories
              </p>
            </div>

            {/* Панель поиска и фильтров */}
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
              {/* Поиск */}
              <div className="relative w-full sm:w-64 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search boards"
                  className="h-9 w-full rounded-full border-none bg-muted/40 pl-9 pr-4 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-1"
                />
              </div>

              {/* Левые фильтры */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Select defaultValue="anyone">
                  <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none px-3 text-[13px] shadow-none hover:bg-muted/50 focus:ring-0 [&>span]:line-clamp-1">
                    <SelectValue placeholder="Owned by anyone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anyone">Owned by anyone</SelectItem>
                    <SelectItem value="me">Owned by me</SelectItem>
                    <SelectItem value="not-me">Not owned by me</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none px-3 text-[13px] shadow-none hover:bg-muted/50 focus:ring-0 [&>span]:line-clamp-1">
                    <SelectValue placeholder="Space" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Space</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Правые фильтры (Сортировка и Вид) */}
              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 rounded-full border-none bg-transparent px-3 text-[13px] shadow-none hover:bg-muted/50 data-[state=open]:text-blue-600"
                    >
                      Sort <ChevronDown className="ml-1 size-3.5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    {[
                      { id: "last-opened", label: "Last opened" },
                      { id: "last-modified", label: "Last modified" },
                      { id: "alphabetical", label: "Alphabetically" },
                      { id: "last-created", label: "Last created" },
                    ].map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setSort(option.id)}
                        className="flex items-center gap-2 rounded-lg text-[13px]"
                      >
                        <div className="flex w-4 items-center justify-center">
                          {sort === option.id && <Check className="size-4" />}
                        </div>
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex h-9 items-center gap-0.5 rounded-lg bg-transparent p-0.5 shadow-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md bg-muted shadow-none hover:bg-muted"
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md border-none text-muted-foreground shadow-none hover:text-foreground"
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Вкладки (Категории) */}
          <div className="relative mt-4 sm:mt-5">
            {canScrollLeft && (
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-start bg-gradient-to-r from-background to-transparent">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="pointer-events-auto flex size-7 items-center justify-center rounded-full border-none bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            )}

            <ScrollContainer
              innerRef={scrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-5 overflow-x-auto scroll-smooth select-none [scrollbar-width:none] active:cursor-grabbing sm:gap-6 [&::-webkit-scrollbar]:hidden"
            >
              {allCategories.map((tab) => {
                const isAll = tab === "all";
                const isActive = category === tab;
                const label = isAll ? "All" : tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCategory(tab)}
                    className={cn(
                      "relative shrink-0 pb-2.5 whitespace-nowrap text-[15px] transition-colors border-none bg-transparent shadow-none",
                      isActive
                        ? "font-semibold text-neutral-950 dark:text-foreground"
                        : "font-medium text-neutral-400 hover:text-neutral-700 dark:text-muted-foreground dark:hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </ScrollContainer>

            {canScrollRight && (
              <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-end bg-gradient-to-l from-background to-transparent">
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="pointer-events-auto flex size-7 items-center justify-center rounded-full border-none bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* --- CONTENT BLOCK --- */}
        {loading && templates.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[22px] text-neutral-950 dark:text-foreground">
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