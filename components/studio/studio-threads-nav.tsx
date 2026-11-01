"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FolderIcon,
  Home,
  LayoutTemplateIcon,
  PaletteIcon,
  Search,
  StarIcon,
  X,
} from "lucide-react";

import { getActiveOrganization } from "@/actions/organizations";
import Logo from "@/components/logo";
import {
  ThreadsChrome,
  ThreadsComposeGlyph,
  ThreadsMenuMark,
  useThreadsMobile,
  threadsSlotClass,
} from "@/components/nav/threads-chrome";
import { StudioUpgradeDialog } from "@/components/studio/dialogs/studio-upgrade-dialog";
import { StudioNotifications } from "@/components/studio/header/studio-notifications";
import { StudioOrgSwitcher } from "@/components/studio/org/studio-org-switcher";
import { StudioFoldersSection } from "@/components/studio/sidebar/studio-folders-section";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MORE_LINKS: {
  href: string;
  label: string;
  icon: typeof FolderIcon;
  active: (pathname: string, starred: boolean) => boolean;
}[] = [
  {
    href: "/studio/projects",
    label: "Browse",
    icon: FolderIcon,
    active: (pathname, starred) =>
      pathname.startsWith("/studio/projects") && !starred,
  },
  {
    href: "/studio/projects?filter=starred",
    label: "Starred",
    icon: StarIcon,
    active: (pathname, starred) =>
      pathname.startsWith("/studio/projects") && starred,
  },
  {
    href: "/studio/templates",
    label: "Templates",
    icon: LayoutTemplateIcon,
    active: (pathname) => pathname.startsWith("/studio/templates"),
  },
  {
    href: "/studio/brand-kit",
    label: "Brand kit",
    icon: PaletteIcon,
    active: (pathname) => pathname.startsWith("/studio/brand-kit"),
  },
];

function useIsPro() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!signedIn) {
      setIsPro(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const res = await getActiveOrganization();
      if (!cancelled && res.success) {
        setIsPro(Boolean(res.organization?.isUpgrade));
      }
    };
    void load();
    window.addEventListener("studio:org-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("studio:org-changed", load);
    };
  }, [signedIn]);

  return isPro;
}

function ThreadsPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-30 hidden bg-transparent md:block"
        style={{ left: 372 }}
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-12 bottom-[calc(56px+env(safe-area-inset-bottom,0px))] z-30 flex flex-col overflow-hidden bg-muted md:inset-y-0 md:right-auto md:bottom-0 md:left-[72px] md:w-[300px]">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-[16px] font-semibold text-foreground">{title}</p>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export function StudioThreadsNav({
  search,
  onSearchChange,
  onBlank,
  onTemplates,
  onSignIn,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onBlank: () => void;
  onTemplates: () => void;
  onSignIn: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobile = useThreadsMobile();
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const isPro = useIsPro();
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const starred = searchParams.get("filter") === "starred";

  useEffect(() => {
    setSearchOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onOpenUpgrade = () => setUpgradeOpen(true);
    window.addEventListener("studio:open-upgrade", onOpenUpgrade);
    return () =>
      window.removeEventListener("studio:open-upgrade", onOpenUpgrade);
  }, []);

  useEffect(() => {
    if (!searchOpen && !moreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, moreOpen]);

  const homeActive = pathname === "/studio";
  const menuSide = mobile ? "top" : "right";

  const openUpgrade = () => {
    if (!signedIn) {
      onSignIn();
      return;
    }
    setUpgradeOpen(true);
  };

  const toggleSearch = () => {
    setMoreOpen(false);
    setSearchOpen((open) => !open);
  };

  const toggleMore = () => {
    setSearchOpen(false);
    setMoreOpen((open) => !open);
  };

  const logo = (
    <Logo
      width={28}
      height={28}
      href="/studio"
      className="cursor-pointer text-foreground"
    />
  );

  const menuButton = (label: string) => (
    <button
      type="button"
      className={threadsSlotClass(moreOpen)}
      aria-label={label}
      aria-expanded={moreOpen}
      onClick={toggleMore}
    >
      <ThreadsMenuMark />
    </button>
  );

  return (
    <>
      <ThreadsChrome
        logo={logo}
        headerAction={menuButton("Menu")}
        footer={menuButton("Menu")}
      >
        <Link
          href="/studio"
          className={threadsSlotClass(homeActive)}
          aria-label="Home"
          aria-current={homeActive ? "page" : undefined}
        >
          <Home
            className="size-[26px]"
            strokeWidth={homeActive ? 2.2 : 1.6}
            fill={homeActive ? "currentColor" : "none"}
          />
        </Link>

        <button
          type="button"
          className={cn(threadsSlotClass(searchOpen), "relative")}
          aria-label="Search"
          aria-pressed={searchOpen}
          onClick={toggleSearch}
        >
          <Search className="size-[26px]" strokeWidth={1.6} />
          {search.trim() ? (
            <span className="absolute top-2.5 right-2.5 size-[7px] rounded-full bg-primary" />
          ) : null}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={threadsSlotClass(false)}
              aria-label="Create"
            >
              <ThreadsComposeGlyph />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={menuSide}
            align={menuSide === "right" ? "start" : "center"}
            sideOffset={8}
            className="min-w-[180px] rounded-2xl border-0 bg-muted p-1.5 shadow-none"
          >
            <DropdownMenuItem
              className="cursor-pointer rounded-xl text-[13px]"
              onClick={() => void onBlank()}
            >
              Blank carousel
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-xl text-[13px]"
              onClick={onTemplates}
            >
              From template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <StudioNotifications variant="threads" />

        <StudioUserNav appearance="threads" menuSide={menuSide} />
      </ThreadsChrome>

      {searchOpen ? (
        <ThreadsPanel title="Search" onClose={() => setSearchOpen(false)}>
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search"
                className="h-11 rounded-full border-0 bg-muted pl-10 text-[15px] shadow-none focus-visible:ring-1"
              />
            </div>
            <p className="mt-3 px-1 text-[13px] leading-relaxed text-muted-foreground">
              {search.trim()
                ? "Matches update on this page."
                : "Search projects and templates."}
            </p>
          </div>
          <div className="flex flex-col px-2 pb-4">
            <Link
              href="/studio/projects"
              className="flex h-11 items-center rounded-xl px-3 text-[14px] font-medium hover:bg-muted"
            >
              Browse projects
            </Link>
            <Link
              href="/studio/templates"
              className="flex h-11 items-center rounded-xl px-3 text-[14px] font-medium hover:bg-muted"
            >
              Templates
            </Link>
          </div>
        </ThreadsPanel>
      ) : null}

      {moreOpen ? (
        <ThreadsPanel title="Menu" onClose={() => setMoreOpen(false)}>
          <div
            className="px-1 pb-6"
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest("a")) setMoreOpen(false);
            }}
          >
            <StudioOrgSwitcher />
            <nav className="mt-2 flex flex-col px-2">
              {MORE_LINKS.map((item) => {
                const Icon = item.icon;
                const active = item.active(pathname, starred);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-11 items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium",
                      active
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 stroke-[1.75]",
                        active && item.label === "Starred" && "fill-current",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Suspense fallback={null}>
              <StudioFoldersSection />
            </Suspense>
            <div className="mt-4 flex flex-col gap-2 px-3">
              {isPro ? (
                <span className="inline-flex h-9 w-fit items-center rounded-full bg-primary/12 px-3 text-[13px] font-semibold text-primary">
                  Pro
                </span>
              ) : (
                <Button
                  type="button"
                  className="h-9 w-fit rounded-full bg-[#4262ff] px-4 text-[13px] font-semibold text-white hover:bg-[#3554e8]"
                  onClick={openUpgrade}
                >
                  Upgrade
                </Button>
              )}
              {session?.user?.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="flex h-10 items-center rounded-xl px-1 text-[14px] font-medium text-foreground"
                >
                  Admin panel
                </Link>
              ) : null}
              {!signedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onSignIn();
                  }}
                  className="flex h-10 items-center rounded-xl px-1 text-left text-[14px] font-medium text-foreground"
                >
                  Sign in
                </button>
              ) : null}
              <div className="flex items-center justify-between py-1">
                <span className="text-[14px] font-medium text-foreground">
                  Theme
                </span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </ThreadsPanel>
      ) : null}

      <StudioUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
