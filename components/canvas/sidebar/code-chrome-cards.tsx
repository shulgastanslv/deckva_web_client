"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
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
        "relative flex w-full overflow-hidden",
        compact ? "aspect-square rounded-xl" : "aspect-[5/4] rounded-[1.15rem]",
      )}
      style={{
        background: `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`,
      }}
    >
      {chromeStyle === "stack" || chromeStyle === "stack-2" ? (
        <span
          className="absolute rounded-lg bg-black/20"
          style={{
            inset: compact ? "18%" : "14%",
            transform: "translate(4px, 4px)",
          }}
        />
      ) : null}
      {chromeStyle === "stack-2" ? (
        <span
          className="absolute rounded-lg bg-black/15"
          style={{
            inset: compact ? "18%" : "14%",
            transform: "translate(7px, 7px)",
          }}
        />
      ) : null}

      <span
        className={cn(
          "absolute flex flex-col overflow-hidden",
          radius,
          chromeStyle === "arc" && "border border-white/30",
          chromeStyle === "card" && "border border-white/20",
          chromeStyle === "none" && "rounded-md",
        )}
        style={{
          inset: compact ? "16%" : "13%",
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

function ChromeGlyph({ style }: { style: CodeChromeStyle }) {
  if (style === "none") {
    return (
      <span className="relative size-3.5 rounded-md border border-current opacity-70">
        <span className="absolute inset-x-[-1px] top-1/2 h-px -rotate-45 bg-current" />
      </span>
    );
  }
  if (style === "windows") {
    return (
      <span className="flex items-center gap-0.5 text-[9px] leading-none opacity-70">
        <span className="block h-px w-2 bg-current" />
        <span className="size-1.5 border border-current" />
      </span>
    );
  }
  if (style === "arc") {
    return <span className="size-3.5 rounded-md border border-current opacity-70" />;
  }
  if (style === "card") {
    return (
      <span className="relative size-3.5">
        <span className="absolute inset-0 translate-x-px translate-y-px rounded-[3px] bg-current opacity-25" />
        <span className="absolute inset-0 rounded-[3px] border border-current opacity-70" />
      </span>
    );
  }
  if (style === "stack" || style === "stack-2") {
    return (
      <span className="relative size-3.5">
        <span className="absolute inset-[2px] translate-x-[2px] translate-y-[2px] rounded-[2px] bg-current opacity-25" />
        {style === "stack-2" ? (
          <span className="absolute inset-[2px] translate-x-px translate-y-px rounded-[2px] bg-current opacity-40" />
        ) : null}
        <span className="absolute inset-[2px] rounded-[2px] border border-current opacity-70" />
      </span>
    );
  }
  return (
    <span className="flex items-center gap-[3px]">
      <span className="size-1.5 rounded-md bg-[#ff5f56]" />
      <span className="size-1.5 rounded-md bg-[#ffbd2e]" />
      <span className="size-1.5 rounded-md bg-[#27c93f]" />
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

  const selectedTheme =
    CODE_THEMES.find((item) => item.id === theme) ?? CODE_THEMES[0]!;
  const selectedLang =
    CODE_LANGS.find((item) => item.id === lang) ?? CODE_LANGS[0]!;
  const selectedChrome =
    CODE_CHROME_STYLES.find((item) => item.id === chromeStyle) ??
    CODE_CHROME_STYLES[0]!;

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
            className="flex h-12 w-full min-w-0 items-center gap-2.5 rounded-2xl bg-muted/60 px-2.5 text-left transition-colors hover:bg-muted disabled:opacity-40 dark:bg-muted/30 dark:hover:bg-muted/45"
          >
            <span className="size-7 shrink-0 overflow-hidden rounded-xl">
              <ThemeBlockPreview
                theme={selectedTheme}
                chromeStyle={chromeStyle}
                darkMode={darkMode}
                compact
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">
                {selectedTheme.label}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
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
              <div className="grid grid-cols-3 gap-1.5">
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
                        "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2.5 text-center transition-colors",
                        active
                          ? "bg-muted ring-2 ring-ring"
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
                  <p className="col-span-3 px-2 py-10 text-center text-[13px] text-muted-foreground">
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
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
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

          <div className="flex items-center gap-2 border-t border-border/40 px-3 py-2.5">
            <div
              role="group"
              aria-label={t("windowStyle")}
              className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]"
            >
              {CODE_CHROME_STYLES.map((item) => {
                const chromeActive = item.id === chromeStyle;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    aria-pressed={chromeActive}
                    onClick={() => onChromeChange(item.id)}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
                      chromeActive
                        ? "bg-muted text-foreground ring-2 ring-ring"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/30",
                    )}
                  >
                    <ChromeGlyph style={item.id} />
                  </button>
                );
              })}
            </div>

            <div className="flex h-8 shrink-0 items-center rounded-md bg-muted/50 p-0.5 dark:bg-muted/30">
              <button
                type="button"
                title={t("themes")}
                aria-pressed={pane === "themes"}
                onClick={() => {
                  setPane("themes");
                  setQuery("");
                }}
                className={cn(
                  "h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors",
                  pane === "themes"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Theme
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
                  "h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors",
                  pane === "languages"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {langShort(selectedLang.id, selectedLang.label)}
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
          "group relative mx-1 block w-[calc(100%-0.5rem)] min-w-0 overflow-hidden rounded-[1.35rem] text-left transition-[box-shadow,opacity]",
          active
            ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
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
