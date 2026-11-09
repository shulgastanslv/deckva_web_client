"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import {
  sidebarSegmented,
  sidebarSegmentedItem,
  sidebarSegmentedItemActive,
  sidebarSegmentedItemIdle,
  sidebarSurface,
} from "@/components/canvas/sidebar/sidebar-ui";

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

function ChromeGlyph({ style }: { style: CodeChromeStyle }) {
  if (style === "none") {
    return (
      <span className="relative size-3.5 rounded-full border border-current opacity-70">
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
    return (
      <span className="size-3.5 rounded-md border border-current opacity-70" />
    );
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
      <span className="size-1.5 rounded-full bg-[#ff5f56]" />
      <span className="size-1.5 rounded-full bg-[#ffbd2e]" />
      <span className="size-1.5 rounded-full bg-[#27c93f]" />
    </span>
  );
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
  const radius =
    chromeStyle === "arc" ? "rounded-[12px]" : "rounded-lg";

  return (
    <span
      className={cn(
        "relative flex w-full overflow-hidden rounded-xl",
        compact ? "aspect-square" : "aspect-[4/3]",
      )}
      style={{
        background: `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`,
      }}
    >
      {chromeStyle === "stack" || chromeStyle === "stack-2" ? (
        <span
          className="absolute rounded-lg bg-black/20"
          style={{
            inset: compact ? "18%" : "12%",
            transform: "translate(4px, 4px)",
          }}
        />
      ) : null}
      {chromeStyle === "stack-2" ? (
        <span
          className="absolute rounded-lg bg-black/15"
          style={{
            inset: compact ? "18%" : "12%",
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
          inset: compact ? "16%" : "11%",
          background: chromeStyle === "none" ? "transparent" : paneBg,
          boxShadow:
            chromeStyle === "none" ? undefined : "0 4px 14px rgba(0,0,0,0.18)",
        }}
      >
        {showBar ? (
          <span
            className="flex shrink-0 items-center gap-1 px-2"
            style={{
              height: compact ? 10 : 16,
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
                    "rounded-full bg-[#ff5f56]",
                    compact ? "size-[4px]" : "size-1.5",
                  )}
                />
                <span
                  className={cn(
                    "rounded-full bg-[#ffbd2e]",
                    compact ? "size-[4px]" : "size-1.5",
                  )}
                />
                <span
                  className={cn(
                    "rounded-full bg-[#27c93f]",
                    compact ? "size-[4px]" : "size-1.5",
                  )}
                />
                {chromeStyle === "safari" ? (
                  <span
                    className="mx-auto h-1.5 w-[40%] rounded-full"
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
              : "gap-1 px-2.5 py-2 text-[9px] leading-[1.45]",
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

export function CodeAppearanceSelect({
  chromeStyle,
  theme,
  lang,
  darkMode = true,
  disabled,
  onChromeChange,
  onThemeChange,
  onLangChange,
}: {
  chromeStyle: CodeChromeStyle;
  theme: CodeThemeId;
  lang: CodeLang;
  darkMode?: boolean;
  disabled?: boolean;
  onChromeChange: (style: CodeChromeStyle) => void;
  onThemeChange: (theme: CodeThemeId) => void;
  onLangChange: (lang: CodeLang) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("themes");
  const [query, setQuery] = useState("");

  const selectedChrome =
    CODE_CHROME_STYLES.find((item) => item.id === chromeStyle) ??
    CODE_CHROME_STYLES[0]!;
  const selectedTheme =
    CODE_THEMES.find((item) => item.id === theme) ?? CODE_THEMES[0]!;
  const selectedLang =
    CODE_LANGS.find((item) => item.id === lang) ?? CODE_LANGS[0]!;

  const filteredThemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CODE_THEMES;
    return CODE_THEMES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [query]);

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
          aria-label="Code appearance"
          className={cn(
            "flex h-12 w-full min-w-0 items-center gap-3 rounded-2xl px-3 text-left transition-colors disabled:opacity-40",
            sidebarSurface,
          )}
        >
          <span className="size-8 shrink-0 overflow-hidden rounded-xl">
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
        className="w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.35rem] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2.5 border-b border-border/40 px-4 py-3">
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

        <div className="max-h-[min(26rem,58vh)] overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:thin]">
          {pane === "themes" ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredThemes.map((item) => {
                const active = item.id === theme;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => onThemeChange(item.id as CodeThemeId)}
                    className={cn(
                      "flex min-w-0 flex-col gap-2.5 rounded-2xl p-2.5 text-left transition-colors",
                      active
                        ? "bg-muted ring-2 ring-ring"
                        : "hover:bg-muted/60 dark:hover:bg-muted/35",
                    )}
                  >
                    <ThemeBlockPreview
                      theme={item}
                      chromeStyle={chromeStyle}
                      darkMode={darkMode}
                    />
                    <span className="truncate px-0.5 text-[13px] font-medium text-foreground">
                      {item.label}
                    </span>
                  </button>
                );
              })}
              {filteredThemes.length === 0 ? (
                <p className="col-span-2 px-2 py-10 text-center text-[13px] text-muted-foreground">
                  No themes found
                </p>
              ) : null}
            </div>
          ) : (
            <div role="listbox" aria-label="Language" className="space-y-1">
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
                  No languages found
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 border-t border-border/40 px-3 py-3">
          <div
            role="group"
            aria-label="Window style"
            className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]"
          >
            {CODE_CHROME_STYLES.map((item) => {
              const active = item.id === chromeStyle;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={active}
                  onClick={() => onChromeChange(item.id)}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    active
                      ? "bg-muted text-foreground ring-2 ring-ring"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/30",
                  )}
                >
                  <ChromeGlyph style={item.id} />
                </button>
              );
            })}
          </div>

          <div className={cn(sidebarSegmented, "h-8 w-auto shrink-0")}>
            <button
              type="button"
              title="Themes"
              aria-pressed={pane === "themes"}
              onClick={() => {
                setPane("themes");
                setQuery("");
              }}
              className={cn(
                sidebarSegmentedItem,
                "px-2.5 text-[12px]",
                pane === "themes"
                  ? sidebarSegmentedItemActive
                  : sidebarSegmentedItemIdle,
              )}
            >
              Theme
            </button>
            <button
              type="button"
              title="Language"
              aria-pressed={pane === "languages"}
              onClick={() => {
                setPane("languages");
                setQuery("");
              }}
              className={cn(
                sidebarSegmentedItem,
                "px-2.5 text-[12px]",
                pane === "languages"
                  ? sidebarSegmentedItemActive
                  : sidebarSegmentedItemIdle,
              )}
            >
              {langShort(selectedLang.id, selectedLang.label)}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
