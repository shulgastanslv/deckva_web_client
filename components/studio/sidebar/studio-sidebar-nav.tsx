"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Folder as FolderIcon,
  House as HomeIcon,
  Palette as PaletteIcon,
  CaretRight as ChevronRight,
  Trash as TrashIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { navIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type SubItem = {
  href: string;
  label: string;
  tabId: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  active: boolean;
  subItems?: SubItem[];
};

export function StudioSidebarNav() {
  const t = useTranslations("studio.nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  const items: NavItem[] = [
    {
      href: "/studio",
      label: t("home"),
      icon: HomeIcon,
      active: pathname === "/studio",
    },
    {
      href: "/studio/browse",
      label: t("browse"),
      icon: FolderIcon,
      active: pathname.startsWith("/studio/browse"),
      subItems: [
        { href: "/studio/browse?tab=all", label: t("projects"), tabId: "all" },
        {
          href: "/studio/browse?tab=starred",
          label: t("starred"),
          tabId: "starred",
        },
       
        {
          href: "/studio/browse?tab=community",
          label: t("community"),
          tabId: "community",
        },
      ],
    },
    {
      href: "/studio/brand-kit",
      label: t("brandKit"),
      icon: PaletteIcon,
      active: pathname.startsWith("/studio/brand-kit"),
    },
    {
      href: "/studio/browse?tab=trash",
      label: t("trash"),
      icon: TrashIcon,
      active: pathname.startsWith("/studio/browse?tab=trash"),
    },
  ];

  return (
    <nav className="flex flex-col gap-0.5 px-2.5">
      {items.map((item) => {
        const LinkContent = (
          <Link
            href={item.href}
            className={cn(
              "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
              item.active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:hover:bg-muted/50",
            )}
          >
            <item.icon className={navIconClass} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.subItems ? <ChevronRight className="size-3.5 opacity-50" /> : null}
          </Link>
        );

        if (item.subItems) {
          return (
            <HoverCard key={item.href} openDelay={100} closeDelay={150}>
              <HoverCardTrigger asChild>
                <div>{LinkContent}</div>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={12}
                className="flex w-36 flex-col gap-0.5 rounded-2xl bg-popover p-1.5 shadow-none"
              >
                {item.subItems.map((sub) => {
                  const isActiveSub = item.active && currentTab === sub.tabId;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "flex h-8 items-center rounded-md px-2.5 text-[13px] transition-colors",
                        isActiveSub
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </HoverCardContent>
            </HoverCard>
          );
        }

        return <div key={item.href}>{LinkContent}</div>;
      })}
    </nav>
  );
}
