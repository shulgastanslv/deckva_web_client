"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Check,
  Clock as Clock3,
  SpinnerGap as Loader2,
  Paperclip,
  Plus,
  Scroll as ScrollText,
  MagnifyingGlass as Search,
  Shapes,
  PlugsIcon,
  X,
  CardsThreeIcon,
  CardsIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { listAiModels } from "@/actions/ai";
import { listMediaAssets, type MediaAssetDTO } from "@/actions/assets";
import {
  disconnectConnectorAction,
  listConnectors,
} from "@/actions/connectors";
import {
  readRecentPhotos,
  type RecentPhoto,
} from "@/lib/canvas/recent-photos";
import {
  AiModelIcon,
  BrandIcon,
  resolveBrandFromModelId,
  type BrandKey,
} from "@/components/studio/brand-icon";
import { menuIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { controlH, controlSize } from "@/components/ui/control";
import {
  GenerateOptionsDialog,
  pickRandomHandle,
} from "@/components/studio/create/generate-options-dialog";
import type { AiModelInfo } from "@/lib/ai/types";
import { trackEvent } from "@/lib/analytics";
import type { ConnectorProviderId, ConnectorPublic } from "@/lib/connectors/types";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  applyPromptSkill,
  getPromptSkill,
  listPromptSkillGroups,
  type PromptSkillId,
} from "@/lib/studio/prompt-skills";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { type RatioKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HistoryIcon } from "lucide-react";

const PROMPT_LANGUAGES = ["ru", "en", "be"] as const;

const MODEL_KEY = "studio_ai_model";
const HISTORY_KEY = "studio_prompt_recents";
const MAX_HISTORY = 40;
const HISTORY_DAY = 24 * 60 * 60 * 1000;
const MAX_ATTACHMENTS = 4;
const MAX_TEXT_CHARS = 4000;

type ModelFilter = "all" | BrandKey;

type PromptAttachment = {
  id: string;
  name: string;
  kind: "image" | "text";
  /** Image data URL or extracted text body. */
  payload: string;
};

const CONNECTORS = [
  {
    id: "google-drive" as const,
    label: "Google Drive",
    brand: "googledrive" as const,
  },
];

/** Match the live catalog versions before the brand fallback. Order matters. */
const MODEL_VOICE_RULES: { test: RegExp; key: string }[] = [
  { test: /opus/i, key: "claudeOpus" },
  { test: /sonnet/i, key: "claudeSonnet" },
  { test: /haiku/i, key: "claudeHaiku" },
  { test: /flash[- ]?lite/i, key: "geminiFlashLite" },
  { test: /gemini[^a-z0-9]*pro|gemini-pro/i, key: "geminiPro" },
  { test: /gemini[^a-z0-9]*flash|gemini-flash(?!-lite)/i, key: "geminiFlash" },
  { test: /deepseek[^a-z0-9]*v3|deepseek-v3/i, key: "deepseekV3" },
  { test: /deepseek/i, key: "deepseekChat" },
  { test: /4o[- ]?mini/i, key: "gpt4oMini" },
  { test: /4\.1[- ]?mini/i, key: "gpt41Mini" },
  { test: /4\.1/i, key: "gpt41" },
  { test: /qwen/i, key: "qwen72b" },
  { test: /llama/i, key: "llama3370b" },
];

function modelVoiceKey(modelId: string, displayName: string) {
  const hay = `${modelId} ${displayName}`;
  return MODEL_VOICE_RULES.find((rule) => rule.test.test(hay))?.key;
}

const PROVIDER_FILTERS: { id: ModelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "openai", label: "OpenAI" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "mistral", label: "Mistral" },
];

type HistoryEntry = { text: string; at: number };
type HistoryFilter = "all" | "today" | "week" | "earlier";

