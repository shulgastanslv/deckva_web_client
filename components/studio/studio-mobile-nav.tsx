"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderIcon,
  HomeIcon,
  LayoutTemplateIcon,
  MenuIcon,
  PaletteIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function StudioMobileNav({
  moreOpen,
  onMore,
}: {
  moreOpen: boolean;
  onMore: () => void;
}) {
  const pathname = usePathname();

  const items = [
    {
      href: "/studio",
      label: "Home",
      icon: HomeIcon,
      active: pathname === "/studio",
    },
    {
      href: "/studio/projects",
      label: "Projects",
      icon: FolderIcon,
      active: pathname.startsWith("/studio/projects"),
    },
    {
      href: "/studio/templates",
      label: "Templates",
      icon: LayoutTemplateIcon,
      active: pathname.startsWith("/studio/templates"),
    },
    {
      href: "/studio/brand-kit",
      label: "Brand",
      icon: PaletteIcon,
      active: pathname.startsWith("/studio/brand-kit"),
    },
  ];

  return (
    <nav
      aria-label="Studio"
      className={cn(
        "flex shrink-0 items-stretch justify-around bg-background pb-[env(safe-area-inset-bottom)] md:hidden",
        moreOpen && "invisible",
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
          <Icon className="size-5 stroke-[1.75]" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onMore}
        aria-expanded={moreOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
          moreOpen ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <MenuIcon className="size-5 stroke-[1.75]" />
        More
      </button>
    </nav>
  );
}
