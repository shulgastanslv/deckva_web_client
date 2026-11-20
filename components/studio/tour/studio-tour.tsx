"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { findTourTarget, type TourStepId } from "@/lib/studio/tour";
import { cn } from "@/lib/utils";
import { useStudioTour } from "./use-studio-tour";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;

function readRect(el: HTMLElement | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

function SpotlightCard({
  stepId,
  stepIndex,
  stepCount,
  isLast,
  busy,
  rect,
  centered,
  onNext,
  onSkip,
}: {
  stepId: TourStepId;
  stepIndex: number;
  stepCount: number;
  isLast: boolean;
  busy?: boolean;
  rect: Rect | null;
  centered?: boolean;
  onNext: () => void;
  onSkip: () => void;
}) {
  const t = useTranslations("studio.tour");
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const cardW = Math.min(320, vw - 32);

  let top = Math.max(24, vh / 2 - 90);
  let left = Math.max(16, (vw - cardW) / 2);

  if (!centered && rect) {
    const preferBelow = rect.top + rect.height + 16 + 180 < vh;
    top = preferBelow
      ? rect.top + rect.height + 12
      : Math.max(16, rect.top - 12 - 160);
    left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - cardW / 2),
      vw - cardW - 16,
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-tour-title"
      className={cn(
        "pointer-events-auto fixed z-[70] rounded-2xl bg-popover p-4 text-popover-foreground shadow-sm",
        "border-0 dark:border dark:border-border/50",
      )}
      style={{ top, left, width: cardW }}
    >
      <p className="text-[11px] tabular-nums text-muted-foreground">
        {t("progress", { current: stepIndex + 1, total: stepCount })}
      </p>
      <h2
        id="studio-tour-title"
        className="mt-1 text-[15px] font-medium tracking-tight text-foreground"
      >
        {t(`steps.${stepId}.title`)}
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
        {t(`steps.${stepId}.body`)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="rounded-md px-3 text-[13px] font-normal text-muted-foreground"
          onClick={onSkip}
          disabled={busy}
        >
          {t("skip")}
        </Button>
        <Button
          type="button"
          className="rounded-md px-3.5 text-[13px] font-normal"
          onClick={onNext}
          disabled={busy}
        >
          {busy
            ? t("opening")
            : isLast
              ? t("done")
              : stepId === "openEditor"
                ? t("openEditorCta")
                : t("next")}
        </Button>
      </div>
    </div>
  );
}

export function StudioTour() {
  const tour = useStudioTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const skipMissingRef = useRef(tour.next);

  useEffect(() => {
    skipMissingRef.current = tour.next;
  }, [tour.next]);

  const isAction = Boolean(tour.step && "action" in tour.step && tour.step.action);
  const needsTarget = tour.active && tour.stepId && !isAction;

  useLayoutEffect(() => {
    if (!needsTarget || !tour.stepId) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let tries = 0;
    let timer = 0;

    const measure = () => {
      if (cancelled || !tour.stepId) return;
      const el = findTourTarget(tour.stepId);
      const next = readRect(el);
      if (next) {
        setRect(next);
        el?.scrollIntoView({ block: "nearest", inline: "nearest" });
        return;
      }
      tries += 1;
      if (tries < 30) {
        timer = window.setTimeout(measure, 50);
        return;
      }
      void skipMissingRef.current();
    };

    measure();

    const onResize = () => {
      if (!tour.stepId) return;
      setRect(readRect(findTourTarget(tour.stepId)));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [needsTarget, tour.stepId]);

  useEffect(() => {
    if (!tour.active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        tour.skip();
      } else if (event.key === "Enter" || event.key === "ArrowRight") {
        event.preventDefault();
        void tour.next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tour]);

  if (!tour.active || !tour.stepId) return null;
  if (needsTarget && !rect) return null;

  const hole = rect
    ? {
        top: Math.max(0, rect.top),
        left: Math.max(0, rect.left),
        width: rect.width,
        height: rect.height,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[60]" aria-live="polite">
      <button
        type="button"
        aria-label="Dismiss tour backdrop"
        className="absolute inset-0 cursor-default bg-transparent"
        onClick={tour.skip}
      />
      {hole ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-background/80"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-black/55" />
      )}
      <SpotlightCard
        stepId={tour.stepId}
        stepIndex={tour.stepIndex}
        stepCount={tour.stepCount}
        isLast={tour.isLast}
        busy={tour.busy}
        rect={rect}
        centered={isAction || !rect}
        onNext={() => void tour.next()}
        onSkip={tour.skip}
      />
    </div>
  );
}
