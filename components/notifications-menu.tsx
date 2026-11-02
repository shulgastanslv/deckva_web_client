"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { markNotificationsRead } from "@/actions/admin";
import { messages } from "@/lib/messages";
import {
  fetchMyNotifications,
  markNotificationCacheRead,
  useMyNotifications,
} from "@/lib/studio/queries";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsMenu() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const notifications = useMyNotifications(true);
  const items = notifications.data?.items ?? [];
  const unread = notifications.data?.unread ?? 0;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchMyNotifications(queryClient);
        if (cancelled || res.unread === 0) return;
        const marked = await markNotificationsRead();
        if (cancelled || !marked.success) return;
        markNotificationCacheRead(queryClient);
      } catch {
        // Keep the last list. The server already logged the failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, queryClient]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground"
          title="Notifications"
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-foreground" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2 text-[13px]">
        <DropdownMenuLabel className="text-[13px] font-semibold">
          {messages.notifications.title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-5 text-center text-[13px] text-muted-foreground">
            {messages.notifications.emptyMenu}
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl px-2 py-1.5">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
