"use client";

import { useState } from "react";
import Link from "next/link";
import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import { AuthModal } from "@/components/auth";
import { LandingThreadsNav } from "@/components/landing/landing-threads-nav";
import { threadsContentOffset } from "@/components/nav/threads-chrome";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HeroStage } from "@/components/landing/hero-stage";
import { Reveal, RevealItem, RevealStagger } from "@/components/landing/reveal";
import { FreeBlock } from "@/components/landing/free-block";
import { PhotoStatement } from "@/components/landing/photo-statement";
import { ReviewsBlock } from "@/components/landing/reviews-block";
import { LeaveReviewBlock } from "@/components/landing/leave-review-block";
import {
  BrandKitArt,
  FeedArt,
  GenerateArt,
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
import { cn } from "@/lib/utils";
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
    a: "Студия для каруселей в соцсетях. Собираете слайды на холсте, генерируете с AI или стартуете с шаблона — и экспортируете готовые картинки.",
  },
  {
    value: "how-start",
    q: "С чего начать?",
    a: "Откройте студию: опишите тему в промпте, возьмите шаблон или пустой холст. Слайды сразу в пропорциях поста.",
  },
  {
    value: "ai",
    q: "Как работает AI-генерация?",
    a: "Пишете тему — Deckva собирает карусель со структурой слайдов. Потом правите текст, обложку и порядок в редакторе.",
  },
  {
    value: "edit",
    q: "Что можно менять?",
    a: "Текст, фото, фон, слои, brand kit и порядок слайдов.",
  },
  {
    value: "vs-canva",
    q: "Чем отличается от Canva?",
    a: "Deckva заточен под карусель: несколько слайдов в формате поста, AI-старт, слои и экспорт без сборки ленты где-то ещё.",
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
    a: "Да. Выберите шаблон с готовой структурой, AI-промпт или пустой холст.",
  },
  {
    value: "assets",
    q: "Куда загружать свои картинки?",
    a: "В панели Assets — логотипы и фото, которые переиспользуете на слайдах.",
  },
  {
    value: "brand-kit",
    q: "Что такое Brand kit?",
    a: "Палитра, шрифты и логотипы бренда. Один раз настроили — применяете к новым каруселям.",
  },
  {
    value: "save",
    q: "Сохраняются ли проекты?",
    a: "Да. Карусели остаются в аккаунте — можно вернуться и продолжить.",
  },
  {
    value: "devices",
    q: "На каких устройствах работает?",
    a: "Студия открывается в браузере, в том числе с телефона. Редактор холста — на широком экране.",
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

  return (
    <div
      id="top"
      className={cn("relative bg-land-mist", threadsContentOffset)}
    >
      <LandingThreadsNav onSignIn={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <section className="relative overflow-hidden bg-land-blue text-white">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 pt-8 pb-24 sm:gap-12 sm:px-6 sm:pt-14 sm:pb-44 lg:min-h-[90vh] lg:grid-cols-[1.05fr_0.95fr] lg:pt-16 lg:pb-52">
          <div>
            <h1 className="max-w-xl text-[2.5rem] font-extrabold tracking-tight leading-[0.95] sm:text-6xl lg:text-7xl">
              AI-редактор каруселей
            </h1>
            <TextGenerateEffect
              words="Опишите тему — AI соберёт карусель. Дальше правите и экспортируете."
              duration={0.35}
              className="mt-5 text-xl font-medium text-white/90 sm:text-2xl"
              spanClassName="text-white/90"
            />
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Button
                asChild
                className="h-11 w-full rounded-full bg-white px-5 text-land-blue hover:bg-white/90 min-[420px]:w-auto"
              >
                <Link href="/studio">Открыть</Link>
              </Button>
              <a
                href="#studio"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10 min-[420px]:w-auto"
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
            text="От промпта или шаблона до экспорта — без сборки ленты в другом инструменте."
          />
        </Reveal>

        <RevealStagger className="grid gap-3 sm:gap-4 md:grid-cols-12">
          <RevealItem className="md:col-span-7 md:row-span-2">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad>
                <h3 className={`${landCardTitle} text-land-ink`}>
                  AI-генерация
                </h3>
                <p className={`mt-3 max-w-md text-land-ink/55 ${landCardSub}`}>
                  Опишите тему — получите готовую карусель. Дальше правите
                  текст, обложку и порядок слайдов.
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
                <h3 className={`${landCardTitle} text-land-ink`}>
                  Assets и Brand kit
                </h3>
                <p className={`mt-3 max-w-sm text-land-ink/55 ${landCardSub}`}>
                  Логотипы и фото в Assets. Палитра, шрифты и марки — в Brand
                  kit, чтобы стиль не разъезжался.
                </p>
                <BrandKitArt />
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
                  Промпт, шаблон или пустой холст — дальше правки и экспорт.
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
              <div className="relative z-10 -mx-4 overflow-hidden sm:-mx-10">
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
