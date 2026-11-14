"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CaretUpDown as ChevronsUpDown,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";
import {
  CODE_CHROME_STYLES,
  CODE_LANGS,
  CODE_THEMES,
  type CodeChromeStyle,
  type CodeLang,
  type CodeThemeId,
} from "@/lib/canvas/code-block";
import type { CodeThemeDef } from "@/lib/canvas/code-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { controlH } from "@/components/ui/control";

type Pane = "themes" | "languages";

const LANG_SHORT: Partial<Record<CodeLang, string>> = {
  auto: "Auto",
  typescript: "TS",
  tsx: "TSX",
  javascript: "JS",
  jsx: "JSX",
  python: "Py",
  go: "Go",
  rust: "Rust",
  java: "Java",
  kotlin: "Kt",
  swift: "Swift",
  csharp: "C#",
  cpp: "C++",
  php: "PHP",
  ruby: "Ruby",
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  sql: "SQL",
  shell: "Bash",
  css: "CSS",
  scss: "SCSS",
  html: "HTML",
  markdown: "MD",
  graphql: "GQL",
  dockerfile: "Docker",
  prisma: "Prisma",
  vue: "Vue",
  svelte: "Svelte",
  plaintext: "Text",
};

function langShort(id: CodeLang, label: string) {
  return LANG_SHORT[id] ?? label;
}

function ThemeBlockPreview({
  theme,
  chromeStyle,
  darkMode,
  compact,
}: {
  theme: CodeThemeDef;
  chromeStyle: CodeChromeStyle;
  darkMode: boolean;
  compact?: boolean;
}) {
  const syn = darkMode ? theme.syntax.dark : theme.syntax.light;
  const paneBg = darkMode ? "rgba(18,18,20,0.92)" : "rgba(248,248,250,0.94)";
  const showBar = chromeStyle !== "none" && chromeStyle !== "arc";
  const radius = chromeStyle === "arc" ? "rounded-[12px]" : "rounded-lg";

  return (
    <span
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-muted/30",
        compact ? "aspect-[5/4] rounded-xl" : "aspect-[5/4] rounded-[1.15rem]",
      )}
    >
      {chromeStyle === "stack" || chromeStyle === "stack-2" ? (
        <span
          className="absolute rounded-lg bg-muted/60"
          style={{
            inset: compact ? "14%" : "12%",
            transform: "translate(3px, 3px)",
          }}
        />
      ) : null}
      {chromeStyle === "stack-2" ? (
        <span
          className="absolute rounded-lg bg-muted/40"
          style={{
            inset: compact ? "14%" : "12%",
            transform: "translate(6px, 6px)",
          }}
        />
      ) : null}

      <span
        className={cn(
          "absolute flex flex-col overflow-hidden",
          radius,
          chromeStyle === "arc" && "border border-border/50",
          chromeStyle === "card" && "border border-border/40",
          chromeStyle === "none" && "rounded-md",
        )}
        style={{
          inset: compact ? "12%" : "10%",
          background: chromeStyle === "none" ? "transparent" : paneBg,
          boxShadow:
            chromeStyle === "none" ? undefined : "0 4px 14px rgba(0,0,0,0.18)",
        }}
      >
        {showBar ? (
          <span
            className="flex shrink-0 items-center gap-1 px-2"
            style={{
              height: compact ? 10 : 18,
              background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            }}
          >
            {chromeStyle === "windows" ? (
              <span
                className="ml-auto text-[8px] leading-none opacity-50"
                style={{ color: syn.foreground }}
              >
                ×
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "rounded-md bg-[#ff5f56]",
                    compact ? "size-[4px]" : "size-1.5",
                  )}
                />
                <span
                  className={cn(
                    "rounded-md bg-[#ffbd2e]",
                    compact ? "size-[4px]" : "size-1.5",
                  )}
                />
                <span
                  className={cn(
                    "rounded-md bg-[#27c93f]",
                    compact ? "size-[4px]" : "size-1.5",
                  )}
                />
                {chromeStyle === "safari" ? (
                  <span
                    className="mx-auto h-1.5 w-[40%] rounded-md"
                    style={{
                      background: darkMode
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.08)",
                    }}
                  />
                ) : null}
              </>
            )}
          </span>
        ) : null}

        <span
          className={cn(
            "flex min-h-0 flex-1 flex-col font-mono",
            compact
              ? "gap-[2px] px-1 py-1 text-[5px] leading-[1.35]"
              : "gap-1 px-2.5 py-2 text-[10px] leading-[1.45]",
          )}
        >
          <span className="truncate">
            <span style={{ color: syn.keyword }}>const</span>{" "}
            <span style={{ color: syn.foreground }}>hi</span>{" "}
            <span style={{ color: syn.punctuation }}>=</span>{" "}
            <span style={{ color: syn.string }}>&quot;deck&quot;</span>
          </span>
          <span className="truncate">
            <span style={{ color: syn.keyword }}>export</span>{" "}
            <span style={{ color: syn.function }}>fn</span>
            <span style={{ color: syn.punctuation }}>()</span>{" "}
            <span style={{ color: syn.punctuation }}>{"{"}</span>
          </span>
          <span className="truncate pl-2">
            <span style={{ color: syn.property }}>return</span>{" "}
            <span style={{ color: syn.number }}>42</span>
          </span>
          {!compact ? (
            <span className="truncate">
              <span style={{ color: syn.punctuation }}>{"}"}</span>{" "}
              <span style={{ color: syn.comment }}>// ok</span>
            </span>
          ) : null}
        </span>
      </span>
    </span>
  );
}

