"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, ChevronDown, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  listMyNotifications,
  markNotificationsRead,
  type NotificationItem,
} from "@/actions/admin";
import { cn } from "@/lib/utils";

type Filter = "unread" | "all";

const FILTER_LABEL: Record<Filter, string> = {
  unread: "Unread",
  all: "All",
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function NotificationsPanel({
  onClose,
  filter,
  setFilter,
  items,
  loading,
}: {
  onClose: () => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  items: NotificationItem[];
  loading: boolean;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const visible =
    filter === "unread" ? items.filter((item) => !item.read) : items;

  return (
    <div className="flex h-[min(440px,calc(100dvh-32px))] w-[360px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] dark:border-border dark:bg-background">
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <h2 className="text-[16px] font-bold text-neutral-950 dark:text-foreground">
          Notifications
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="relative px-4 pb-2">
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 dark:text-foreground dark:hover:bg-muted"
        >
          {FILTER_LABEL[filter]}
          <ChevronDown className="size-3.5 text-neutral-400" />
        </button>
        {filterOpen ? (
          <div className="absolute top-8 left-4 z-10 min-w-[140px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-border dark:bg-background">
            {(Object.keys(FILTER_LABEL) as Filter[]).map((key) => (
              <button
                key={key}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-neutral-50 dark:hover:bg-muted"
                onClick={() => {
                  setFilter(key);
                  setFilterOpen(false);
                }}
              >
                {filter === key ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="size-3.5" />
                )}
                {FILTER_LABEL[key]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-4 animate-spin text-neutral-400" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 pb-10 text-center">
            <p
              className="text-[24px] leading-snug text-neutral-950 dark:text-foreground"
              style={{
                fontFamily:
                  "var(--font-studio-serif), ui-serif, Georgia, serif",
              }}
            >
              No notifications yet
            </p>
            <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-neutral-500 dark:text-muted-foreground">
              Updates about your carousels and workspace will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-border">
            {visible.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "px-5 py-3.5",
                  !item.read && "bg-[#2f5bff]/[0.03]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold text-neutral-950 dark:text-foreground">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-[11px] text-neutral-400">
                    {formatWhen(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-neutral-500 dark:text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function StudioNotifications({
  className,
}: {
  className?: string;
}) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setItems([]);
      setUnread(0);
      return;
    }
    setLoading(true);
    try {
      const res = await listMyNotifications();
      if (res.success) {
        setItems(res.items);
        setUnread(res.unread);
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 10;
      setCoords({
        top: Math.max(12, rect.bottom + gap),
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };

    place();
    void refresh();
    void markNotificationsRead().then(() => {
      setUnread(0);
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    });

    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => place();

    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, refresh]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-muted-foreground dark:hover:bg-muted",
          open && "bg-neutral-100 dark:bg-muted",
          className,
        )}
      >
        <Bell className="size-[18px] stroke-[1.75]" />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#2f5bff]" />
        ) : null}
      </button>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              style={{
                position: "fixed",
                top: coords.top,
                right: coords.right,
                zIndex: 80,
              }}
            >
              <NotificationsPanel
                onClose={() => setOpen(false)}
                filter={filter}
                setFilter={setFilter}
                items={items}
                loading={loading}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