function parseHistoryEntry(item: unknown): HistoryEntry | null {
  if (typeof item === "string") {
    const text = item.trim();
    return text ? { text, at: 0 } : null;
  }
  if (!item || typeof item !== "object") return null;
  const text = "text" in item && typeof item.text === "string" ? item.text.trim() : "";
  if (!text) return null;
  const at = "at" in item && typeof item.at === "number" ? item.at : 0;
  return { text, at };
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const entries: HistoryEntry[] = [];
    for (const item of parsed) {
      const entry = parseHistoryEntry(item);
      if (!entry || seen.has(entry.text)) continue;
      seen.add(entry.text);
      entries.push(entry);
      if (entries.length >= MAX_HISTORY) break;
    }
    return entries;
  } catch {
    return [];
  }
}

function pushHistory(topic: string): HistoryEntry[] {
  const next = [
    { text: topic, at: Date.now() },
    ...loadHistory().filter((item) => item.text !== topic),
  ].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function matchesHistoryFilter(at: number, filter: HistoryFilter) {
  if (filter === "all") return true;
  if (!at) return filter === "earlier";
  const today = startOfToday();
  if (filter === "today") return at >= today;
  if (filter === "week") return at >= today - 6 * HISTORY_DAY;
  return at < today - 6 * HISTORY_DAY;
}

function formatHistoryWhen(at: number, locale: string) {
  if (!at) return "";
  const date = new Date(at);
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(
    locale,
    sameDay
      ? { hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "short" },
  ).format(date);
}

async function readTextFile(file: File): Promise<string> {
  const text = await file.text();
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_CHARS);
}

