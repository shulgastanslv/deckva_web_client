"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { listMyNotifications, markNotificationsRead, type NotificationItem } from "@/actions/admin";
import { NotificationsArt } from "@/components/canvas/canvas_icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsMenu() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    void listMyNotifications().then((res) => {
      if (!res.success) return;
      setItems(res.items);
      setUnread(res.unread);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) return;
        load();
        if (unread > 0) {
          void markNotificationsRead().then(() => setUnread(0));
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-foreground" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2 text-[13px]">
        <DropdownMenuLabel className="text-[13px] font-semibold">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-2 py-5 text-center">
            <NotificationsArt className="h-auto w-full max-w-[120px]" />
            <p className="text-[13px] text-muted-foreground">No new notifications</p>
          </div>
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
