"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ArrowDown, List as Menu, X } from "@phosphor-icons/react";
import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import Logo from "@/components/logo/logo";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/hero-stage";
import {
  MiroBoard,
  landSectionPad,
} from "@/components/landing/landing-shell";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { trackEvent } from "@/lib/analytics";
import { SOCIAL_LINKS } from "@/lib/social";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";
import { FeatureBlocks } from "./feature-blocks";
import { ExampleCarousels } from "./example-carousels";
import { EditorShowcase } from "./editor-showcase";
import { ModelsSection } from "./models-section";
import { PricingSection } from "./pricing-section";
import { FaqSection } from "./faq-section";

const LEGAL_STATIC = {
  fullName: "Шульга Станислав",
  email: "shulgastanislav@gmail.com",
} as const;

const FAQ_IDS = [
  "project",
  "output",
  "edit",
  "credits",
  "formats",
  "watermark",
  "price",
  "where",
  "mobile",
  "commercial",
] as const;

const SOCIAL = [
  { key: "threads", name: "Threads", href: SOCIAL_LINKS.threads, Icon: FaThreads },
  { key: "telegram", name: "Telegram", href: SOCIAL_LINKS.telegram, Icon: FaTelegram },
  { key: "instagram", name: "Instagram", href: SOCIAL_LINKS.instagram, Icon: FaInstagram },
  { key: "tiktok", name: "TikTok", href: SOCIAL_LINKS.tiktok, Icon: FaTiktok },
] as const;

