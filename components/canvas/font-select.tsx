"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CaretUpDown as ChevronsUpDown,
  SpinnerGap as Loader2,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { controlH } from "@/components/ui/control";
import {
  fetchGoogleFontFamilies,
  getPopularGoogleFonts,
  getSystemFonts,
  loadGoogleFont,
  normalizeFontFamily,
} from "@/lib/fonts/google-fonts";
import {
  readRecentFonts,
  rememberRecentFont,
  RECENT_FONTS_CHANGED,
} from "@/lib/fonts/recent-fonts";
import {
  BRAND_KIT_CHANGED,
  brandKitFonts,
  loadBrandKit,
} from "@/lib/studio/brand-kit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FontSelectProps {
  value: string;
  onChange: (family: string) => void;
  disabled?: boolean;
  /** Dense trigger for floating toolbars (no label, fixed width). */
  compact?: boolean;
  className?: string;
}

const MAX_SEARCH_RESULTS = 80;

type FontGroup = { label: string; items: string[] };

export function FontSelect({
  value,
  onChange,
  disabled,
  compact = false,
  className,
}: FontSelectProps) {
  const t = useTranslations("editor.typography");
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [families, setFamilies] = useState<string[]>([]);
  const [brandFonts, setBrandFonts] = useState<string[]>([]);
  const [recentFonts, setRecentFonts] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingFont, setLoadingFont] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = normalizeFontFamily(value);

  useEffect(() => {
    const refreshBrand = () => setBrandFonts(brandKitFonts(loadBrandKit()));
    const refreshRecent = () => setRecentFonts(readRecentFonts());
    refreshBrand();
    refreshRecent();
    window.addEventListener(BRAND_KIT_CHANGED, refreshBrand);
    window.addEventListener(RECENT_FONTS_CHANGED, refreshRecent);
    return () => {
      window.removeEventListener(BRAND_KIT_CHANGED, refreshBrand);
      window.removeEventListener(RECENT_FONTS_CHANGED, refreshRecent);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (families.length > 0 || loadingList) return;
    setLoadingList(true);
    setError(null);
    void fetchGoogleFontFamilies()
      .then((list) => setFamilies(list))
      .catch(() => setError(t("loadError")))
      .finally(() => setLoadingList(false));
  }, [open, families.length, loadingList, t]);

  useEffect(() => {
    if (!open) return;
    const warm = [
      ...getPopularGoogleFonts().slice(0, 12),
      ...recentFonts.slice(0, 8),
      ...getSystemFonts(),
      current,
    ];
    void Promise.all(
      Array.from(new Set(warm)).map((family) => loadGoogleFont(family)),
    );
  }, [open, recentFonts, current]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const system = [...getSystemFonts()];
    const popular = [...getPopularGoogleFonts()];
    const brand = brandFonts;
    const recent = [
      current,
      ...recentFonts.filter((f) => f !== current),
    ].slice(0, 10);

    if (!q) {
      // Browse mode: curated only — no A–Z dump.
      const reserved = new Set<string>([...brand, ...recent, ...system]);
      const popularOnly = popular.filter((f) => !reserved.has(f));
      const groups: FontGroup[] = [
        ...(brand.length > 0
          ? [{ label: t("groups.brandKit"), items: brand }]
          : []),
        { label: t("groups.recent"), items: recent },
        { label: t("groups.popular"), items: popularOnly },
        { label: t("groups.system"), items: system },
      ];
      return { groups, searching: false };
    }

    const pool =
      families.length > 0
        ? families
        : Array.from(new Set([...brand, ...recent, ...system, ...popular]));
    const matched = pool
      .filter((f) => f.toLowerCase().includes(q))
      .slice(0, MAX_SEARCH_RESULTS);

    return {
      groups: [
        {
          label: t("groups.found", { count: matched.length }),
          items: matched,
        },
      ],
      searching: true,
    };
  }, [query, families, brandFonts, recentFonts, current, t]);

  const applyFont = async (family: string) => {
    setLoadingFont(true);
    try {
      await loadGoogleFont(family);
      rememberRecentFont(family);
      setRecentFonts(readRecentFonts());
      onChange(family);
      setOpen(false);
      setQuery("");
    } finally {
      setLoadingFont(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col",
        compact ? "gap-0" : "gap-1.5",
        className,
      )}
    >
      {!compact && (
        <span className="text-[13px] font-medium text-muted-foreground">
          {t("font")}
        </span>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || loadingFont}
            title={compact ? current : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md border-none bg-muted/40 text-left text-[13px] text-foreground shadow-none transition-colors",
              "hover:bg-muted/60 data-[state=open]:bg-muted/60 disabled:opacity-60",
              compact
                ? cn(controlH, "w-[9.5rem] px-3.5 font-normal")
                : cn(controlH, "w-full px-3.5 font-normal"),
            )}
          >
            <span
              className="min-w-0 flex-1 truncate"
              style={{ fontFamily: `"${current}", sans-serif` }}
            >
              {current}
            </span>
            {loadingFont ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side={compact ? "bottom" : "left"}
          sideOffset={24}
          collisionPadding={14}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => searchRef.current?.focus());
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="flex w-[18rem] flex-col gap-0 overflow-hidden rounded-2xl p-1.5 sm:w-[20rem]"
          style={{
            maxHeight:
              "min(20rem, var(--radix-popover-content-available-height))",
          }}
        >
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchGoogleFonts")}
              className={cn(
                controlH,
                "w-full rounded-md border-none bg-muted/40 pl-9 pr-3 text-[13px] text-foreground shadow-none outline-none placeholder:text-muted-foreground/70 focus:bg-muted/60",
              )}
            />
          </div>

          <div className="mt-1.5 max-h-56 min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loadingList && options.searching && families.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                {t("loadingFonts")}
              </div>
            ) : error && options.searching ? (
              <p className="px-3 py-6 text-center text-[13px] text-destructive">
                {error}
              </p>
            ) : options.groups.every((group) => group.items.length === 0) ? (
              <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                {t("noResults")}
              </p>
            ) : (
              options.groups.map((group) =>
                group.items.length === 0 ? null : (
                  <div key={group.label} className="mb-1">
                    <p className="sticky top-0 z-[1] bg-popover px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((family) => {
                      const selected = family === current;
                      return (
                        <button
                          key={`${group.label}-${family}`}
                          type="button"
                          onMouseEnter={() => {
                            void loadGoogleFont(family);
                          }}
                          onClick={() => void applyFont(family)}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-[13px] font-normal transition-colors",
                            selected
                              ? "bg-muted/50 text-foreground"
                              : "text-foreground hover:bg-muted/40",
                          )}
                        >
                          <span
                            className="min-w-0 flex-1 truncate text-[15px] leading-snug"
                            style={{ fontFamily: `"${family}", sans-serif` }}
                          >
                            {family}
                          </span>
                          <Check
                            className={cn(
                              "size-3.5 shrink-0 text-foreground",
                              selected ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                ),
              )
            )}
          </div>

          {!options.searching ? (
            <p className="shrink-0 px-2.5 pb-1 pt-2 text-[12px] leading-snug text-muted-foreground">
              {t("searchHint")}
            </p>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
