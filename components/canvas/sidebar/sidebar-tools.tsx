"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { FilterMenu } from "@/components/canvas/sidebar/filter-menu";
import { ToolAvatar, ToolUsageSchema } from "@/components/canvas/sidebar/tool-avatars";
import { ToolsBanner } from "@/components/canvas/sidebar/tools-banner";
import { ToolRunDialog } from "@/components/canvas/sidebar/tool-workspace";
import { sidebarFieldInput, sidebarHint, sidebarPanel } from "@/components/canvas/sidebar/sidebar-ui";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  loadToolRecents,
  pushToolRecent,
  STUDIO_TOOLS,
  TOOL_CATEGORIES,
  type StudioTool,
  type StudioToolId,
  type ToolCategory,
} from "@/lib/studio/tools-catalog";
import { cn } from "@/lib/utils";

type Scope = "all" | "recents" | "suggested";

const CATALOG_KEY: Record<StudioToolId, string> = {
  mockups: "mockups",
  "slides-from-text": "slidesFromText",
  "progress-dots": "progressDots",
};

type TranslateFn = (key: string) => string;

function localizedTool(tool: StudioTool, t: TranslateFn): StudioTool {
  const key = CATALOG_KEY[tool.id];
  return {
    ...tool,
    title: t(`catalog.${key}.title`),
    description: t(`catalog.${key}.description`),
    longDescription: t(`catalog.${key}.long`),
    runLabel: t(`catalog.${key}.run`),
  };
}

function ToolListRow({
  tool,
  onOpen,
}: {
  tool: StudioTool;
  onOpen: (id: StudioToolId) => void;
}) {
  return (
    <HoverCard openDelay={180} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onOpen(tool.id)}
          className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition-colors hover:bg-muted/50 dark:hover:bg-muted/30"
        >
          <ToolAvatar tool={tool} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-foreground">
              {tool.title}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {tool.description}
            </span>
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={10}
        className="w-52 overflow-hidden rounded-2xl border-0 bg-popover p-0 shadow-sm dark:border dark:border-border/50"
      >
        <ToolUsageSchema tool={tool} className="aspect-[16/10] min-h-0 rounded-none" />
        <div className="space-y-1 px-3 py-2.5">
          <p className="text-[13px] font-semibold leading-snug text-foreground">
            {tool.title}
          </p>
          <p className="text-[12px] leading-snug text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function SidebarTools() {
  const t = useTranslations("editor.tools");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [scope, setScope] = useState<Scope>("all");
  const [recents, setRecents] = useState<StudioToolId[]>([]);
  const [runId, setRunId] = useState<StudioToolId | null>(null);

  useEffect(() => {
    setRecents(loadToolRecents());
  }, []);

  const localizedTools = useMemo(
    () => STUDIO_TOOLS.map((tool) => localizedTool(tool, t)),
    [t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const recentSet = new Set(recents);
    return localizedTools.filter((tool) => {
      if (category !== "all" && tool.category !== category) return false;
      if (scope === "recents" && !recentSet.has(tool.id)) return false;
      if (scope === "suggested" && !tool.suggested) return false;
      if (!q) return true;
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.includes(q)
      );
    });
  }, [query, category, scope, recents, localizedTools]);

  const ordered = useMemo(() => {
    if (scope !== "recents") return filtered;
    const map = new Map(filtered.map((tool) => [tool.id, tool]));
    return recents.map((id) => map.get(id)).filter((tool): tool is StudioTool => Boolean(tool));
  }, [filtered, scope, recents]);

  const filterValue =
    scope !== "all" ? `scope:${scope}` : category !== "all" ? `cat:${category}` : "all";

  const onFilterChange = (id: string) => {
    if (id === "all") {
      setScope("all");
      setCategory("all");
      return;
    }
    if (id.startsWith("scope:")) {
      setScope(id.slice(6) as Scope);
      setCategory("all");
      return;
    }
    if (id.startsWith("cat:")) {
      setCategory(id.slice(4) as ToolCategory);
      setScope("all");
    }
  };

  const openTool = (id: StudioToolId) => {
    setRecents(pushToolRecent(id));
    setRunId(id);
  };

  const categoryLabel = (id: ToolCategory | "all") => t(`categories.${id}`);

  return (
    <div className={sidebarPanel}>
      <div className="flex items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchAll")}
            aria-label={t("search")}
            className={cn(sidebarFieldInput, "pl-9")}
          />
        </div>
        <FilterMenu
          value={filterValue}
          defaultValue="all"
          ariaLabel={t("search")}
          onChange={onFilterChange}
          groups={[
            {
              label: t("show"),
              options: [
                { id: "all", label: t("allTools") },
                { id: "scope:recents", label: t("recents") },
                { id: "scope:suggested", label: t("suggested") },
              ],
            },
            {
              label: t("category"),
              options: TOOL_CATEGORIES.filter((item) => item.id !== "all").map((item) => ({
                id: `cat:${item.id}`,
                label: categoryLabel(item.id),
              })),
            },
          ]}
        />
      </div>

      <ToolsBanner
        onExplore={() => {
          setScope("suggested");
          setCategory("all");
        }}
      />

      {ordered.length === 0 ? (
        <p className={cn(sidebarHint, "px-1 py-6 text-center")}>
          {scope === "recents"
            ? t("emptyRecents")
            : t("noMatch")}
        </p>
      ) : (
        <div className="flex flex-col">
          {ordered.map((tool) => (
            <ToolListRow key={tool.id} tool={tool} onOpen={openTool} />
          ))}
        </div>
      )}

      <ToolRunDialog
        toolId={runId}
        open={runId !== null}
        onOpenChange={(next) => {
          if (!next) setRunId(null);
        }}
      />
    </div>
  );
}
