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
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { HeroStage } from "@/components/landing/hero-stage";
import { Reveal, RevealItem, RevealStagger } from "@/components/landing/reveal";
import { FreeBlock } from "@/components/landing/free-block";
import { PhotoStatement } from "@/components/landing/photo-statement";
import { ReviewsBlock } from "@/components/landing/reviews-block";
import { LeaveReviewBlock } from "@/components/landing/leave-review-block";
import {
  FeedArt,
  GenerateArt,
  IconsArt,
  StudioArt,
  TemplatesArt,
} from "@/components/landing/landing-art";
import { StudioVideo } from "@/components/landing/studio-video";
import { DualPhonesMock } from "@/components/landing/landing-visuals";
import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
  landCardTitle,
  landCardSub,
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
  { name: "Возможности", link: "#product" },
  { name: "Примеры", link: "#reviews" },
  { name: "Тариф", link: "#pricing" },
  { name: "Вопросы", link: "#faq" },
];

const FAQ = [
  {
    value: "what",
    q: "Что такое Deckva?",
    a: "Студия для каруселей в соцсетях. Собираете слайды на холсте и экспортируете готовые картинки.",
  },
  {
    value: "how-start",
    q: "С чего начать?",
    a: "Откройте студию: пустой холст или шаблон. Слайды сразу в пропорциях поста.",
  },
  {
    value: "edit",
    q: "Что можно менять?",
    a: "Текст, фото, иконки, фон, слои и порядок слайдов.",
  },
  {
    value: "vs-canva",
    q: "Чем отличается от Canva?",
    a: "Deckva заточен под карусель: несколько слайдов в формате поста, слои и экспорт без сборки ленты где-то ещё.",
  },
  {
    value: "pricing",
    q: "Сколько стоит?",
    a: "15 Br в месяц. Редактирование и экспорт PNG или ZIP без водяного знака.",
  },
  {
    value: "how-to-export",
    q: "Как экспортировать?",
    a: "PNG — один слайд. ZIP — вся карусель одним архивом.",
  },
  {
    value: "formats",
    q: "Какие форматы поддерживаются?",
    a: "Пост, квадрат, история и широкий кадр. Можно переключать пропорции под площадку.",
  },
  {
    value: "watermark",
    q: "Есть ли водяной знак?",
    a: "В Pro — нет. Экспортируете чистые слайды без логотипа Deckva.",
  },
  {
    value: "trial",
    q: "Есть пробный период?",
    a: "Нет отдельного триала. Подписка отменяется в любой момент.",
  },
  {
    value: "cancel",
    q: "Как отменить подписку?",
    a: "В настройках аккаунта. Доступ Pro сохраняется до конца оплаченного периода.",
  },
  {
    value: "templates",
    q: "Можно начать с шаблона?",
    a: "Да. Выберите шаблон с готовой структурой или пустой холст.",
  },
  {
    value: "icons",
    q: "Откуда брать иконки?",
    a: "Библиотека иконок встроена в студию — добавляете на слайд в один клик.",
  },
  {
    value: "save",
    q: "Сохраняются ли проекты?",
    a: "Да. Карусели остаются в аккаунте — можно вернуться и продолжить.",
  },
  {
    value: "devices",
    q: "На каких устройствах работает?",
    a: "В браузере на компьютере. Для точной вёрстки лучше большой экран.",
  },
  {
    value: "who",
    q: "Для кого сервис?",
    a: "Для редакторов, маркетологов и авторов, которым нужна карусель, а не один квадрат.",
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
      <FloatingNav navItems={NAV} ctaHref="/studio" ctaLabel="Студия" />
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <section className="relative overflow-hidden bg-land-blue text-white">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
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
              <Link href="/studio">
                <span className="sm:hidden">Студия</span>
                <span className="hidden sm:inline">Открыть</span>
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white md:hidden"
                  aria-label="Меню"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100%,20rem)]">
                <div className="flex flex-col gap-1 px-4">
                  {NAV.map((item) => (
                    <SheetClose asChild key={item.link}>
                      <a
                        href={item.link}
                        className="rounded-xl px-3 py-3 text-base font-medium"
                      >
                        {item.name}
                      </a>
                    </SheetClose>
                  ))}
                  {signedIn ? (
                    <Button
                      asChild
                      variant="outline"
                      className="mt-3 h-10 rounded-full"
                    >
                      <Link href="/studio">Проекты</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-3 h-10 rounded-full"
                      onClick={() => setAuthOpen(true)}
                    >
                      Войти
                    </Button>
                  )}
                  <Button asChild className="h-10 rounded-full">
                    <Link href="/studio">Открыть студию</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid min-h-[85vh] max-w-6xl items-center gap-10 px-4 pb-36 pt-10 sm:gap-12 sm:px-6 sm:pb-44 sm:pt-14 lg:min-h-[90vh] lg:grid-cols-[1.05fr_0.95fr] lg:pb-52 lg:pt-16">
          <div>
            <h1 className="max-w-xl text-6xl font-extrabold tracking-tight leading-[0.95] sm:text-7xl lg:text-7xl">
              Редактор Каруселей
            </h1>
            <TextGenerateEffect
              words="Создайте карусель за пару минут и экспортируйте готовые картинки."
              duration={0.35}
              className="mt-5 text-2xl font-medium text-white/90 sm:text-3xl"
              spanClassName="text-white/90"
            />
            <p className={`mt-4 max-w-md text-white/75 ${landSub}`}>
              Текст, фон, иконки и порядок — в одном холсте.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-white px-5 text-land-blue hover:bg-white/90"
              >
                <Link href="/studio">Открыть</Link>
              </Button>
              <a
                href="#studio"
                className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10"
              >
                Смотреть студию
              </a>
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      {/* 1. Studio overlaps hero */}
      <LandingSection
        id="studio"
        className="relative z-20 -mt-20 py-0 sm:-mt-28 sm:py-0 lg:-mt-32"
      >
          <div className="overflow-hidden rounded-[2rem] bg-land-card sm:rounded-[2.5rem]">
            <StudioVideo />
          </div>
      </LandingSection>

      {/* 2. Capabilities */}
      <LandingSection id="product">
        <Reveal>
          <LandingHead
            title="Быстро и просто"
            text="От шаблона до экспорта — без сборки ленты в другом инструменте."
          />
        </Reveal>

        <RevealStagger className="grid gap-3 sm:gap-4 md:grid-cols-12">
          <RevealItem className="md:col-span-7 md:row-span-2">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad>
                <h3 className={`${landCardTitle} text-land-ink`}>Шаблоны</h3>
                <p className={`mt-3 max-w-md text-land-ink/55 ${landCardSub}`}>
                  Готовый набор слайдов или пустой холст — дальше правите
                  текст, фон и порядок.
                </p>
                <div className="mt-6 flex justify-center">
                  <GenerateArt />
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-5">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad className="sm:p-7">
                <h3 className={`${landCardTitle} text-land-ink`}>Формат</h3>
                <p className={`mt-3 max-w-md text-land-ink/55 ${landCardSub}`}>
                  Пропорции ленты заданы сразу — без подгонки после экспорта.
                </p>
                <div className="mt-4 flex justify-center">
                  <FeedArt />
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-5">
            <LandingLayer className="h-full bg-land-panel text-white">
              <LandingPad className="sm:p-7">
                <h3 className={landCardTitle}>Редактор</h3>
                <p className={`mt-3 max-w-md text-white/70 ${landCardSub}`}>
                  Текст, фон, слои и порядок слайдов — до финала в одной
                  студии.
                </p>
                <div className="mt-4">
                  <StudioArt />
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-6">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad>
                <h3 className={`${landCardTitle} text-land-ink`}>Иконки</h3>
                <p className={`mt-3 max-w-sm text-land-ink/55 ${landCardSub}`}>
                  Иконки и смайлы прямо в студии — клик, и они на слайде.
                </p>
                <IconsArt />
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-6">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad>
                <h3 className={`${landCardTitle} text-land-ink`}>
                  Готовые шаблоны
                </h3>
                <p className={`mt-3 max-w-sm text-land-ink/55 ${landCardSub}`}>
                  Обложка и финал уже выстроены — остаётся заменить текст.
                </p>
                <TemplatesArt />
              </LandingPad>
            </LandingLayer>
          </RevealItem>
        </RevealStagger>
      </LandingSection>

      {/* 3. Positioning */}
      <Reveal>
        <PhotoStatement />
      </Reveal>

      {/* 4. Proof */}
      <Reveal>
        <ReviewsBlock />
      </Reveal>

      {/* 5. Pricing */}
      <Reveal>
        <FreeBlock />
      </Reveal>

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
                О старте, правках и экспорте.
              </p>
            </div>
            <Accordion type="single" collapsible defaultValue="what">
              {FAQ.map((item) => (
                <AccordionItem
                  key={item.value}
                  value={item.value}
                  className="border-land-ink/10"
                >
                  <AccordionTrigger className="py-4 text-left text-base font-semibold text-land-ink hover:no-underline">
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

      {/* 8. Final CTA */}
      <LandingSection className="pb-16 pt-4 sm:pb-20 sm:pt-6">
        <Reveal>
          <LandingLayer className="bg-land-blue text-white">
            <div className="relative grid items-end gap-8 px-6 pt-12 sm:gap-10 sm:px-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="absolute -right-10 top-8 size-40 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-20 left-[40%] size-28 rounded-full bg-white/20 blur-2xl" />
              <div className="relative z-10 pb-4 sm:pb-16">
                <h2 className={`max-w-xl ${landTitle}`}>
                  Соберите карусель
                  <br />
                  за пару минут
                </h2>
                <p className={`mt-4 max-w-md text-white/75 ${landSub}`}>
                  Откройте студию и доведите слайды до публикации.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/studio"
                    className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-land-blue"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
              <div className="relative z-10 -mx-10 overflow-hidden">
                <div className="absolute inset-x-10 top-4 h-full rounded-full bg-land-panel/25 blur-xl" />
                <DualPhonesMock />
              </div>
            </div>
          </LandingLayer>
        </Reveal>
      </LandingSection>

      {/* 9. Social */}
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
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto_1.2fr] lg:items-start">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-land-ink"
            >
              deckva.by
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/45">
              Студия для каруселей в социальных сетях.
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
