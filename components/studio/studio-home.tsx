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

import { AuthModal } from "@/components/auth";
import { StudioRecentProjects } from "@/components/studio/studio-recent-projects";
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

export function StudioHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const userId = session?.user?.id;
  const showRecents = status === "authenticated" && Boolean(userId);


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
    <div
      className={cn(
        "h-screen bg-background px-6 text-foreground sm:px-8 overflow-y-auto",
        showRecents
          ? "flex flex-col"
          : "flex items-center justify-center",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col items-center justify-center",
          showRecents
            ? "max-w-[1200px] py-10 mt-20"
            : "max-w-[7500px] py-10",
        )}
      >
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Привет, {"Stas"}
            <span className="ml-2.5 inline-flex items-center justify-center align-middle">
              <LogoAnimated width={36} height={36} href="/studio" />
            </span>
          </h1>
          <p className="mt-2 text-base font-normal tracking-normal text-muted-foreground">
            Один запрос. Много слайдов. Готовы к публикации.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 w-full max-w-[750px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <PromptInput
            value={theme}
            onValueChange={setTheme}
            onSubmit={submitPrompt}
            isLoading={submitting}
            maxHeight={250}
            className="w-full rounded-[28px] border border-border dark:bg-muted/50 px-4 pb-3 pt-4 shadow-none"
          >
            <div className="relative bg-transparent text-left">
              <PromptInputTextarea
                placeholder=""
                aria-label="Carousel prompt"
                className="min-h-[44px] bg-transparent px-1 py-0 text-base leading-relaxed text-foreground dark:bg-transparent"
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
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-primary text-white hover:bg-primary/90",
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

          <motion.div
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
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
        </motion.div>

        {showRecents ? (
          <motion.div
            className="mt-10 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <StudioRecentProjects userId={userId} />
          </motion.div>
        ) : null}
      </div>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
