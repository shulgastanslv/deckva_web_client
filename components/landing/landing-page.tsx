"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import { WhiteLogo } from "@/components/logo";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HeroStage } from "@/components/landing/hero-stage";
import { Reveal } from "@/components/landing/reveal";
import { ReviewsBlock } from "@/components/landing/reviews-block";
import { LeaveReviewBlock } from "@/components/landing/leave-review-block";
import { StudioVideo } from "@/components/landing/studio-video";
import { BelarusRubleIcon } from "@/components/landing/belarus-ruble-icon";
import {
  LandingLayer,
  LandingPad,
  LandingSection,
  landTitle,
  landSub,
} from "@/components/landing/landing-shell";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SOCIAL_LINKS } from "@/lib/social";

const LEGAL = {
  status: "Плательщик налога на профессиональный доход",
  fullName: "Шульга Станислав",
  unp: "XXXXXXXXX",
  email: "hello@deckva.by",
  country: "Республика Беларусь",
} as const;

const NAV = [
  { name: "Студия", link: "#studio" },
  { name: "Зачем", link: "#why" },
  { name: "Примеры", link: "#reviews" },
  { name: "Цена", link: "#pricing" },
  { name: "Вопросы", link: "#faq" },
];

const REASONS = [
  {
    n: "01",
    title: "Это один пост",
    text: "Слайды уже стоят по порядку и в пропорции ленты. Их не надо нарезать из одного макета после экспорта.",
  },
  {
    n: "02",
    title: "Старт с темы",
    text: "Структура появляется из темы или шаблона. Вы правите слова, обложку и порядок, а не собираете каркас.",
  },
  {
    n: "03",
    title: "Файл можно выложить",
    text: "PNG одного слайда или ZIP всей карусели. Без логотипа Deckva и без переноса в другой редактор.",
  },
] as const;

const FAQ = [
  {
    value: "why",
    q: "Зачем это, если слайды можно собрать в другом редакторе?",
    a: "Там карусель — несколько отдельных макетов. Здесь пост сразу из слайдов: формат, порядок и файл для публикации в одном проекте.",
  },
  {
    value: "output",
    q: "Что я забираю на выходе?",
    a: "PNG одного слайда или ZIP всей карусели. На слайдах нет водяного знака — файл можно публиковать.",
  },
  {
    value: "start",
    q: "С чего начинается пост?",
    a: "С темы, с шаблона или с пустого холста. Тема даёт структуру слайдов, дальше правите текст, обложку и порядок.",
  },
  {
    value: "price",
    q: "Сколько это стоит?",
    a: "15 Br в месяц. Подписку можно отменить в любой момент, доступ сохраняется до конца оплаченного периода.",
  },
  {
    value: "where",
    q: "Где этим пользоваться?",
    a: "В браузере на компьютере. Чтобы верстать слайды, нужен широкий экран.",
  },
];

