"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Loader2,
  Mail,
  MailOpen,
  Maximize2,
  Search,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  deleteNotification,
  markNotificationsRead,
  toggleNotificationRead,
  type NotificationItem,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messages } from "@/lib/messages";
import {
  fetchMyNotifications,
  invalidateStudioNotifications,
  markNotificationCacheRead,
  studioKeys,
  useMyNotifications,
} from "@/lib/studio/queries";
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function plainPreview(body: string) {
  return body
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, "$1")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="space-y-3 text-[14px] leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-semibold tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[15px] font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p className="text-muted-foreground">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-[#4262ff] underline underline-offset-2"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[12px]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-2xl bg-muted/40 p-3 font-mono text-[12px]">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-muted-foreground/30 pl-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

function ReadModal({
  item,
  onClose,
}: {
  item: NotificationItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[85vh] w-[min(36rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-xl"
        showCloseButton
      >
        <DialogHeader className="gap-1 px-6 pt-6 pb-3 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {item?.title}
          </DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            {item ? formatWhen(item.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] flex-1 px-6 pb-6">
          <MarkdownBody source={item?.body || ""} />
          {item?.href ? (
            <div className="mt-6">
              <Button
                type="button"
                className="h-10 rounded-md px-5 text-[13px] font-medium"
                onClick={() => {
                  window.location.href = item.href!;
                }}
              >
                Open invite
              </Button>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function NotificationsPanel({
  filter,
  setFilter,
  items,
  loading,
}: {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  items: NotificationItem[];
  loading: boolean;
}) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [readingItem, setReadingItem] = useState<NotificationItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = items
    .filter((item) => (filter === "unread" ? !item.read : true))
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q)
      );
    });

  const patchCache = (
    updater: (items: NotificationItem[]) => NotificationItem[],
  ) => {
    queryClient.setQueryData(
      studioKeys.notifications,
      (old: { items: NotificationItem[]; unread: number } | undefined) => {
        if (!old) return old;
        const nextItems = updater(old.items);
        return {
          ...old,
          items: nextItems,
          unread: nextItems.filter((item) => !item.read).length,
        };
      },
    );
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    patchCache((rows) => rows.filter((item) => item.id !== id));
    try {
      await deleteNotification(id);
      await invalidateStudioNotifications(queryClient);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleRead = async (id: string, currentReadStatus: boolean) => {
    setBusyId(id);
    patchCache((rows) =>
      rows.map((item) =>
        item.id === id ? { ...item, read: !currentReadStatus } : item,
      ),
    );
    try {
      await toggleNotificationRead(id, !currentReadStatus);
      await invalidateStudioNotifications(queryClient);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-bold text-foreground">
            {messages.notifications.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md border-none bg-muted/40 py-2 pr-4 pl-10 text-[13px] focus-visible:ring-2 focus-visible:ring-[#2f5bff]/20"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="h-9 rounded-md border-none bg-muted/40 px-4 text-[13px] font-medium"
              >
                {FILTER_LABEL[filter]}
                <ChevronDown className="ml-1 size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[120px] rounded-2xl p-1.5"
            >
              {(Object.keys(FILTER_LABEL) as Filter[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
                  className="cursor-pointer rounded-xl px-3 py-2 text-[13px]"
                >
                  {filter === key ? (
                    <Check className="mr-2 size-3.5" />
                  ) : (
                    <span className="mr-2 size-3.5" />
                  )}
                  {FILTER_LABEL[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="flex-1 px-2 pb-2">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center px-8 text-center">
              <p className="text-[18px] font-medium text-foreground">
                Nothing here
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {searchQuery
                  ? "Try another search"
                  : messages.notifications.emptyBody}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {visible.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "group relative rounded-[20px] px-4 py-3.5 transition-colors hover:bg-muted/40",
                    !item.read && "bg-[#2f5bff]/[0.04] dark:bg-[#2f5bff]/10",
                    busyId === item.id && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setReadingItem(item)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-1 text-[13px] font-bold text-foreground">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatWhen(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                      {plainPreview(item.body)}
                    </p>
                  </button>

                  {item.href ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        className="h-8 rounded-md px-3 text-[12px] font-medium"
                        onClick={() => {
                          window.location.href = item.href!;
                        }}
                      >
                        Open invite
                      </Button>
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setReadingItem(item)}
                      title="Read"
                      className="size-8 rounded-md"
                    >
                      <Maximize2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleToggleRead(item.id, item.read)}
                      title={item.read ? "Mark unread" : "Mark read"}
                      className="size-8 rounded-md"
                    >
                      {item.read ? (
                        <Mail className="size-3.5" />
                      ) : (
                        <MailOpen className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDelete(item.id)}
                      title="Delete"
                      className="size-8 rounded-md text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>

      <ReadModal item={readingItem} onClose={() => setReadingItem(null)} />
    </>
  );
}

export function StudioNotifications({
  className,
}: {
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { status } = useSession();
  const signedIn = status === "authenticated";

  const notifications = useMyNotifications(signedIn);

  const items = notifications.data?.items ?? [];
  const unread = notifications.data?.unread ?? 0;
  const loading = signedIn && !notifications.data && !notifications.isError;
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!open || !signedIn) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchMyNotifications(queryClient);
        if (cancelled || res.unread === 0) return;
        const marked = await markNotificationsRead();
        if (cancelled || !marked.success) return;
        markNotificationCacheRead(queryClient);
      } catch {
        // ignore background refresh errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, signedIn, queryClient]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className={cn(
            "relative flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60",
            open && "bg-muted/60",
            className,
          )}
        >
          <Bell className="size-5 stroke-[2]" />
          {unread > 0 ? (
            <span className="absolute top-2 right-2.5 size-2.5 rounded-full border-2 border-background bg-[#2f5bff]" />
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        alignOffset={-4}
        className="h-[min(480px,calc(100dvh-32px))] w-xs overflow-hidden rounded-[28px] p-0"
      >
        <NotificationsPanel
          filter={filter}
          setFilter={setFilter}
          items={items}
          loading={loading}
        />
      </PopoverContent>
    </Popover>
  );
}
