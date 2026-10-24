"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FolderIcon,
  HomeIcon,
  LayoutTemplateIcon,
  StarIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  active: boolean;
};

export function StudioSidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const starred = searchParams.get("filter") === "starred";

  const items: NavItem[] = [
    {
      href: "/studio",
      label: "Home",
      icon: HomeIcon,
      active: pathname === "/studio",
    },
    {
      href: "/studio/projects?filter=starred",
      label: "Starred",
      icon: StarIcon,
      active: pathname.startsWith("/studio/projects") && starred,
    },
    {
      href: "/studio/projects",
      label: "Projects",
      icon: FolderIcon,
      active: pathname.startsWith("/studio/projects") && !starred,
    },
    {
      href: "/studio/templates",
      label: "Templates",
      icon: LayoutTemplateIcon,
      active: pathname.startsWith("/studio/templates"),
    },
  ];

  return (
    <nav className="flex flex-col gap-0.5 px-2.5">
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium transition-colors",
            active
              ? "bg-white text-neutral-950 shadow-sm dark:bg-muted dark:text-foreground"
              : "text-neutral-600 hover:bg-white/70 hover:text-neutral-950 dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-foreground",
          )}
        >
          <Icon
            className={cn(
              "size-4 shrink-0 stroke-[1.75]",
              active && label === "Starred" && "fill-current",
            )}
          />
          {label}
        </Link>
      ))}
    </nav>
  );
}
