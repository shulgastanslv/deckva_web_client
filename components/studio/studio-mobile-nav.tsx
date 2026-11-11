"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder as FolderIcon,
  House as HomeIcon,
  Users as UsersIcon,
  Palette as PaletteIcon,
  Plus,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function StudioMobileNav({
  drawerOpen,
  onCreate,
}: {
  drawerOpen: boolean;
  onCreate: () => void;
}) {
  const t = useTranslations("studio.nav");
  const pathname = usePathname();

  const items = [
    {
      href: "/studio",
      label: t("home"),
      icon: HomeIcon,
      active: pathname === "/studio",
    },
    {
      href: "/studio/browse",
      label: t("projects"),
      icon: FolderIcon,
      active: pathname.startsWith("/studio/browse"),
    },
    {
      href: "/studio/browse?tab=community",
      label: t("community"),
      icon: UsersIcon,
      active: pathname.includes("tab=community"),
    },
    {
      href: "/studio/brand-kit",
      label: t("brand"),
      icon: PaletteIcon,
      active: pathname.startsWith("/studio/brand-kit"),
    },
  ];

  return (
    <nav
      aria-label={t("studio")}
      className={cn(
        "flex shrink-0 items-stretch justify-around bg-muted/20 px-1 pb-[env(safe-area-inset-bottom)] md:hidden",
        drawerOpen && "invisible",
      )}
    >
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Icon className="size-5 stroke-[1.5]" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onCreate}
        aria-label={t("newProject")}
        className="flex min-w-0 flex-1 items-center justify-center text-foreground"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
          <Plus className="size-5 stroke-[2]" />
        </span>
      </button>
    </nav>
  );
}
