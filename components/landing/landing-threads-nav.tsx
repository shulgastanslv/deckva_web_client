"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Heart, Home, Search, User, X } from "lucide-react";

import {
  ThreadsChrome,
  ThreadsComposeGlyph,
  ThreadsMenuMark,
  threadsSlotClass,
} from "@/components/nav/threads-chrome";
import Logo from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { name: "Студия", href: "#studio" },
  { name: "Возможности", href: "#product" },
  { name: "Примеры", href: "#reviews" },
  { name: "Тариф", href: "#pricing" },
  { name: "Вопросы", href: "#faq" },
] as const;

type SectionId = "home" | "reviews";

function docTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return Number.POSITIVE_INFINITY;
  return el.getBoundingClientRect().top + window.scrollY;
}

export function LandingThreadsNav({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const accountLetter = (
    session?.user?.name ||
    session?.user?.email ||
    "U"
  )
    .slice(0, 1)
    .toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [active, setActive] = useState<SectionId>("home");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140;
      const reviews = docTop("reviews");
      const pricing = docTop("pricing");
      if (y >= reviews && y < pricing) setActive("reviews");
      else setActive("home");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, accountOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuQuery("");
  };

  const sections = SECTIONS.filter((item) =>
    item.name.toLowerCase().includes(menuQuery.trim().toLowerCase()),
  );

  return (
    <>
      <ThreadsChrome
        className="bg-land-card"
        logo={
          <Logo
            width={28}
            height={28}
            href="/"
            className="cursor-pointer text-foreground"
          />
        }
        headerAction={
          <button
            type="button"
            className={threadsSlotClass(menuOpen)}
            aria-label="Меню"
            aria-expanded={menuOpen}
            onClick={() => {
              setAccountOpen(false);
              setMenuOpen((open) => !open);
            }}
          >
            <ThreadsMenuMark />
          </button>
        }
        footer={
          <button
            type="button"
            className={threadsSlotClass(menuOpen)}
            aria-label="Меню"
            aria-expanded={menuOpen}
            onClick={() => {
              setAccountOpen(false);
              setMenuOpen((open) => !open);
            }}
          >
            <ThreadsMenuMark />
          </button>
        }
      >
        <button
          type="button"
          className={threadsSlotClass(active === "home")}
          aria-label="Главная"
          aria-current={active === "home" ? "page" : undefined}
          onClick={() => {
            closeMenu();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Home
            className="size-[26px]"
            strokeWidth={active === "home" ? 2.2 : 1.6}
            fill={active === "home" ? "currentColor" : "none"}
          />
        </button>

        <button
          type="button"
          className={threadsSlotClass(menuOpen)}
          aria-label="Разделы"
          aria-pressed={menuOpen}
          onClick={() => {
            setAccountOpen(false);
            setMenuOpen((open) => !open);
          }}
        >
          <Search className="size-[26px]" strokeWidth={1.6} />
        </button>

        <Link
          href="/studio"
          className={threadsSlotClass(false)}
          aria-label="Открыть студию"
        >
          <ThreadsComposeGlyph />
        </Link>

        <a
          href="#reviews"
          className={threadsSlotClass(active === "reviews")}
          aria-label="Примеры"
          aria-current={active === "reviews" ? "true" : undefined}
          onClick={closeMenu}
        >
          <Heart
            className="size-[26px]"
            strokeWidth={1.6}
            fill={active === "reviews" ? "currentColor" : "none"}
          />
        </a>

        <div className="relative" data-account-menu>
          <button
            type="button"
            className={threadsSlotClass(accountOpen)}
            aria-label={signedIn ? "Аккаунт" : "Войти"}
            aria-expanded={signedIn ? accountOpen : undefined}
            onClick={() => {
              closeMenu();
              if (!signedIn) {
                onSignIn();
                return;
              }
              setAccountOpen((open) => !open);
            }}
          >
            {signedIn ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {accountLetter}
              </span>
            ) : (
              <User className="size-[26px]" strokeWidth={1.6} />
            )}
          </button>
          {accountOpen && signedIn ? (
            <>
            <button
              type="button"
              aria-label="Закрыть"
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setAccountOpen(false)}
            />
            <div className="absolute bottom-[calc(100%+8px)] right-0 z-50 w-44 overflow-hidden rounded-2xl bg-popover p-1.5 text-popover-foreground ring-1 ring-border md:bottom-auto md:left-[calc(100%+8px)] md:right-auto md:top-0">
              <Link
                href="/studio"
                className="flex h-10 items-center rounded-xl px-3 text-[14px] font-medium hover:bg-muted"
                onClick={() => setAccountOpen(false)}
              >
                Проекты
              </Link>
              <button
                type="button"
                className="flex h-10 w-full items-center rounded-xl px-3 text-left text-[14px] font-medium hover:bg-muted"
                onClick={() => {
                  setAccountOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
              >
                Выйти
              </button>
            </div>
            </>
          ) : null}
        </div>
      </ThreadsChrome>

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="fixed inset-0 z-30 hidden bg-transparent md:block"
            style={{ left: 372 }}
            onClick={closeMenu}
          />
          <div className="fixed inset-x-0 top-12 bottom-[calc(56px+env(safe-area-inset-bottom,0px))] z-30 overflow-y-auto bg-land-card md:inset-y-0 md:right-auto md:left-[72px] md:w-[300px]">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[16px] font-semibold text-foreground">Меню</p>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={closeMenu}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={menuQuery}
                  onChange={(event) => setMenuQuery(event.target.value)}
                  placeholder="Разделы"
                  className="h-11 rounded-full border-0 bg-muted pl-10 text-[15px] shadow-none focus-visible:ring-1"
                />
              </div>
            </div>
            <nav className="flex flex-col px-2">
              {sections.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex h-12 items-center rounded-xl px-3 text-[15px] font-medium text-foreground hover:bg-muted"
                >
                  {item.name}
                </a>
              ))}
              {sections.length === 0 ? (
                <p className="px-3 py-3 text-[14px] text-muted-foreground">
                  Ничего не нашлось
                </p>
              ) : null}
            </nav>
            <div className="mt-2 flex items-center justify-between px-5 py-2">
              <span className="text-[14px] font-medium text-foreground">
                Тема
              </span>
              <ThemeSwitcher />
            </div>
            <div className="px-3 pb-6">
              {signedIn ? (
                <Link
                  href="/studio"
                  onClick={closeMenu}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-foreground px-4 text-[14px] font-semibold text-background"
                >
                  Открыть студию
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onSignIn();
                  }}
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-full bg-foreground px-4 text-[14px] font-semibold text-background",
                  )}
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
