"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { List as Menu, X } from "@phosphor-icons/react";
import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import Logo from "@/components/logo/logo";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { HeroStage } from "@/components/landing/hero-stage";
import { MiroBoard } from "@/components/landing/landing-shell";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { trackEvent } from "@/lib/analytics";
import { SOCIAL_LINKS } from "@/lib/social";
import { useDisplayCurrency } from "@/hooks/use-display-currency";
import {
  CREDIT_PACK_CREDITS,
  FREE_GENERATION_LIMIT,
  PRO_MONTHLY_CREDITS,
} from "@/lib/studio/plans";
import { FeatureBlocks } from "./feature-blocks";
import { ExampleCarousels } from "./example-carousels";
import { EditorShowcase } from "./editor-showcase";
import { PricingSection } from "./pricing-section";
import { FaqSection } from "./faq-section";

const LEGAL_STATIC = {
  fullName: "Шульга Станислав",
  email: "hello@deckva.by",
} as const;

const FAQ_IDS = ["project", "output", "price", "where", "cancel"] as const;

const SOCIAL = [
  { key: "threads", name: "Threads", href: SOCIAL_LINKS.threads, Icon: FaThreads },
  { key: "telegram", name: "Telegram", href: SOCIAL_LINKS.telegram, Icon: FaTelegram },
  { key: "instagram", name: "Instagram", href: SOCIAL_LINKS.instagram, Icon: FaInstagram },
  { key: "tiktok", name: "TikTok", href: SOCIAL_LINKS.tiktok, Icon: FaTiktok },
] as const;

export function LandingPage() {
  const t = useTranslations("landing");
  const { pro, pack } = useDisplayCurrency();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const reduceMotion = useReducedMotion();

  const faqItems = useMemo(
    () =>
      FAQ_IDS.map((id) => ({
        value: id,
        q: t(`faq.${id}.q`),
        a:
          id === "price"
            ? t("faq.price.a", {
                free: FREE_GENERATION_LIMIT,
                price: pro.label,
                credits: PRO_MONTHLY_CREDITS,
                packCredits: CREDIT_PACK_CREDITS,
                packPrice: pack.label,
              })
            : t(`faq.${id}.a`),
      })),
    [t, pro.label, pack.label],
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
      { name: t("nav.seeIt"), link: "#studio" },
      { name: t("nav.price"), link: "#pricing" },
      { name: t("nav.questions"), link: "#faq" },
    ],
    [t],
  );

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
    [t],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "1") return;
    setAuthOpen(true);
    params.delete("auth");
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
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
    <div className="relative bg-[#ebeae6] dark:bg-[#0e0f12]">
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <header className="fixed inset-x-0 top-0 z-[70] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-3">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 rounded-full bg-white/70 px-2 py-1.5 text-land-ink backdrop-blur-xl dark:bg-[#14151c]/70 sm:gap-3 sm:px-3">
          <div className="flex min-w-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-land-ink hover:bg-land-ink/10 hover:text-land-ink lg:hidden"
              aria-label={menuOpen ? t("chrome.closeMenu") : t("chrome.openMenu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu />
            </Button>
            <Logo width={32} height={32} className="text-land-ink" />
            <nav className="ml-5 hidden items-center gap-5 text-sm font-medium text-land-ink/75 lg:flex">
              {NAV.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-land-ink">
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LocaleSwitcher className="h-10 w-10 text-land-ink hover:bg-land-ink/10 hover:text-land-ink" />
            <ThemeSwitcher className="h-10 w-10 text-land-ink hover:bg-land-ink/10 hover:text-land-ink" />
            {!signedIn ? (
              <button
                type="button"
                className="hidden px-2 text-sm font-medium text-land-ink/80 hover:text-land-ink sm:inline"
                onClick={() => setAuthOpen(true)}
              >
                {t("ctaSignIn")}
              </button>
            ) : null}
            <Button
              asChild
              className="h-10 rounded-full bg-land-ink px-4 text-land-mist hover:bg-land-ink/90"
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
          <div className="fixed inset-x-3 z-[65] top-[calc(4.75rem+env(safe-area-inset-top))] overflow-auto rounded-[1.75rem] bg-white p-5 text-[#14151c] dark:bg-[#1c1d26] dark:text-[#eef0f6]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-[0.16em] text-black/40 uppercase dark:text-white/40">
                {t("chrome.menu")}
              </p>
              <button
                type="button"
                aria-label={t("chrome.closeMenu")}
                onClick={() => setMenuOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl bg-[#f0f1f4] dark:bg-white/10"
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
              className="mt-4 flex h-12 items-center justify-center rounded-2xl border border-black/15 text-sm font-semibold dark:border-white/20"
            >
              {t("ctaStudio")}
            </a>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden bg-land-blue text-white">
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-4 pt-[calc(6.5rem+env(safe-area-inset-top))] pb-16 sm:px-6 sm:pt-[calc(7rem+env(safe-area-inset-top))] sm:pb-20 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-16 lg:pb-24">
          <motion.div
            className="flex w-full max-w-xl flex-col items-start text-left lg:w-[28rem] lg:shrink-0"
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: reduceMotion ? 0 : 0.12,
                  delayChildren: reduceMotion ? 0 : 0.05,
                },
              },
            }}
          >
            <motion.h1 className="max-w-[14ch] text-5xl font-semibold tracking-tight leading-[0.96] sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </motion.h1>
            <motion.p className="mt-6 max-w-md text-xl leading-snug text-white/80">
              {t("hero.sub")}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap items-center justify-start gap-x-5 gap-y-3">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-6 text-land-blue hover:bg-white/90"
              >
                <a
                  href="/studio"
                  onClick={() =>
                    trackEvent("landing_cta_click", { place: "hero" })
                  }
                >
                  {t("ctaStudio")}
                </a>
              </Button>
              <a
                href="#features"
                className="text-sm font-medium text-white/75 hover:text-white"
              >
                {t("hero.howLink")}
              </a>
            </motion.div>
            <p className="mt-4 text-sm text-white/65">
              {t("freeLine", { count: FREE_GENERATION_LIMIT })}
            </p>
          </motion.div>
          <motion.div
            className="w-full max-w-[28rem] sm:max-w-[36rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <HeroStage />
          </motion.div>
        </div>
      </section>

      <main>
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
          <MiroBoard>
            <FeatureBlocks />
          </MiroBoard>
        </div>

        <ExampleCarousels />

        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
          <EditorShowcase />

          <MiroBoard id="pricing">
            <PricingSection />
          </MiroBoard>

          <MiroBoard id="faq">
            <FaqSection items={faqItems} />
          </MiroBoard>
        </div>
      </main>

      <footer className="rounded-2xl bg-[#0e0f12] text-white">
        <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:pt-20 lg:px-[120px]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-semibold">{column.title}</p>
                <ul className="mt-4 space-y-3">
                  {column.links.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-white/65 hover:text-white"
                        {...(item.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
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
              <p className="text-sm font-semibold">{t("menu.details")}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/65">
                <li>{legal.status}</li>
                <li>{legal.country}</li>
                <li className="text-white/90">{legal.fullName}</li>
                <li>
                  <a
                    href={`mailto:${legal.email}`}
                    className="hover:text-white"
                  >
                    {legal.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-5 border-t border-white/15 pt-6">
            {SOCIAL.map(({ key, name, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-white/75 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Logo width={22} height={22} className="text-white" />
              <span>Deckva © {new Date().getFullYear()}</span>
            </div>
            <a href={`mailto:${legal.email}`} className="hover:text-white">
              {legal.email}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