export function StudioPrompt({
  onSubmit,
  disabled,
  busy,
  error,
  initialTopic = "",
}: {
  onSubmit: (input: StudioPromptSubmit) => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
  initialTopic?: string;
}) {
  const t = useTranslations("studio");
  const tc = useTranslations("common");
  const locale = useLocale();
  const appliedTopic = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelSearchRef = useRef<HTMLInputElement>(null);
  const historySearchRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(initialTopic);
  const [models, setModels] = useState<AiModelInfo[]>([]);
  const [modelId, setModelId] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [skillId, setSkillId] = useState<PromptSkillId | null>(null);
  const [language, setLanguage] = useState(() =>
    PROMPT_LANGUAGES.includes(locale as (typeof PROMPT_LANGUAGES)[number])
      ? locale
      : "ru",
  );
  const [aspectRatio, setAspectRatio] = useState<RatioKey>("4:5");
  const [slidesCount, setSlidesCount] = useState(7);
  const [handle, setHandle] = useState<string>(() => pickRandomHandle());
  const [showHandle, setShowHandle] = useState(true);
  const [connectors, setConnectors] = useState<ConnectorPublic[]>([]);
  const [connectorBusy, setConnectorBusy] = useState<ConnectorProviderId | null>(
    null,
  );
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<MediaAssetDTO[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<RecentPhoto[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const skillGroups = useMemo(() => listPromptSkillGroups(), []);

  const refreshConnectors = async () => {
    const res = await listConnectors();
    if (res.success) setConnectors(res.connectors);
  };

  useEffect(() => {
    if (appliedTopic.current || !initialTopic) return;
    appliedTopic.current = true;
    setValue(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    setHistory(loadHistory());
    try {
      const stored = localStorage.getItem(MODEL_KEY);
      if (stored) setModelId(stored);
    } catch {
      // ignore
    }

    let cancelled = false;
    void (async () => {
      try {
        const catalog = await listAiModels();
        if (cancelled) return;
        setModels(catalog.models);
        setModelId((prev) => {
          if (prev && catalog.models.some((m) => m.modelId === prev)) return prev;
          return catalog.models[0]?.modelId ?? "";
        });
      } catch {
        // AI server may be offline — generation will surface the error
      }
    })();
    void refreshConnectors();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!plusOpen) return;
    void refreshConnectors();
  }, [plusOpen]);

  useEffect(() => {
    if (!assetsOpen) return;
    let cancelled = false;
    setAssetsLoading(true);
    setRecentPhotos(readRecentPhotos().slice(0, 12));
    void listMediaAssets()
      .then((result) => {
        if (cancelled) return;
        if (result.success) setLibraryAssets(result.assets.slice(0, 24));
        else setLibraryAssets([]);
      })
      .catch(() => {
        if (!cancelled) setLibraryAssets([]);
      })
      .finally(() => {
        if (!cancelled) setAssetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assetsOpen]);

  useEffect(() => {
    if (!modelMenuOpen) return;
    const id = window.setTimeout(() => modelSearchRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [modelMenuOpen]);

  useEffect(() => {
    if (!historyMenuOpen) return;
    const id = window.setTimeout(() => historySearchRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [historyMenuOpen]);

  const selected = models.find((m) => m.modelId === modelId) ?? models[0];
  const trimmed = value.trim();
  const canSend = trimmed.length >= 2 && !disabled && !busy && !attaching;
  const connectorById = useMemo(
    () => new Map(connectors.map((c) => [c.id, c])),
    [connectors],
  );

  const availableFilters = useMemo(() => {
    const present = new Set(
      models.map((m) => resolveBrandFromModelId(m.modelId).key),
    );
    return PROVIDER_FILTERS.filter((item) => {
      if (item.id === "all") return true;
      return present.has(item.id);
    });
  }, [models]);

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    return models.filter((model) => {
      if (
        modelFilter !== "all" &&
        resolveBrandFromModelId(model.modelId).key !== modelFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        model.displayName.toLowerCase().includes(q) ||
        model.modelId.toLowerCase().includes(q)
      );
    });
  }, [models, modelQuery, modelFilter]);

  const historyFilters = useMemo(
    () =>
      [
        ["all", t("prompt.historyAll")],
        ["today", t("prompt.historyToday")],
        ["week", t("prompt.historyWeek")],
        ["earlier", t("prompt.historyEarlier")],
      ] as const,
    [t],
  );

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    return history.filter((entry) => {
      if (!matchesHistoryFilter(entry.at, historyFilter)) return false;
      if (!q) return true;
      return entry.text.toLowerCase().includes(q);
    });
  }, [history, historyQuery, historyFilter]);

  const pickModel = (id: string) => {
    setModelId(id);
    try {
      localStorage.setItem(MODEL_KEY, id);
    } catch {
      // ignore
    }
  };

  const modelVoice = (model: AiModelInfo) => {
    const versionKey = modelVoiceKey(model.modelId, model.displayName);
    const brandKey = resolveBrandFromModelId(model.modelId).key;
    if (versionKey && t.has(`prompt.modelVoice.${versionKey}`)) {
      return t(`prompt.modelVoice.${versionKey}`);
    }
    if (t.has(`prompt.modelVoice.${brandKey}`)) {
      return t(`prompt.modelVoice.${brandKey}`);
    }
    return t("prompt.modelVoice.unknown");
  };

  const addFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setAttaching(true);
    try {
      const next: PromptAttachment[] = [...attachments];
      let seededCover: string | null = null;
      for (const file of Array.from(files)) {
        if (next.length >= MAX_ATTACHMENTS) {
          toast.error(t("prompt.tooManyFiles", { max: MAX_ATTACHMENTS }));
          break;
        }
        const isImage = file.type.startsWith("image/");
        const isText =
          file.type.startsWith("text/") ||
          /\.(txt|md|markdown|csv)$/i.test(file.name);

        if (!isImage && !isText) {
          toast.error(t("prompt.unsupportedFile", { name: file.name }));
          continue;
        }

        if (isImage) {
          const dataUrl = await fileToDataUrl(file, { maxEdge: 1600 });
          next.push({
            id: `${file.name}-${file.size}-${Date.now()}-${next.length}`,
            name: file.name,
            kind: "image",
            payload: dataUrl,
          });
          if (!seededCover) seededCover = dataUrl;
        } else {
          const body = await readTextFile(file);
          if (!body) {
            toast.error(t("prompt.emptyFile", { name: file.name }));
            continue;
          }
          next.push({
            id: `${file.name}-${file.size}-${Date.now()}-${next.length}`,
            name: file.name,
            kind: "text",
            payload: body,
          });
        }
      }
      setAttachments(next);
      if (seededCover && !coverUrl) setCoverUrl(seededCover);
      trackEvent("prompt_files_attached", { count: next.length });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("prompt.attachFailed"),
      );
    } finally {
      setAttaching(false);
    }
  };

  const addAssetAttachment = (item: {
    id: string;
    name: string;
    dataUrl: string;
  }) => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(t("prompt.tooManyFiles", { max: MAX_ATTACHMENTS }));
      return;
    }
    if (attachments.some((a) => a.payload === item.dataUrl)) {
      toast.message(t("prompt.assetAlreadyAdded"));
      return;
    }
    setAttachments((prev) => [
      ...prev,
      {
        id: `asset-${item.id}-${Date.now()}`,
        name: item.name,
        kind: "image",
        payload: item.dataUrl,
      },
    ]);
    if (!coverUrl) setCoverUrl(item.dataUrl);
    setPlusOpen(false);
    trackEvent("prompt_asset_attached", { source: "library" });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed?.kind === "image" && removed.payload === coverUrl) {
        const nextImage = prev.find(
          (item) => item.id !== id && item.kind === "image",
        );
        setCoverUrl(nextImage?.payload ?? null);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const pickSkill = (id: PromptSkillId | null) => {
    setSkillId(id);
    const skill = getPromptSkill(id);
    if (skill) setSlidesCount(skill.slidesCount);
  };

  const connectProvider = (id: ConnectorProviderId) => {
    trackEvent("connector_connect_clicked", {
      provider: id,
      source: "prompt_menu",
    });
    window.location.href = `/api/connectors/${id}/connect`;
  };

  const disconnectProvider = async (id: ConnectorProviderId) => {
    setConnectorBusy(id);
    try {
      const res = await disconnectConnectorAction(id);
      if (res.success === false) {
        toast.error(res.error);
        return;
      }
      setConnectors(res.connectors);
      trackEvent("connector_disconnected", {
        provider: id,
        source: "prompt_menu",
      });
      toast.success(t("prompt.disconnected", { name: providerLabel(id) }));
    } finally {
      setConnectorBusy(null);
    }
  };

  const openOptions = () => {
    if (!canSend) return;
    setHandle(pickRandomHandle());
    setOptionsOpen(true);
  };

  const confirmGenerate = () => {
    if (!canSend) return;

    const seedText = attachments
      .filter((a) => a.kind === "text")
      .map((a) => `Attached “${a.name}”: ${a.payload}`)
      .join("\n\n")
      .slice(0, 8000);
    const attachedImages = attachments
      .filter((a) => a.kind === "image")
      .map((a) => a.payload)
      .filter(Boolean);
    const cover = coverUrl?.trim() || attachedImages[0] || undefined;
    const images = [
      ...(cover ? [cover] : []),
      ...attachedImages.filter((url) => url !== cover),
    ];
    // Skill structure is applied on the AI server via skillId; slidesCount
    // comes from the dialog control (skill pick seeds the default).
    const shaped = applyPromptSkill(trimmed, skillId);

    setHistory(pushHistory(trimmed));
    setOptionsOpen(false);
    trackEvent("prompt_submitted", {
      hasCover: Boolean(cover),
      attachments: attachments.length,
      images: images.length,
      language,
      aspectRatio,
      slidesCount,
      skillId: skillId ?? shaped.skillId ?? null,
    });
    void onSubmit({
      topic: trimmed,
      modelId: selected?.modelId,
      cover,
      skillId: shaped.skillId ?? skillId ?? undefined,
      slidesCount,
      language,
      handle: showHandle ? handle : undefined,
      showHandle,
      aspectRatio,
      seedText: seedText || undefined,
      images,
      attachments: attachments.map((a) => ({
        name: a.name,
        kind: a.kind,
        payload: a.payload,
      })),
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="rounded-3xl bg-muted/25 p-2 transition-colors focus-within:bg-muted/35 dark:bg-muted/20 dark:focus-within:bg-muted/30">
        {(attachments.length > 0 || skillId) && (
          <div className="flex min-w-0 flex-wrap gap-1.5 px-2.5 pt-2">
            {skillId ? (
              <span className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md bg-muted/50 px-2 text-[12px] font-medium text-foreground">
                <ScrollText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {t(`prompt.skillItems.${skillId}.label`)}
                </span>
                <button
                  type="button"
                  aria-label={tc("close")}
                  className="rounded-md p-0.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  onClick={() => pickSkill(null)}
                >
                  <X className="size-3" />
                </button>
              </span>
            ) : null}
            {attachments.map((file) => (
              <span
                key={file.id}
                className="inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md bg-muted/50 px-2 text-[12px] text-foreground"
              >
                {file.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.payload}
                    alt=""
                    className="size-4 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={tc("close")}
                  className="rounded-md p-0.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  onClick={() => removeAttachment(file.id)}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              openOptions();
            }
          }}
          rows={2}
          disabled={disabled || busy}
          placeholder={t("placeholderCarousel")}
          className={cn(
            "field-sizing-content min-h-[88px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent px-3.5 pt-3 pb-2 text-[15px] leading-relaxed text-foreground outline-none",
            "placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <div className="flex items-center justify-between gap-2 px-1.5 pb-1">
          <div className="flex min-w-0 items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none fixed top-0 left-0 size-px opacity-0"
              multiple
              accept="image/*,.txt,.md,.markdown,.csv,text/plain,text/markdown,text/csv"
              onChange={(event) => {
                const files = event.target.files;
                event.target.value = "";
                void addFiles(files);
              }}
            />

            <DropdownMenu open={plusOpen} onOpenChange={setPlusOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || busy}
                  aria-label={t("prompt.add")}
                  className={cn(
                    controlSize,
                    "inline-flex items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50",
                  )}
                >
                  <Plus className={menuIconClass} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                collisionPadding={12}
                className="w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl p-1.5"
              >
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] focus:bg-muted/50"
                  disabled={attaching || attachments.length >= MAX_ATTACHMENTS}
                  onPointerDown={(event) => {
                    if (attaching || attachments.length >= MAX_ATTACHMENTS) return;
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  <Paperclip className={menuIconClass} />
                  {t("prompt.addFiles")}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border/50" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] focus:bg-muted/50 data-[state=open]:bg-muted/50">
                    <ScrollText className={menuIconClass} />
                    <span className="flex-1 text-left">{t("prompt.skills")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    collisionPadding={12}
                    className="w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl p-1.5"
                  >
                    {skillGroups.map((group) => {
                      const groupActive = group.skills.some(
                        (s) => s.id === skillId,
                      );

                      if (group.skills.length === 1) {
                        const skill = group.skills[0]!;
                        const active = skillId === skill.id;
                        return (
                          <DropdownMenuItem
                            key={group.id}
                            className={cn(
                              "cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] font-normal focus:bg-muted/50",
                              active && "bg-muted/50",
                            )}
                            onSelect={() => {
                              const next =
                                skillId === skill.id ? null : skill.id;
                              pickSkill(next);
                              trackEvent("prompt_skill_selected", {
                                skillId: next,
                              });
                            }}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-foreground">
                                {t(`prompt.skillItems.${skill.id}.label`)}
                              </span>
                            </span>
                            {active ? (
                              <Check
                                className="size-4 shrink-0 text-foreground"
                                weight="bold"
                              />
                            ) : null}
                          </DropdownMenuItem>
                        );
                      }
                      return (
                        <DropdownMenuSub key={group.id}>
                          <DropdownMenuSubTrigger
                            className={cn(
                              "cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] font-normal focus:bg-muted/50 data-[state=open]:bg-muted/50",
                              groupActive && "bg-muted/40",
                            )}
                          >
                            <span className="flex-1 text-left">
                              {t(`prompt.skillGroups.${group.id}`)}
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent
                            sideOffset={8}
                            collisionPadding={12}
                            className="w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl p-1.5"
                          >
                            {group.skills.map((skill) => {
                              const active = skillId === skill.id;
                              return (
                                <DropdownMenuItem
                                  key={skill.id}
                                  className={cn(
                                    "cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] font-normal focus:bg-muted/50",
                                    active && "bg-muted/50",
                                  )}
                                  onSelect={() => {
                                    const next =
                                      skillId === skill.id ? null : skill.id;
                                    pickSkill(next);
                                    trackEvent("prompt_skill_selected", {
                                      skillId: next,
                                    });
                                  }}
                                >
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-foreground">
                                      {t(
                                        `prompt.skillItems.${skill.id}.label`,
                                      )}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                      {t(
                                        `prompt.skillItems.${skill.id}.hint`,
                                      )}
                                    </span>
                                  </span>
                                  {active ? (
                                    <Check
                                      className="size-4 shrink-0 text-foreground"
                                      weight="bold"
                                    />
                                  ) : null}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] focus:bg-muted/50 data-[state=open]:bg-muted/50">
                    <PlugsIcon className={menuIconClass} />
                    <span className="flex-1 text-left">
                      {t("prompt.connectors")}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    collisionPadding={12}
                    className="w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl p-2"
                  >
                    {CONNECTORS.map((item) => {
                      const state = connectorById.get(item.id);
                      const connected = state?.status === "connected";
                      const needsReconnect =
                        state?.status === "error" || state?.status === "expired";
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2.5 rounded-md px-2 py-2"
                        >
                          <BrandIcon brand={item.brand} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-foreground">
                              {item.label}
                            </div>
                            {connected && state?.displayName ? (
                              <div className="truncate text-[11px] text-muted-foreground">
                                {state.displayName}
                              </div>
                            ) : needsReconnect ? (
                              <div className="text-[11px] text-destructive">
                                {t(`prompt.connectorStatus.${state.status}`)}
                              </div>
                            ) : null}
                          </div>
                          {connected ? (
                            <button
                              type="button"
                              disabled={connectorBusy === item.id}
                              className="h-7 shrink-0 rounded-md bg-muted/40 px-2.5 text-[12px] font-medium text-foreground hover:bg-muted/60 disabled:opacity-50"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void disconnectProvider(item.id);
                              }}
                            >
                              {connectorBusy === item.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                t("prompt.disconnect")
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="h-7 shrink-0 rounded-md bg-muted/40 px-2.5 text-[12px] font-medium text-foreground hover:bg-muted/60"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                connectProvider(item.id);
                              }}
                            >
                              {needsReconnect
                                ? t("prompt.reconnect")
                                : t("prompt.connect")}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <DropdownMenuItem
                      asChild
                      className="mt-1 rounded-md px-2.5 py-2 text-[13px]"
                    >
                      <Link href="/studio/connectors">
                        {t("prompt.manageConnectors")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub onOpenChange={setAssetsOpen}>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] focus:bg-muted/50 data-[state=open]:bg-muted/50">
                    <Shapes className={menuIconClass} />
                    <span className="flex-1 text-left">
                      {t("prompt.addAssets")}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    collisionPadding={12}
                    className="w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl p-1.5"
                  >
                    <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-normal text-muted-foreground">
                      {t("prompt.recentAssets")}
                    </DropdownMenuLabel>
                    {assetsLoading ? (
                      <div className="flex items-center justify-center gap-2 px-2.5 py-6 text-[12px] text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        {tc("loading")}
                      </div>
                    ) : libraryAssets.length === 0 && recentPhotos.length === 0 ? (
                      <div className="px-2.5 py-4 text-[12px] leading-snug text-muted-foreground">
                        {t("prompt.noRecentAssets")}
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {libraryAssets.map((asset) => (
                          <DropdownMenuItem
                            key={asset.id}
                            className="cursor-pointer gap-2.5 rounded-md px-2 py-2 text-[13px] font-normal focus:bg-muted/50"
                            onSelect={(event) => {
                              event.preventDefault();
                              addAssetAttachment({
                                id: asset.id,
                                name: asset.name,
                                dataUrl: asset.dataUrl,
                              });
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.dataUrl}
                              alt=""
                              className="size-8 shrink-0 rounded-md object-cover bg-muted/40"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {asset.name}
                            </span>
                          </DropdownMenuItem>
                        ))}
                        {libraryAssets.length === 0
                          ? recentPhotos.map((photo) => (
                              <DropdownMenuItem
                                key={photo.id}
                                className="cursor-pointer gap-2.5 rounded-md px-2 py-2 text-[13px] font-normal focus:bg-muted/50"
                                onSelect={(event) => {
                                  event.preventDefault();
                                  addAssetAttachment({
                                    id: photo.id,
                                    name: t("prompt.recentPhoto"),
                                    dataUrl: photo.placeSrc || photo.src,
                                  });
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.src}
                                  alt=""
                                  className="size-8 shrink-0 rounded-md object-cover bg-muted/40"
                                />
                                <span className="min-w-0 flex-1 truncate">
                                  {t("prompt.recentPhoto")}
                                </span>
                              </DropdownMenuItem>
                            ))
                          : null}
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-normal focus:bg-muted/50"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Paperclip className={menuIconClass} />
                      {t("prompt.addFiles")}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            {models.length > 0 ? (
              <span className="inline-flex items-center">
              <DropdownMenu
                open={modelMenuOpen}
                onOpenChange={(open) => {
                  setModelMenuOpen(open);
                  if (!open) {
                    setModelQuery("");
                    setModelFilter("all");
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    title={selected?.displayName ?? t("prompt.model")}
                    className={cn(
                      controlH,
                      "inline-flex max-w-[9.5rem] items-center gap-2 rounded-md px-2.5 text-[13px] font-normal text-foreground transition-colors hover:bg-muted/60 data-[state=open]:bg-muted/60 disabled:opacity-60 sm:max-w-[220px]",
                    )}
                  >
                    {selected ? (
                      <AiModelIcon modelId={selected.modelId} />
                    ) : null}
                    <span className="truncate">
                      {selected?.displayName ?? t("prompt.model")}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  collisionPadding={12}
                  className="w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl p-1.5"
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <div
                    className="space-y-2 px-1.5 pb-1.5 pt-1"
                    onPointerDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        ref={modelSearchRef}
                        value={modelQuery}
                        onChange={(event) => setModelQuery(event.target.value)}
                        placeholder={t("prompt.searchModels")}
                        className={cn(
                          controlH,
                          "w-full rounded-md bg-muted/40 pr-3 pl-8 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/60",
                        )}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {availableFilters.map((item) => {
                        const active = modelFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setModelFilter(item.id)}
                            className={cn(
                              "inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium transition-colors",
                              active
                                ? "bg-foreground text-background"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            )}
                          >
                            {item.id !== "all" ? (
                              <span className="mr-1.5 inline-flex">
                                <BrandIcon
                                  brand={item.id}
                                  className="size-3.5"
                                />
                              </span>
                            ) : null}
                            {item.id === "all" ? tc("all") : item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-1.5 bg-border/50" />

                  <div className="max-h-80 overflow-y-auto overscroll-contain">
                    {filteredModels.length === 0 ? (
                      <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                        {t("prompt.noModelsMatch")}
                      </p>
                    ) : (
                      filteredModels.map((model) => (
                        <Tooltip key={model.modelId}>
                          <TooltipTrigger asChild>
                            <DropdownMenuItem
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-normal focus:bg-muted/50",
                                model.modelId === selected?.modelId && "bg-muted/50",
                              )}
                              onSelect={() => pickModel(model.modelId)}
                            >
                              <AiModelIcon modelId={model.modelId} />
                              <span className="min-w-0 flex-1 truncate">
                                {model.displayName}
                              </span>
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={8}
                            className="max-w-72 text-left"
                          >
                            {modelVoice(model)}
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              </span>
            ) : null}

            {history.length > 0 ? (
              <DropdownMenu
                open={historyMenuOpen}
                onOpenChange={(open) => {
                  setHistoryMenuOpen(open);
                  if (!open) {
                    setHistoryQuery("");
                    setHistoryFilter("all");
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    aria-label={t("prompt.recentPrompts")}
                    className={cn(
                      controlSize,
                      "inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50",
                    )}
                  >
                    <HistoryIcon className="size-5 stroke-[1.5]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  collisionPadding={12}
                  className="w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl p-1.5"
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <div
                    className="space-y-2 px-1.5 pb-1.5 pt-1"
                    onPointerDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        ref={historySearchRef}
                        value={historyQuery}
                        onChange={(event) => setHistoryQuery(event.target.value)}
                        placeholder={t("prompt.searchHistory")}
                        className={cn(
                          controlH,
                          "w-full rounded-md bg-muted/40 pr-3 pl-8 text-[13px] outline-none placeholder:text-muted-foreground focus:bg-muted/60",
                        )}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {historyFilters.map(([id, label]) => {
                        const active = historyFilter === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setHistoryFilter(id)}
                            className={cn(
                              "inline-flex h-7 items-center rounded-md px-2 text-[12px] font-normal transition-colors",
                              active
                                ? "bg-foreground text-background"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                  <div className="max-h-80 overflow-y-auto overscroll-contain">
                    {filteredHistory.length === 0 ? (
                      <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                        {t("prompt.noHistoryMatch")}
                      </p>
                    ) : (
                      filteredHistory.map((entry) => {
                        const when = formatHistoryWhen(entry.at, locale);
                        return (
                          <DropdownMenuItem
                            key={entry.text}
                            className="cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-[13px] font-normal focus:bg-muted/50"
                            onSelect={() => setValue(entry.text)}
                          >
                            <span className="line-clamp-2 min-w-0 flex-1">
                              {entry.text}
                            </span>
                            {when ? (
                              <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                                {when}
                              </span>
                            ) : null}
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canSend}
              onClick={openOptions}
              aria-label={t("generate")}
              className={cn(
                controlSize,
                "inline-flex shrink-0 items-center justify-center rounded-full border-none shadow-none transition-colors",
                canSend
                  ? "bg-primary text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground/50"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {busy || attaching ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ArrowUp className="size-5 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-0.5">
          {history.slice(0, 4).map((entry) => (
            <Tooltip key={entry.text}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || busy}
                  onClick={() => setValue(entry.text)}
                  className="max-w-[220px] truncate rounded-md bg-muted/40 px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
                >
                  {entry.text}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6} className="max-w-72 text-left">
                {entry.text}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="px-1 text-[13px] text-destructive">{error}</p>
      ) : null}

      <GenerateOptionsDialog
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        busy={busy}
        topic={value}
        onTopicChange={setValue}
        language={language}
        onLanguageChange={setLanguage}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        slidesCount={slidesCount}
        onSlidesCountChange={setSlidesCount}
        handle={handle}
        onHandleChange={setHandle}
        showHandle={showHandle}
        onShowHandleChange={setShowHandle}
        onConfirm={confirmGenerate}
      />
    </div>
  );
}

function providerLabel(provider: ConnectorProviderId) {
  if (provider === "google-drive") return "Google Drive";
  return provider;
}
