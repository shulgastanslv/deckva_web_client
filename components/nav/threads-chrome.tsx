"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/** Threads web rail / phone tab bar. One tree, two layouts. */
export const THREADS_RAIL_PX = 72;

export const threadsContentOffset =
  "pt-12 pb-[calc(56px+env(safe-area-inset-bottom,0px))] md:pt-0 md:pb-0 md:pl-[72px]";

export function useThreadsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

export function threadsSlotClass(active?: boolean) {
  return cn(
    "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "text-foreground"
      : "text-neutral-400 hover:text-foreground dark:text-neutral-500 dark:hover:text-foreground",
  );
}

export function ThreadsMenuMark() {
  return (
    <span className="flex flex-col items-center gap-[5px]" aria-hidden>
      <span className="h-[1.5px] w-[18px] rounded-full bg-current" />
      <span className="h-[1.5px] w-[18px] rounded-full bg-current" />
    </span>
  );
}

/** The Threads compose control: plus inside a wide rounded rectangle. */
export function ThreadsComposeGlyph() {
  return (
    <span className="flex h-7 w-[42px] items-center justify-center rounded-[10px] border border-foreground/20 text-foreground">
      <Plus className="size-[18px]" strokeWidth={1.75} />
    </span>
  );
}

export function ThreadsChrome({
  logo,
  headerAction,
  footer,
  children,
  className,
}: {
  logo: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 grid h-12 grid-cols-[52px_1fr_52px] items-center bg-background md:hidden",
          className,
        )}
      >
        <span />
        <div className="flex justify-center">{logo}</div>
        <div className="flex justify-center">{headerAction}</div>
      </header>

      <nav
        aria-label="Main"
        className={cn(
          "fixed z-40 flex bg-background",
          "inset-x-0 bottom-0 h-[calc(56px+env(safe-area-inset-bottom,0px))] flex-row items-start justify-between border-t border-border/70 px-1 pt-1",
          "md:inset-y-0 md:right-auto md:bottom-auto md:left-0 md:h-dvh md:w-[72px] md:flex-col md:items-center md:justify-between md:border-t-0 md:px-0 md:py-4 md:pt-4",
          className,
        )}
      >
        <div className="hidden h-11 items-center md:flex">{logo}</div>
        <div className="flex w-full flex-row items-center justify-around md:w-auto md:flex-1 md:flex-col md:justify-center md:gap-1">
          {children}
        </div>
        <div className="hidden h-12 items-center md:flex">{footer}</div>
      </nav>
    </>
  );
}
