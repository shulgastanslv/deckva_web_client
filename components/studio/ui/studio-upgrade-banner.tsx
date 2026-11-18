"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WarningCircle, X } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FaTelegram, FaThreads } from "react-icons/fa6";

import { getGenerationStatus } from "@/actions/ai";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { SOCIAL_LINKS } from "@/lib/social";
import { cn } from "@/lib/utils";

const SOCIAL_DISMISS_KEY = "studio:social-banner-dismissed";
const LIMIT_DISMISS_KEY = "studio:daily-limit-banner-dismissed";

type SlideId = "social" | "limit";

type Slide = {
  id: SlideId;
  icon: ReactNode;
  body: ReactNode;
};

export function StudioUpgradeBanner({ className }: { className?: string }) {
  const t = useTranslations("studio.upgrade");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [exhausted, setExhausted] = useState(false);
  const [socialDismissed, setSocialDismissed] = useState(false);
  const [limitDismissed, setLimitDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSocialDismissed(sessionStorage.getItem(SOCIAL_DISMISS_KEY) === "1");
    setLimitDismissed(sessionStorage.getItem(LIMIT_DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    void (async () => {
      try {
        const row = await getGenerationStatus();
        if (!cancelled) {
          setExhausted(!row.entitlement.canGenerate);
        }
      } catch {
        // ignore
      }
    })();
    const onChanged = (event: Event) => {
      const entitlement = (
        event as CustomEvent<{
          entitlement?: { remaining?: number; canGenerate?: boolean };
        }>
      ).detail?.entitlement;
      if (entitlement && typeof entitlement.canGenerate === "boolean") {
        setExhausted(!entitlement.canGenerate);
      }
    };
    window.addEventListener("studio:generations-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:generations-changed", onChanged);
    };
  }, [signedIn]);

  const showSocial = mounted && !socialDismissed;
  const showLimit = mounted && exhausted && !limitDismissed;

  const slides = useMemo<Slide[]>(() => {
    const next: Slide[] = [];
    if (showSocial) {
      next.push({
        id: "social",
        icon: (
          <span className="flex shrink-0 items-center gap-1.5 text-foreground/85">
            <FaThreads className="size-4" aria-hidden />
            <FaTelegram className="size-4" aria-hidden />
          </span>
        ),
        body: t.rich("followSocial", {
          threads: (chunks) => (
            <a
              href={SOCIAL_LINKS.threads}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline decoration-foreground/25 underline-offset-2 transition-colors hover:decoration-foreground/60"
            >
              {chunks}
            </a>
          ),
          telegram: (chunks) => (
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline decoration-foreground/25 underline-offset-2 transition-colors hover:decoration-foreground/60"
            >
              {chunks}
            </a>
          ),
        }),
      });
    }
    if (showLimit) {
      next.push({
        id: "limit",
        icon: (
          <WarningCircle
            className="size-5 shrink-0 stroke-[1.75] opacity-95"
            aria-hidden
          />
        ),
        body: t("dailyLimitReached", { limit: DAILY_GENERATION_LIMIT }),
      });
    }
    return next;
  }, [showSocial, showLimit, t]);

  useEffect(() => {
    if (!showLimit) return;
    const index = slides.findIndex((s) => s.id === "limit");
    if (index >= 0) setActive(index);
  }, [showLimit, slides]);

  useEffect(() => {
    if (active >= slides.length) {
      setActive(Math.max(0, slides.length - 1));
    }
  }, [active, slides.length]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const child = node.children[active] as HTMLElement | undefined;
    if (!child) return;
    node.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, [active, slides.length]);

  const onScroll = useCallback(() => {
    const node = scrollerRef.current;
    if (!node || slides.length <= 1) return;
    const width = node.clientWidth || 1;
    const index = Math.round(node.scrollLeft / width);
    setActive(Math.min(slides.length - 1, Math.max(0, index)));
  }, [slides.length]);

  const dismissCurrent = () => {
    const slide = slides[active];
    if (!slide) return;
    if (slide.id === "social") {
      sessionStorage.setItem(SOCIAL_DISMISS_KEY, "1");
      setSocialDismissed(true);
      return;
    }
    sessionStorage.setItem(LIMIT_DISMISS_KEY, "1");
    setLimitDismissed(true);
  };

  if (!signedIn || !mounted || slides.length === 0) return null;

  return (
    <div className={cn("mb-4 w-full shrink-0 pt-2", className)}>
      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-foreground">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className={cn(
            "flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex w-full shrink-0 snap-start items-center gap-3 pr-1"
            >
              {slide.icon}
              <p className="min-w-0 flex-1 text-[13px] leading-snug sm:text-[14px]">
                {slide.body}
              </p>
            </div>
          ))}
        </div>

        {slides.length > 1 ? (
          <div className="flex shrink-0 items-center gap-1">
            {slides.map((dot, index) => (
              <button
                key={dot.id}
                type="button"
                aria-label={t("slideDot", { index: index + 1 })}
                aria-current={index === active}
                onClick={() => setActive(index)}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  index === active
                    ? "bg-foreground/70"
                    : "bg-foreground/25 hover:bg-foreground/40",
                )}
              />
            ))}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={t("dismiss")}
          onClick={dismissCurrent}
          className="shrink-0 rounded-md p-1 opacity-80 transition-opacity hover:bg-foreground/10 hover:opacity-100"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
