"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Check, ChevronDown, Loader2, Search, 
  Trash2, MailOpen, Mail, Maximize2 
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";

import { 
  markNotificationsRead, 
  deleteNotification,
  toggleNotificationRead,
  type NotificationItem 
} from "@/actions/admin";
import { messages } from "@/lib/messages";
import {
  fetchMyNotifications,
  markNotificationCacheRead,
  useMyNotifications,
} from "@/lib/studio/queries";
import { cn } from "@/lib/utils";

// Импорты shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

// === Модальное окно для чтения Markdown ===
function ReadModal({ 
  item, 
  onClose 
}: { 
  item: NotificationItem | null; 
  onClose: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-y-auto flex flex-col rounded-[32px] p-0 border-none bg-white dark:bg-neutral-900 gap-0 w-xl max-h-[85vh] min-w-[500px]">
        <DialogHeader className="p-6 pb-2 text-left">
          <DialogTitle className="text-xl font-bold text-neutral-950 dark:text-foreground">
            {item?.title}
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs text-neutral-500">
            {item ? formatWhen(item.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6 pt-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
            <ReactMarkdown>{item?.body || ""}</ReactMarkdown>
          </div>
          {item?.href ? (
            <div className="mt-6">
              <Button
                type="button"
                className="h-10 rounded-full px-5 text-[13px] font-medium"
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

  const visible = items
    .filter((item) => (filter === "unread" ? !item.read : true))
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q);
    });

  const handleDelete = async (id: string) => {
    queryClient.setQueryData(["my-notifications"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.filter((i: NotificationItem) => i.id !== id),
      };
    });
    await deleteNotification(id);
    queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
  };

  const handleToggleRead = async (id: string, currentReadStatus: boolean) => {
    queryClient.setQueryData(["my-notifications"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map((i: NotificationItem) =>
          i.id === id ? { ...i, read: !currentReadStatus } : i
        ),
      };
    });
    await toggleNotificationRead(id, !currentReadStatus);
    queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Шапка */}
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-bold text-neutral-950 dark:text-foreground">
            {messages.notifications.title}
          </h2>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-neutral-100 py-2 pl-10 pr-4 text-[13px] border-none focus-visible:ring-2 focus-visible:ring-[#2f5bff]/20 dark:bg-neutral-800 dark:text-foreground h-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                className="rounded-full h-9 px-4 text-[13px] font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-none"
              >
                {FILTER_LABEL[filter]}
                <ChevronDown className="ml-1 size-3.5 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 min-w-[120px]">
              {(Object.keys(FILTER_LABEL) as Filter[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
                  className="rounded-xl px-3 py-2 text-[13px] cursor-pointer"
                >
                  {filter === key ? (
                    <Check className="size-3.5 mr-2" />
                  ) : (
                    <span className="size-3.5 mr-2" />
                  )}
                  {FILTER_LABEL[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Список */}
        <ScrollArea className="flex-1 px-2 pb-2">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-neutral-400" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center px-8 text-center">
              <p className="text-[18px] font-medium text-neutral-950 dark:text-foreground">
                Ничего не найдено
              </p>
              <p className="mt-2 text-[13px] text-neutral-500 dark:text-muted-foreground">
                {searchQuery ? "Попробуйте изменить запрос" : messages.notifications.emptyBody}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {visible.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "group relative rounded-[20px] px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                    !item.read && "bg-[#2f5bff]/[0.04] dark:bg-[#2f5bff]/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-bold text-neutral-950 line-clamp-1 dark:text-foreground">
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-neutral-400">
                      {formatWhen(item.createdAt)}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-[12px] leading-relaxed text-neutral-500 line-clamp-2 dark:text-muted-foreground">
                    {item.body.replace(/\*\*/g, "")}
                  </p>

                  {item.href ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        className="h-8 rounded-full px-3 text-[12px] font-medium"
                        onClick={() => {
                          window.location.href = item.href!;
                        }}
                      >
                        Open invite
                      </Button>
                    </div>
                  ) : null}

                  {/* Кнопки действий */}
                  <div className="mt-3 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setReadingItem(item)}
                      title="Читать полностью"
                      className="size-8 rounded-full bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                    >
                      <Maximize2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleRead(item.id, item.read)}
                      title={item.read ? "Отметить непрочитанным" : "Отметить прочитанным"}
                      className="size-8 rounded-full bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                    >
                      {item.read ? <Mail className="size-3.5" /> : <MailOpen className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      title="Удалить"
                      className="size-8 rounded-full bg-white text-red-400 hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:hover:bg-red-900/30 dark:hover:text-red-500"
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

  // === АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ ПРИ ИЗМЕНЕНИИ ===
  useEffect(() => {
    if (!signedIn) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    }, 15000);

    return () => clearInterval(interval);
  }, [signedIn, queryClient]);

  // Вызываем пометку прочитанными ТОЛЬКО когда панель открывается
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
        // Игнорируем ошибки при фоновом обновлении
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
            "relative flex size-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-muted-foreground dark:hover:bg-neutral-800",
            open && "bg-neutral-100 dark:bg-neutral-800",
            className,
          )}
        >
          <Bell className="size-[19px] stroke-[2]" />
          {unread > 0 ? (
            <span className="absolute top-2 right-2.5 size-2.5 rounded-full border-2 border-white bg-[#2f5bff] dark:border-background" />
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        alignOffset={-4}
        className="w-xs h-[min(480px,calc(100dvh-32px))] p-0 rounded-[28px] overflow-hidden border border-border bg-white dark:bg-neutral-900"
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