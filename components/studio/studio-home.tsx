"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpIcon,
  BookOpenIcon,
  CircleHelpIcon,
  LayoutTemplateIcon,
  LightbulbIcon,
  ListChecksIcon,
  Loader2,
  PlusIcon,
  ScaleIcon,
  SparklesIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";

import {
  getUserProjects,
  type ProjectListItem,
} from "@/actions/projects";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { cn } from "@/lib/utils";
import { LogoAnimated } from "@/components/logo-animated";
import { StudioHomeHeader } from "@/components/studio/studio-home-header";

const PROMPT_SUGGESTIONS = [
  {
    label: "Mistakes",
    seed: "Common mistakes that kill carousel results — and the fix",
    icon: CircleHelpIcon,
  },
  {
    label: "Framework",
    seed: "A simple named framework people can reuse today",
    icon: LayoutTemplateIcon,
  },
  {
    label: "Story",
    seed: "A short founder story with one sharp lesson",
    icon: BookOpenIcon,
  },
  {
    label: "Checklist",
    seed: "A launch checklist before you hit publish",
    icon: ListChecksIcon,
  },
  {
    label: "Contrarian",
    seed: "A contrarian take on advice everyone repeats",
    icon: ScaleIcon,
  },
  {
    label: "FAQ",
    seed: "Questions people ask before they start",
    icon: LightbulbIcon,
  },
  {
    label: "Playbook",
    seed: "A day-one playbook to get the first win",
    icon: SparklesIcon,
  },
] as const;

const PLACEHOLDER_PROMPTS = [
  "A 5-slide carousel about shipping in public…",
  "Common mistakes that kill carousel results — and the fix",
  "A simple framework people can reuse today",
  "A short founder story with one sharp lesson",
  "A launch checklist before you hit publish",
] as const;

const actionBtn =
  "size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground";