/** Frames-like picker: theme dropdown + one preview card to place the block. */
export function CodeAppearanceSelect({
  chromeStyle,
  theme,
  lang,
  darkMode = true,
  disabled,
  active,
  search: externalSearch = "",
  onChromeChange,
  onThemeChange,
  onLangChange,
  onPlace,
}: {
  chromeStyle: CodeChromeStyle;
  theme: CodeThemeId;
  lang: CodeLang;
  darkMode?: boolean;
  disabled?: boolean;
  /** Highlight the preview when a canvas block is selected. */
  active?: boolean;
  /** Sidebar search — filters themes like Frames filters devices. */
  search?: string;
  onChromeChange: (style: CodeChromeStyle) => void;
  onThemeChange: (theme: CodeThemeId) => void;
  onLangChange: (lang: CodeLang) => void;
  /** Click the preview to add / place a code block. */
  onPlace?: () => void;
}) {
  const t = useTranslations("editor.code");
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("themes");
  const [query, setQuery] = useState("");
  const chromeScrollRef = useRef<HTMLDivElement>(null);

  const selectedTheme =
    CODE_THEMES.find((item) => item.id === theme) ?? CODE_THEMES[0]!;
  const selectedLang =
    CODE_LANGS.find((item) => item.id === lang) ?? CODE_LANGS[0]!;
  const selectedChrome =
    CODE_CHROME_STYLES.find((item) => item.id === chromeStyle) ??
    CODE_CHROME_STYLES[0]!;

  useEffect(() => {
    if (!open) return;
    const el = chromeScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  const themesFromSidebar = useMemo(() => {
    const q = externalSearch.trim().toLowerCase();
    if (!q) return CODE_THEMES;
    return CODE_THEMES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [externalSearch]);

  useEffect(() => {
    if (themesFromSidebar.some((item) => item.id === theme)) return;
    const next = themesFromSidebar[0];
    if (next) onThemeChange(next.id as CodeThemeId);
  }, [themesFromSidebar, theme, onThemeChange]);

  const filteredThemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = themesFromSidebar;
    if (!q) return base;
    return base.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [query, themesFromSidebar]);

  const filteredLangs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CODE_LANGS;
    return CODE_LANGS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (LANG_SHORT[item.id] ?? "").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setPane("themes");
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={t("codeThemeAria")}
            className={cn(
              "flex w-full min-w-0 items-center gap-2 rounded-md border-none bg-muted/40 px-3.5 text-left shadow-none transition-colors hover:bg-muted/60 disabled:opacity-40 dark:bg-muted/30 dark:hover:bg-muted/45",
              controlH,
            )}
          >
            <span className="min-w-0 flex-1 py-2.5">
              <span className="block truncate text-[13px] font-normal text-foreground">
                {selectedTheme.label}
              </span>
              <span className="block truncate text-[12px] font-normal text-muted-foreground">
                {selectedChrome.label} · {selectedLang.label}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.35rem] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2.5 border-b border-border/40 px-3.5 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                pane === "themes" ? "Search themes…" : "Search languages…"
              }
              aria-label={pane === "themes" ? "Search themes" : "Search languages"}
              className="h-9 w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-[min(22rem,50vh)] overflow-y-auto overscroll-contain px-2.5 pt-2.5 pb-2 [scrollbar-width:thin]">
            {pane === "themes" ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredThemes.map((item) => {
                  const active = item.id === theme;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.label}
                      onClick={() => {
                        onThemeChange(item.id as CodeThemeId);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2 text-center transition-colors",
                        active
                          ? "bg-muted/70 dark:bg-muted/45"
                          : "hover:bg-muted/60 dark:hover:bg-muted/35",
                      )}
                    >
                      <span className="w-full overflow-hidden rounded-xl">
                        <ThemeBlockPreview
                          theme={item}
                          chromeStyle={chromeStyle}
                          darkMode={darkMode}
                          compact
                        />
                      </span>
                      <span className="w-full truncate text-[11px] font-medium leading-tight text-foreground">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
                {filteredThemes.length === 0 ? (
                  <p className="col-span-2 px-2 py-10 text-center text-[13px] text-muted-foreground">
                    {t("noThemes")}
                  </p>
                ) : null}
              </div>
            ) : (
              <div role="listbox" aria-label={t("language")} className="space-y-1">
                {filteredLangs.map((item) => {
                  const active = item.id === lang;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onLangChange(item.id);
                        setPane("themes");
                        setQuery("");
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-normal transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <span className="w-11 shrink-0 text-[12px] font-medium text-muted-foreground">
                        {langShort(item.id, item.label)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">
                        {item.label}
                      </span>
                      {active ? (
                        <Check className="size-3.5 shrink-0 text-foreground" />
                      ) : null}
                    </button>
                  );
                })}
                {filteredLangs.length === 0 ? (
                  <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                    {t("noLanguages")}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-2.5 border-t border-border/40 px-3 py-3">
            <div
              ref={chromeScrollRef}
              role="group"
              aria-label={t("windowStyle")}
              className={cn(
                "w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-md bg-muted/40 p-1 [scrollbar-width:thin]",
                controlH,
              )}
            >
              <div className="inline-flex h-full w-max min-w-full items-stretch gap-0.5">
                {CODE_CHROME_STYLES.map((item) => {
                  const chromeActive = item.id === chromeStyle;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={chromeActive}
                      onClick={() => onChromeChange(item.id)}
                      className={cn(
                        "h-full shrink-0 rounded-md px-3 text-[13px] font-normal whitespace-nowrap transition-colors",
                        chromeActive
                          ? "bg-background text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                "flex w-full items-center rounded-md bg-muted/40 p-1",
                controlH,
              )}
            >
              <button
                type="button"
                title={t("themes")}
                aria-pressed={pane === "themes"}
                onClick={() => {
                  setPane("themes");
                  setQuery("");
                }}
                className={cn(
                  "h-full flex-1 rounded-md px-3 text-[13px] font-normal transition-colors",
                  pane === "themes"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("themes")}
              </button>
              <button
                type="button"
                title={t("language")}
                aria-pressed={pane === "languages"}
                onClick={() => {
                  setPane("languages");
                  setQuery("");
                }}
                className={cn(
                  "h-full flex-1 rounded-md px-3 text-[13px] font-normal transition-colors",
                  pane === "languages"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("language")}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        disabled={disabled || !onPlace}
        onClick={() => onPlace?.()}
        title="Add code block"
        className={cn(
          "group relative mx-1 block w-[calc(100%-0.5rem)] min-w-0 overflow-hidden rounded-[1.35rem] text-left transition-[opacity,filter]",
          active
            ? "bg-muted/40"
            : "hover:brightness-[0.98] dark:hover:brightness-110",
          (disabled || !onPlace) && "opacity-40",
        )}
      >
        <ThemeBlockPreview
          theme={selectedTheme}
          chromeStyle={chromeStyle}
          darkMode={darkMode}
        />
        <span className="sr-only">{t("addCodeBlock")}</span>
      </button>
    </div>
  );
}
