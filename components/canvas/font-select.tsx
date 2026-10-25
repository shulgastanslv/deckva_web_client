"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchGoogleFontFamilies,
  getPopularGoogleFonts,
  getSystemFonts,
  loadGoogleFont,
  normalizeFontFamily,
} from "@/lib/fonts/google-fonts";

interface FontSelectProps {
  value: string;
  onChange: (family: string) => void;
  disabled?: boolean;
  /** Dense trigger for floating toolbars (no label, fixed width). */
  compact?: boolean;
  className?: string;
}

const MAX_VISIBLE = 80;

export function FontSelect({
  value,
  onChange,
  disabled,
  compact = false,
  className,
}: FontSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [families, setFamilies] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingFont, setLoadingFont] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = normalizeFontFamily(value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || families.length > 0 || loadingList) return;
    setLoadingList(true);
    setError(null);
    void fetchGoogleFontFamilies()
      .then((list) => setFamilies(list))
      .catch(() => setError("Couldn't load the font list"))
      .finally(() => setLoadingList(false));
  }, [open, families.length, loadingList]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const system = getSystemFonts();
    const popular = getPopularGoogleFonts();

    if (!q) {
      const rest = families
        .filter(
          (f) =>
            !system.includes(f as (typeof system)[number]) &&
            !popular.includes(f as (typeof popular)[number]),
        )
        .slice(0, MAX_VISIBLE);
      return {
        groups: [
          { label: "System", items: [...system] },
          { label: "Popular", items: [...popular] },
          { label: "Google Fonts", items: rest },
        ],
      };
    }

    const matched = (families.length > 0 ? families : [...system, ...popular])
      .filter((f) => f.toLowerCase().includes(q))
      .slice(0, MAX_VISIBLE);

    return {
      groups: [{ label: `Found (${matched.length})`, items: matched }],
    };
  }, [query, families]);

  const applyFont = async (family: string) => {
    setLoadingFont(true);
    try {
      await loadGoogleFont(family);
      onChange(family);
      setOpen(false);
      setQuery("");
    } finally {
      setLoadingFont(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex flex-col",
        compact ? "gap-0" : "gap-1.5",
        className,
      )}
    >
      {!compact && (
        <span className="text-[13px] text-muted-foreground">Font</span>
      )}
      <button
        type="button"
        disabled={disabled || loadingFont}
        onClick={() => setOpen((v) => !v)}
        title={compact ? current : undefined}
        className={cn(
          "flex items-center gap-2 rounded-full bg-muted/40 text-left text-[13px] transition-colors",
          "hover:bg-muted/60 disabled:opacity-60",
          compact ? "h-8 w-[7.5rem] px-2.5" : "h-9 w-full px-3",
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

      {open && (
        <div
          className={cn(
            "absolute z-50 overflow-hidden rounded-2xl border border-border/60 bg-popover text-popover-foreground",
            compact
              ? "left-0 top-[calc(100%+6px)] w-64"
              : "left-0 right-0 top-[calc(100%+4px)]",
          )}
        >
          <div className="relative border-b border-border/40 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Google Fonts…"
              className="h-8 w-full rounded-full bg-muted/40 pl-8 pr-3 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {loadingList && families.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading fonts…
              </div>
            ) : error ? (
              <p className="px-3 py-4 text-center text-[13px] text-destructive">
                {error}
              </p>
            ) : (
              options.groups.map((group) =>
                group.items.length === 0 ? null : (
                  <div key={group.label} className="mb-1">
                    <p className="px-2.5 py-1 text-[13px] font-medium text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((family) => {
                      const selected = family === current;
                      return (
                        <button
                          key={family}
                          type="button"
                          onClick={() => void applyFont(family)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[13px] transition-colors",
                            selected
                              ? "bg-muted text-foreground"
                              : "hover:bg-muted/50 text-foreground",
                          )}
                        >
                          <span
                            className="min-w-0 flex-1 truncate"
                            style={{ fontFamily: `"${family}", sans-serif` }}
                          >
                            {family}
                          </span>
                          {selected && (
                            <Check className="size-3.5 shrink-0 text-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