export function LandingPage() {
  const t = useTranslations("landing");
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const signedIn = status === "authenticated";

  const faqItems = useMemo(
    () =>
      FAQ_IDS.map((id) => ({
        value: id,
        q: t(`faq.${id}.q`),
        a:
          id === "price" || id === "credits"
            ? t(`faq.${id}.a`, { count: DAILY_GENERATION_LIMIT })
            : t(`faq.${id}.a`),
      })),
    [t],
  );

  const legal = useMemo(
    () => ({
      status: t("legalStatus"),
      country: t("legalCountry"),
      fullName: LEGAL_STATIC.fullName,
      email: LEGAL_STATIC.email,
    }),
    [t],
  );

  const NAV = useMemo(
    () => [
      { name: t("nav.how"), link: "#features" },
      { name: t("nav.examples"), link: "#examples" },
      { name: t("nav.models"), link: "#models" },
      { name: t("nav.seeIt"), link: "#studio" },
      { name: t("nav.price"), link: "#pricing" },
      { name: t("nav.questions"), link: "#faq" },
    ],
    [t],
  );

  const tc = useTranslations("common");

  const footerColumns = useMemo(
    () => [
      {
        title: t("menu.product"),
        links: [
          { name: t("ctaStudio"), href: "/studio" },
          { name: t("nav.how"), href: "#features" },
          { name: t("nav.examples"), href: "#examples" },
          { name: t("nav.price"), href: "#pricing" },
          { name: t("nav.questions"), href: "#faq" },
          { name: tc("terms"), href: "/terms" },
          { name: tc("privacy"), href: "/privacy" },
        ],
      },
      {
        title: t("menu.make"),
        links: [
          { name: t("menu.startingLines"), href: "#features" },
          { name: t("nav.examples"), href: "#examples" },
          { name: t("nav.price"), href: "#pricing" },
        ],
      },
      {
        title: t("menu.findUs"),
        links: [
          { name: "Threads", href: SOCIAL_LINKS.threads },
          { name: "Telegram", href: SOCIAL_LINKS.telegram },
          { name: "Instagram", href: SOCIAL_LINKS.instagram },
          { name: "TikTok", href: SOCIAL_LINKS.tiktok },
        ],
      },
    ],
    [t, tc],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openAuth =
      params.get("auth") === "1" ||
      params.has("verify") ||
      params.has("reset") ||
      params.has("error");
    if (!openAuth) return;
    setAuthOpen(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="relative bg-[#ebeae6] dark:bg-background">
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <header className="fixed inset-x-0 top-0 z-[70] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-5 sm:pt-2">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-2 rounded-full bg-white/70 px-2 text-foreground backdrop-blur-xl dark:bg-muted/50 sm:gap-3 sm:px-3">
          <div className="flex min-w-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-foreground hover:bg-muted/60 hover:text-foreground lg:hidden"
              aria-label={menuOpen ? t("chrome.closeMenu") : t("chrome.openMenu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu />
            </Button>
            <Logo width={36} height={36} className="text-foreground" />
            <nav className="ml-5 hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex">
              {NAV.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-foreground">
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LocaleSwitcher className="h-10 w-10 text-foreground hover:bg-muted/60 hover:text-foreground" />
            <ThemeSwitcher className="h-10 w-10 text-foreground hover:bg-muted/60 hover:text-foreground" />
            {!signedIn ? (
              <button
                type="button"
                className="hidden px-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
                onClick={() => setAuthOpen(true)}
              >
                {t("ctaSignIn")}
              </button>
            ) : null}
            <Button
              asChild
              className="h-10 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
            >
              <a
                href="/studio"
                onClick={() =>
                  trackEvent("landing_cta_click", { place: "nav_primary" })
                }
              >
                {t("ctaStudio")}
              </a>
            </Button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label={t("chrome.closeMenu")}
            className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-3 z-[65] top-[calc(4.75rem+env(safe-area-inset-top))] overflow-auto rounded-4xl bg-background p-5 text-foreground dark:bg-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("chrome.menu")}
              </p>
              <button
                type="button"
                aria-label={t("chrome.closeMenu")}
                onClick={() => setMenuOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl bg-muted/40"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-1">
              {NAV.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  className="block py-3 text-base font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
            {!signedIn ? (
              <button
                type="button"
                className="mt-4 block w-full text-center text-base font-medium"
                onClick={() => {
                  setMenuOpen(false);
                  setAuthOpen(true);
                }}
              >
                {t("ctaSignIn")}
              </button>
            ) : null}
            <a
              href="/studio"
              className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-muted/40 text-sm font-semibold"
            >
              {t("ctaStudio")}
            </a>
          </div>
        </div>
      ) : null}

      <HeroSection />

      <main className="mt-20">
        <FeatureBlocks />

        <ExampleCarousels />

        <ModelsSection />

        <EditorShowcase />

        <div
          className={cn(
            "mx-auto flex w-full max-w-[1200px] flex-col gap-2 sm:gap-3",
            landSectionPad,
          )}
        >
          <MiroBoard id="pricing">
            <PricingSection />
          </MiroBoard>

          <MiroBoard id="faq">
            <FaqSection items={faqItems} />
          </MiroBoard>
        </div>
      </main>

      <section className="relative" style={{ height: "140vh" }}>
        <div
          className={cn(
            "sticky top-0 z-10 flex h-svh flex-col",
            landSectionPad,
          )}
        >
          <footer
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl",
              "bg-black text-white dark:bg-muted/50 dark:backdrop-blur-xl",
            )}
          >
            <div className="mx-auto flex h-full w-full max-w-[1440px] flex-1 flex-col justify-between px-6 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:pt-20 lg:px-[120px] lg:pb-10">
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <p className="text-sm font-semibold text-white">
                      {column.title}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {column.links.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="text-sm text-white/70 hover:text-white"
                            {...(item.href.startsWith("http")
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {t("menu.details")}
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    <li className="text-white">{legal.fullName}</li>
                    <li>
                      <a
                        href={`mailto:${legal.email}`}
                        className="text-white/70 hover:text-white"
                      >
                        {legal.email}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-1 flex-col items-start justify-center py-10 sm:py-14 text-primary-foreground/20">
                <p
                  className={cn(
                    "font-[family-name:var(--font-landing-serif)]",
                    "flex items-center gap-5 text-[clamp(3.5rem,12vw,9rem)] leading-[0.92] font-medium tracking-tight text-primary-foreground/20 sm:gap-6",
                  )}
                >
                  {t("menu.followUs")}
                  <ArrowDown
                    className="size-[0.6em] shrink-0"
                    weight="bold"
                    aria-hidden
                  />
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-5">
                  {SOCIAL.map(({ key, name, href, Icon }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="text-white/80 hover:text-white"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Logo width={36} height={36} className="text-white" />
                    <span className="text-white/80">
                      Deckva © {new Date().getFullYear()}
                    </span>
                  </div>
                  <a
                    href={`mailto:${legal.email}`}
                    className="text-white/70 hover:text-white"
                  >
                    {legal.email}
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
