"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Folder as FolderIcon,
  House as HomeIcon,
  Users as UsersIcon,
  Palette as PaletteIcon,
  Plus,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

function StudioMobileNavInner({
  drawerOpen,
  onCreate,
}: {
  drawerOpen: boolean;
  onCreate: () => void;
}) {
  const t = useTranslations("studio.nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const communityTab = searchParams.get("tab") === "community";

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
      active:
        pathname.startsWith("/studio/browse") && !communityTab,
    },
    {
      href: "/studio/browse?tab=community",
      label: t("community"),
      icon: UsersIcon,
      active: pathname.startsWith("/studio/browse") && communityTab,
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
        "flex shrink-0 items-stretch justify-around border-t border-border/40 bg-muted/20 px-1 pt-0.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden",
        drawerOpen && "invisible pointer-events-none",
      )}
    >
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-normal tracking-tight",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Icon
            className={cn(
              "size-5 stroke-[1.5]",
              active ? "opacity-100" : "opacity-80",
            )}
            weight={active ? "fill" : "regular"}
          />
          <span className="max-w-full truncate px-0.5">{label}</span>
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

export function StudioMobileNav({
  drawerOpen,
  onCreate,
}: {
  drawerOpen: boolean;
  onCreate: () => void;
}) {
  return (
    <Suspense
      fallback={
        <nav
          aria-hidden
          className="flex h-[3.25rem] shrink-0 md:hidden"
        />
      }
    >
      <StudioMobileNavInner drawerOpen={drawerOpen} onCreate={onCreate} />
    </Suspense>
  );
}