function useTypingPlaceholder(
  examples: readonly string[],
  enabled: boolean,
) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!enabled || examples.length === 0) {
      setText("");
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const full = examples[index % examples.length] ?? "";
    let i = 0;
    let deleting = false;

    const tick = () => {
      if (cancelled) return;
      if (!deleting) {
        i += 1;
        setText(full.slice(0, i));
        if (i >= full.length) {
          deleting = true;
          timeout = setTimeout(tick, 1600);
          return;
        }
        timeout = setTimeout(tick, 26);
        return;
      }
      i -= 1;
      setText(full.slice(0, Math.max(i, 0)));
      if (i <= 0) {
        setIndex((n) => (n + 1) % examples.length);
        return;
      }
      timeout = setTimeout(tick, 14);
    };

    timeout = setTimeout(tick, 320);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [enabled, examples, index]);

  return {
    text,
    full: examples[index % examples.length] ?? "",
  };
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-4/5 rounded-2xl border border-border bg-muted" />
      <div className="space-y-1.5 px-0.5">
        <div className="h-2.5 w-[55%] rounded-full bg-muted" />
        <div className="h-2 w-[38%] rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function StudioHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userId = session?.user?.id;
  const canSubmit = Boolean(theme.trim()) && !submitting;
  const showPlaceholder = !theme.trim();
  const { text: placeholderText, full: placeholderFull } = useTypingPlaceholder(
    PLACEHOLDER_PROMPTS,
    showPlaceholder && !submitting,
  );

  const acceptPlaceholder = () => {
    if (!placeholderFull) return;
    setTheme(placeholderFull);
  };

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      return;
    }
    let alive = true;
    setLoadingProjects(true);
    void getUserProjects()
      .then((res) => {
        if (!alive) return;
        if (res.success) setProjects(res.projects.slice(0, 5));
        else setProjects([]);
      })
      .finally(() => {
        if (alive) setLoadingProjects(false);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  const requireAuth = () => {
    if (status === "authenticated") return true;
    setAuthOpen(true);
    return false;
  };

  const goEditor = () => {
    if (!requireAuth()) return;
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  const submitPrompt = () => {
    const trimmed = theme.trim();
    if (!trimmed || submitting) return;
    if (!requireAuth()) return;
    setSubmitting(true);
    stashStudioIntent({ type: "generate", theme: trimmed, slides: 5 });
    router.push("/studio/editor");
  };

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <StudioHomeHeader />
      <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-8 pb-16 pt-[clamp(32px,8vh,80px)]">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Design is easier with
              <span className="ml-2.5 inline-flex items-center justify-center align-middle">
                <LogoAnimated width={36} height={36} href="/studio" />
              </span>
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              One prompt. Many slides. Ready to post.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <PromptInput
              value={theme}
              onValueChange={setTheme}
              onSubmit={submitPrompt}
              isLoading={submitting}
              maxHeight={160}
              className="w-full rounded-[28px] border border-border bg-background px-4 pb-3 pt-4 shadow-none"
            >
              <div className="relative bg-background text-left">
                <PromptInputTextarea
                  placeholder=""
                  aria-label="Carousel prompt"
                  className="min-h-[64px] bg-transparent px-1 py-0 text-base leading-relaxed text-foreground dark:bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && showPlaceholder) {
                      e.preventDefault();
                      acceptPlaceholder();
                    }
                  }}
                />
                {showPlaceholder ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-1 top-0 py-0 text-left text-base leading-relaxed text-muted-foreground/55"
                  >
                    {placeholderText}
                    <span className="ml-px inline-block h-[1.05em] w-px translate-y-[0.12em] bg-muted-foreground/45 align-middle" />
                  </div>
                ) : null}
              </div>
              <PromptInputActions className="mt-2 h-9 items-center justify-between px-0">
                <div className="flex h-9 items-center gap-0.5">
                  <PromptInputAction tooltip="New blank project">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={actionBtn}
                      onClick={goEditor}
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </PromptInputAction>
                  <PromptInputAction tooltip="Open templates">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={actionBtn}
                      onClick={() => router.push("/studio/templates")}
                    >
                      <BookOpenIcon className="size-4" />
                    </Button>
                  </PromptInputAction>
                </div>
                <div className="flex h-9 items-center gap-0.5">
                  <PromptInputAction tooltip="Use suggested prompt (Tab)">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={actionBtn}
                      onClick={acceptPlaceholder}
                      disabled={!showPlaceholder}
                    >
                      <LightbulbIcon className="size-4" />
                    </Button>
                  </PromptInputAction>
                  <PromptInputAction tooltip="Generate carousel">
                    <Button
                      type="button"
                      size="icon"
                      className={cn(
                        "size-9 shrink-0 rounded-full transition-colors",
                        canSubmit
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "bg-muted text-muted-foreground",
                      )}
                      disabled={!canSubmit}
                      onClick={submitPrompt}
                      aria-label="Generate carousel"
                    >
                      {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowUpIcon className="size-4" />
                      )}
                    </Button>
                  </PromptInputAction>
                </div>
              </PromptInputActions>
            </PromptInput>
          </motion.div>

          <motion.div
            className="mt-5 flex max-w-[720px] flex-wrap items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.3 }}
          >
            {PROMPT_SUGGESTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <PromptSuggestion
                  key={item.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(item.seed)}
                  className="h-9 gap-1.5 rounded-full border-border bg-transparent px-3.5 text-sm font-medium text-foreground shadow-none hover:bg-muted"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  {item.label}
                </PromptSuggestion>
              );
            })}
          </motion.div>
        </div>

        <motion.section
          className="pt-[clamp(48px,8vh,96px)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Recent projects
            </h2>
            <button
              type="button"
              onClick={() => router.push("/studio/projects")}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              See all
            </button>
          </div>

          {!userId || loadingProjects ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() =>
                    router.push(`/studio/editor?project=${project.id}`)
                  }
                  className="group flex flex-col gap-2.5 text-left hover:opacity-80 transition-all duration-300"
                >
                  <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-muted hover:cursor-pointer transition-all duration-300 border border-border">
                    {project.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.previewUrl}
                        alt=""
                        className="size-full object-cover"
                        draggable={false}
                      />
                    ) : null}
                  </div>
                  <div className="space-y-0.5 px-0.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {project.title || "Untitled"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      Project
                    </p>
                  </div>
                </button>
              ))}
              {projects.length < 5
                ? Array.from({ length: 5 - projects.length }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))
                : null}
            </div>
          )}
        </motion.section>
      </div>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
