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

import { mobileGlassDock } from "@/components/studio/ui/mobile-glass";
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
      active: pathname.startsWith("/studio/browse") && !communityTab,
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
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-40 md:hidden",
        drawerOpen && "invisible",
      )}
    >
      <nav
        aria-label={t("studio")}
        className={cn(
          "pointer-events-auto flex items-center justify-around gap-0.5 px-1.5 py-1.5",
          mobileGlassDock,
        )}
      >
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-muted/50 text-foreground"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
            )}
          >
            <Icon
              className="size-5 stroke-[1.5]"
              weight={active ? "fill" : "regular"}
            />
          </Link>
        ))}
        <button
          type="button"
          onClick={onCreate}
          aria-label={t("newProject")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90"
        >
          <Plus className="size-5 stroke-[2]" />
        </button>
      </nav>
    </div>
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[4.75rem] md:hidden"
        />
      }
    >
      <StudioMobileNavInner drawerOpen={drawerOpen} onCreate={onCreate} />
    </Suspense>
  );
}
