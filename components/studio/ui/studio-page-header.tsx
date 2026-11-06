"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ScrollContainer from "react-indiana-drag-scroll";

export function StudioPageHeader({
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  actions,
  tabs,
}: {
  title?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [tabs]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <header className="mb-6 shrink-0">
      <div className="flex w-full flex-col gap-4">
        {/* Заголовок (рендерится только если передан) */}
        {title && (
          <h1 className="text-[26px] font-bold tracking-tight text-foreground sm:text-[28px]">
            {title}
          </h1>
        )}
        
        {/* Панель поиска и фильтров */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          {onSearchChange ? (
            <div className="relative w-full sm:w-64 sm:flex-none">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-full border-border/60 bg-transparent pl-9 pr-4 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-1"
              />
            </div>
          ) : null}
          {actions}
        </div>
      </div>
      
      {tabs ? (
        <div className="relative mt-4 sm:mt-5">
          {canScrollLeft && (
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-start bg-gradient-to-r from-background to-transparent">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="pointer-events-auto flex size-7 items-center justify-center rounded-full border border-border/50 bg-background/95 shadow-sm text-muted-foreground transition-colors hover:text-foreground"
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
            {tabs}
          </ScrollContainer>

          {canScrollRight && (
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-end bg-gradient-to-l from-background to-transparent">
              <button
                type="button"
                onClick={() => scroll("right")}
                className="pointer-events-auto flex size-7 items-center justify-center rounded-full border border-border/50 bg-background/95 shadow-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}