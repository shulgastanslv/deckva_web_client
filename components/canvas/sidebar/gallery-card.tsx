"use client";

import type { ReactNode } from "react";
import {
  SpinnerGap as Loader2,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const RECENT_COUNT = 6;

export function carouselMeta(slideCount: number, aspectRatio: string) {
  const count = Math.max(1, slideCount || 1);
  return `${count} ${count === 1 ? "slide" : "slides"} · ${aspectRatio}`;
}

export function splitGallery<T>(items: T[], expanded: boolean) {
  if (expanded || items.length <= RECENT_COUNT) {
    return { recent: items, more: [] as T[] };
  }
  return {
    recent: items.slice(0, RECENT_COUNT),
    more: items.slice(RECENT_COUNT),
  };
}

export function GallerySection({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
        {action ? (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {action}
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </section>
  );
}

export function GalleryCard({
  title,
  previewUrl,
  meta,
  busy,
  active,
  onClick,
  badge,
  menu,
}: {
  title: string;
  previewUrl?: string | null;
  meta?: string;
  busy?: boolean;
  active?: boolean;
  onClick: () => void;
  badge?: ReactNode;
  menu?: ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-1.5">
      <div className="relative">
        <button
          type="button"
          disabled={busy}
          onClick={onClick}
          className={cn(
            "relative block aspect-4/5 w-full hover:opacity-80 cursor-pointer hover:rotate-2 duration-300 border border-border/50 overflow-hidden rounded-md bg-muted/50  disabled:opacity-60",
            active && "ring-foreground",
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium leading-tight text-muted-foreground">
              {title}
            </span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="size-3.5 animate-spin" />
            </span>
          ) : null}
        </button>
        {menu ? <div className="absolute top-1 right-1 z-10">{menu}</div> : null}
        {badge ? <div className="absolute right-1 bottom-1 z-10">{badge}</div> : null}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        className="flex min-w-0 flex-col px-0.5 text-left disabled:opacity-60"
      >
        <span className="truncate text-[13px] font-medium text-foreground">{title}</span>
        {meta ? <span className="truncate text-[10px] text-muted-foreground">{meta}</span> : null}
      </button>
    </div>
  );
}