const SOCIAL = [
  {
    key: "threads",
    name: "Threads",
    href: SOCIAL_LINKS.threads,
    Icon: FaThreads,
  },
  {
    key: "telegram",
    name: "Telegram",
    href: SOCIAL_LINKS.telegram,
    Icon: FaTelegram,
  },
  {
    key: "instagram",
    name: "Instagram",
    href: SOCIAL_LINKS.instagram,
    Icon: FaInstagram,
  },
  {
    key: "tiktok",
    name: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    Icon: FaTiktok,
  },
] as const;

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="relative bg-land-mist">
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <header className="fixed inset-x-0 top-0 z-50 bg-land-blue pt-[env(safe-area-inset-top)] text-white">
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-5">
          <WhiteLogo width={36} height={36} />

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/85 md:flex">
            {NAV.map((item) => (
              <a key={item.link} href={item.link} className="hover:text-white">
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher className="h-10 w-10 text-white hover:bg-white/10 hover:text-white" />
            <Button
              asChild
              className="h-10 rounded-full bg-white px-4 text-land-blue hover:bg-white/90"
            >
              <a href="/studio">
                <span className="sm:hidden">Студия</span>
                <span className="hidden sm:inline">Открыть</span>
              </a>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full text-white hover:bg-white/10 hover:text-white md:hidden"
                  aria-label="Меню"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100%,20rem)]">
                <div className="flex flex-col gap-1 px-3 pt-14 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  {NAV.map((item) => (
                    <SheetClose asChild key={item.link}>
                      <a
                        href={item.link}
                        className="rounded-2xl px-3 py-3.5 text-base font-medium"
                      >
                        {item.name}
                      </a>
                    </SheetClose>
                  ))}
                  {signedIn ? (
                    <Button
                      asChild
                      variant="outline"
                      className="mt-3 h-11 rounded-full"
                    >
                      <a href="/studio">Проекты</a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-3 h-11 rounded-full"
                      onClick={() => setAuthOpen(true)}
                    >
                      Войти
                    </Button>
                  )}
                  <Button asChild className="h-11 rounded-full">
                    <a href="/studio">Открыть студию</a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-land-blue text-white">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-16 sm:px-6 sm:pt-[calc(6rem+env(safe-area-inset-top))] sm:pb-20 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:pb-24">
          <div className="w-full max-w-[420px]">
            <div className="ml-[14%] w-[84%] sm:ml-[8%] sm:w-[90%]">
              <h1 className="text-[2.15rem] font-extrabold tracking-tight leading-[1.02] sm:text-5xl sm:leading-[0.98]">
                Карусель без сборки по частям
              </h1>
              <p className="mt-4 text-base font-medium leading-snug text-white/85 sm:text-lg">
                Тема сразу становится лентой слайдов. Текст и порядок правите
                в том же проекте и скачиваете файл для поста.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <Button
                  asChild
                  className="h-12 w-full rounded-full bg-white px-5 text-land-blue hover:bg-white/90"
                >
                  <a href="/studio">Открыть студию</a>
                </Button>
                <a
                  href="#studio"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/15"
                >
                  Посмотреть, как это выглядит
                </a>
              </div>
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      <LandingSection
        id="studio"
        className="relative z-20 -mt-8 py-0 sm:-mt-12 sm:py-0"
      >
        <div className="overflow-hidden rounded-[2rem] bg-land-card sm:rounded-[2.5rem]">
          <StudioVideo />
        </div>
      </LandingSection>

      <LandingSection id="why">
        <Reveal>
          <h2 className={`${landTitle} max-w-xl text-land-ink`}>
            Зачем открывать студию
          </h2>
          <p className={`mt-4 max-w-lg text-land-ink/55 ${landSub}`}>
            Чтобы карусель была одним постом, а не папкой отдельных макетов.
          </p>
          <ol className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {REASONS.map((reason) => (
              <li key={reason.n}>
                <LandingLayer className="h-full bg-land-card">
                  <LandingPad className="sm:p-7">
                    <p className="text-sm font-semibold tracking-wide text-land-ink/40">
                      {reason.n}
                    </p>
                    <h3 className="mt-3 text-xl font-extrabold tracking-tight text-land-ink sm:text-2xl">
                      {reason.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                      {reason.text}
                    </p>
                  </LandingPad>
                </LandingLayer>
              </li>
            ))}
          </ol>
        </Reveal>
      </LandingSection>

      <Reveal>
        <ReviewsBlock />
      </Reveal>

      <LandingSection id="pricing">
        <Reveal>
          <LandingLayer className="bg-land-panel text-white">
            <LandingPad>
              <div className="grid items-end gap-8 lg:grid-cols-[auto_1fr] lg:gap-16">
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white/50">
                    В месяц
                  </p>
                  <div className="mt-3 flex items-start gap-2">
                    <p className="text-7xl font-extrabold tracking-tight leading-none sm:text-8xl">
                      15
                    </p>
                    <BelarusRubleIcon className="mt-2 size-9 shrink-0 text-white sm:mt-3 sm:size-11" />
                  </div>
                </div>
                <div className="max-w-md">
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Столько стоит не собирать ленту вручную
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                    Правки в том же проекте и экспорт без водяного знака.
                    Отмена в любой момент.
                  </p>
                  <a
                    href="/studio"
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-land-panel sm:w-auto"
                  >
                    Открыть студию
                  </a>
                </div>
              </div>
            </LandingPad>
          </LandingLayer>
        </Reveal>
      </LandingSection>

      {/* 6. Feedback — only for signed-in */}
      <Reveal>
        <LeaveReviewBlock />
      </Reveal>

      {/* 7. FAQ */}
      <LandingSection id="faq">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
            <div>
              <h2 className={`${landTitle} text-land-ink`}>Вопросы</h2>
              <p className={`mt-4 max-w-xs text-land-ink/55 ${landSub}`}>
                Коротко, перед тем как открыть студию.
              </p>
            </div>
            <Accordion type="single" collapsible defaultValue="why">
              {FAQ.map((item) => (
                <AccordionItem
                  key={item.value}
                  value={item.value}
                  className="border-land-ink/10"
                >
                  <AccordionTrigger className="min-h-12 items-center py-4 text-left text-[15px] font-semibold leading-snug text-land-ink hover:no-underline sm:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-land-ink/55">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </LandingSection>

      {/* Social */}
      <LandingSection className="pb-10 pt-0 sm:pb-12 sm:pt-0">
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          {SOCIAL.map(({ key, name, href, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="grid size-12 place-items-center rounded-full text-land-ink transition-colors hover:bg-land-card hover:text-land-blue sm:size-14"
            >
              <Icon className="size-6 sm:size-7" aria-hidden />
            </a>
          ))}
        </div>
      </LandingSection>

      <footer>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:grid-cols-[1fr_auto_1.2fr] lg:items-start">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-land-ink"
            >
              deckva.by
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/45">
              Карусель как один пост: слайды, правки и файл для публикации.
            </p>
            <p className="mt-4 text-sm text-land-ink/45">
              © {new Date().getFullYear()} Deckva
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-land-ink/55 lg:justify-center">
            {NAV.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className="hover:text-land-ink"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="text-sm leading-relaxed text-land-ink/55">
            <p className="font-semibold text-land-ink">{LEGAL.status}</p>
            <p className="mt-1">{LEGAL.country}</p>
            <dl className="mt-3 space-y-1.5">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-land-ink/45">ФИО</dt>
                <dd className="font-medium text-land-ink">{LEGAL.fullName}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-land-ink/45">УНП</dt>
                <dd className="font-medium tabular-nums text-land-ink">
                  {LEGAL.unp}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-land-ink/45">Email</dt>
                <dd>
                  <a
                    href={`mailto:${LEGAL.email}`}
                    className="font-medium text-land-ink hover:text-land-blue"
                  >
                    {LEGAL.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </footer>
    </div>
  );
}
