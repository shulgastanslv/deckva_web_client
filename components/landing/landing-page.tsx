"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BackgroundBeams } from "@/components/ui/background-beams";
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
  InviteArt,
  OrgArt,
  RewardsArt,
  StudioArt,
  TemplatesArt,
} from "@/components/landing/landing-art";
import { DualPhonesMock } from "@/components/landing/landing-visuals";
import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
  LandingGrid,
} from "@/components/landing/landing-shell";
import { ThemeSwitcher } from "@/components/theme-switcher";

const LEGAL = {
  status: "Плательщик налога на профессиональный доход",
  fullName: "Шульга Станислав",
  unp: "XXXXXXXXX",
  email: "hello@deckva.by",
  country: "Республика Беларусь",
} as const;

const NAV = [
  { name: "Что это?", link: "#product" },
  { name: "Студия", link: "#studio" },
  { name: "Команда", link: "#team" },
  { name: "Цена", link: "#pricing" },
  { name: "Отзывы", link: "#reviews" },
  { name: "Обратная связь", link: "#review" },
  { name: "FAQ", link: "#faq" },
];

const FAQ = [
  {
    value: "what",
    q: "Что такое Deckva?",
    a: "Студия для каруселей. Начинаете с пустого холста или шаблона, правите слайды и экспортируете их.",
  },
  {
    value: "how-start",
    q: "Как начать карусель?",
    a: "Откройте студию и создайте пустую карусель или выберите шаблон. Слайды сразу в пропорциях поста.",
  },
  {
    value: "edit",
    q: "Что можно менять в редакторе?",
    a: "Текст, фото, иконки, фон, слои и порядок слайдов.",
  },
  {
    value: "vs-canva",
    q: "В чем отличие от Canva?",
    a: "Deckva собран вокруг карусели: несколько слайдов в формате поста, слои, шаблоны и экспорт.",
  },
  {
    value: "pricing",
    q: "Сколько это стоит?",
    a: "15$. Один платёж: редактирование холста и экспорт PNG или ZIP. Слайды без водяного знака.",
  },
  {
    value: "who",
    q: "Для кого это?",
    a: "Социальные команды, основатели, редакторы, маркетологи — любой, кто объясняет идею как карусель, а не один квадрат.",
  },
  {
    value: "how-to-use",
    q: "Как использовать?",
    a: "1. Создайте пустую карусель или откройте шаблон. 2. Правьте текст, фото, иконки, фон и порядок слайдов. 3. Экспортируйте слайды в PNG или ZIP.",
  },
  {
    value: "how-to-export",
    q: "Как экспортировать?",
    a: "Вы экспортируете слайды в PNG или ZIP. PNG — один файл, ZIP — все слайды в одном архиве.",
  },
  {
    value: "orgs",
    q: "Что такое организация?",
    a: "Это общее пространство для команды: проекты, роли и активная студия. Один аккаунт может состоять в нескольких организациях и переключаться между ними.",
  },
  {
    value: "invite",
    q: "Как пригласить человека?",
    a: "Отправьте email-приглашение или скопируйте invite-ссылку организации. Человек заходит в студию по ссылке и сразу попадает в вашу команду. За новых пользователей можно получать бонусы.",
  },
];

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="relative bg-land-mist">
      <FloatingNav navItems={NAV} ctaHref="/studio" ctaLabel="Studio" />
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
                  aria-label="Menu"
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
                      <Link href="/studio">Projects</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-3 h-10 rounded-full"
                      onClick={() => setAuthOpen(true)}
                    >
                      Sign in
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

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
          <div>
            <h1 className="max-w-xl text-7xl font-extrabold tracking-tight">
              Создайте карусель
              <br />
             за пару минут
            </h1>
            <TextGenerateEffect
              words="Пустой холст или шаблон. Дальше правите слайды сами."
              duration={0.35}
              className="mt-4 text-lg font-medium text-white/90 sm:text-2xl"
              spanClassName="text-white/90"
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Слайды уже в формате поста. Текст, фон, иконки и порядок — в редакторе, без сборки карусели в другом инструменте.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-white px-5 text-land-blue hover:bg-white/90"
              >
                <Link href="/studio">Открыть студию</Link>
              </Button>
              <a
                href="#product"
                className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10"
              >
                Как это работает
              </a>
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      <LandingSection
        id="product"
        className="relative z-20 -mt-10 py-0 sm:py-0 lg:-mt-40"
      >
          <LandingGrid className="md:grid-cols-12">
            <LandingLayer className="bg-land-card/80 backdrop-blur-xl md:col-span-7 md:row-span-2">
              <LandingPad>
                <p className="text-lg font-bold text-land-ink">Шаблоны</p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-land-ink">
                  Начните со слайдов
                </h2>
                <p className="mt-2 text-base leading-relaxed text-land-ink/55 max-w-sm">
                  Пустой холст или готовый шаблон — дальше правите текст, фон и порядок.
                </p>
                <div className="mt-6 flex justify-center">
                  <GenerateArt />
                </div>
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-land-card/80 backdrop-blur-xl md:col-span-5">
              <LandingPad className="sm:p-7">
                <p className="text-lg font-bold text-land-blue">Редактор</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-land-ink">
                  Пост, а не файл
                </h3>
                <p className="mt-2 text-base leading-relaxed text-land-ink/55 max-w-sm">
                  Уже в пропорциях поста, а не один квадрат.
                </p>
                <div className="mt-4 flex justify-center">
                  <FeedArt />
                </div>
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-land-panel text-white md:col-span-5">
              <LandingPad className="sm:p-7">
                <p className="text-lg font-bold text-white/60">Студия</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight">
                  Редактор на холсте
                </h3>
                <p className="mt-2 text-base leading-relaxed text-white/70 max-w-sm">
                  Текст, фон, и порядок слайдов — вы завершаете его.
                </p>
                <div className="mt-4">
                  <StudioArt />
                </div>
              </LandingPad>
            </LandingLayer>
          </LandingGrid>
      </LandingSection>


      <Reveal>
        <PhotoStatement />
      </Reveal>

      <Reveal>
        <FreeBlock />
      </Reveal>

      <Reveal>
        <ReviewsBlock />
      </Reveal>

      <Reveal>
        <LeaveReviewBlock />
      </Reveal>

      <LandingSection id="studio">
        <RevealStagger className="grid gap-3 sm:gap-4 md:grid-cols-12">
          <RevealItem className="md:col-span-12">
            <LandingLayer className="bg-land-card">
              <LandingPad>
                <div className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
                  <div>
                    <p className="text-lg font-bold text-land-blue">Студия</p>
                    <h2 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight text-land-ink sm:text-4xl">
                      Редактор на холсте
                    </h2>
                    <p className="mt-3 max-w-sm text-base leading-relaxed text-land-ink/55">
                      Слайды уже в формате поста. Текст и слои — рядом.
                    </p>
                    <Link
                      href="/studio"
                      className="mt-6 inline-flex h-10 items-center rounded-full bg-land-panel px-5 text-sm font-semibold text-white"
                    >
                      Открыть
                    </Link>
                  </div>
                  <div className="flex justify-center md:justify-end">
                    <StudioArt />
                  </div>
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-6">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad className="flex h-full flex-col justify-between gap-10">
                <div>
                  <p className="text-lg font-bold text-land-blue">Иконки</p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/55">
                    Иконки и смайлы прямо в студии — клик, и они на слайде.
                  </p>
                </div>
                <p className="text-[100px] font-extrabold leading-[1.05] tracking-tight text-land-ink">
                  2+ млн
                </p>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-6">
            <LandingLayer className="h-full bg-land-card">
              <LandingPad>
                <p className="text-lg font-bold text-land-blue">Шаблоны</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-land-ink sm:text-3xl">
                  Готовый ритм
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/55">
                  Обложка и конец на месте. Вы меняете слова.
                </p>
                <TemplatesArt />
              </LandingPad>
            </LandingLayer>
          </RevealItem>
        </RevealStagger>
      </LandingSection>

      <LandingSection id="team">
        <Reveal>
          <LandingHead
            title="Команда"
            text="Организация — общее пространство. Инвайт — способ собрать людей в одну студию."
          />
        </Reveal>

        <RevealStagger className="grid gap-3 sm:gap-4 md:grid-cols-12">
          <RevealItem className="md:col-span-7">
            <LandingLayer className="h-full bg-land-panel text-white">
              <LandingPad className="flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="text-lg font-bold text-white/60">Организации</p>
                  <h2 className="mt-3 max-w-md text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Одна студия на всю команду
                  </h2>
                  <p className="mt-4 max-w-sm text-base leading-relaxed text-white/70 sm:text-lg">
                    Проекты и роли в одном месте. Переключайтесь между
                    организациями — клиент, агентство, личный аккаунт.
                  </p>
                </div>
                <div className="flex justify-center sm:justify-start">
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-5">
            <LandingLayer className="h-full bg-land-blue text-white">
              <LandingPad className="flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="text-lg font-bold text-white/70">Инвайты</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Ссылка или email
                  </h2>
                  <p className="mt-3 max-w-xs text-base leading-relaxed text-white/75">
                    Скопируйте invite-ссылку или отправьте приглашение на почту.
                    Человек заходит — и сразу в вашей организации.
                  </p>
                </div>
                <div className="flex justify-center sm:justify-start">
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>

          <RevealItem className="md:col-span-12">
            <LandingLayer className="bg-land-card">
              <LandingPad>
                <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
                  <div>
                    <p className="text-lg font-bold text-land-blue">Награды</p>
                    <h2 className="mt-2 max-w-lg text-4xl font-extrabold tracking-tight text-land-ink sm:text-5xl">
                      Пригласили — получили бонус
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-land-ink/55 sm:text-lg">
                      За новые аккаунты — ранний доступ к фичам. Им — стартовый
                      набор шаблонов.
                    </p>
                  </div>
                  <div className="flex justify-center md:justify-end">
                  </div>
                </div>
              </LandingPad>
            </LandingLayer>
          </RevealItem>
        </RevealStagger>
      </LandingSection>

      <LandingSection id="faq">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-land-ink sm:text-4xl">
                FAQ
              </h2>
              <p className="mt-3 max-w-xs text-sm text-land-ink/55">
                Генерация, редактирование, экспорт, и ваш аккаунт — в кратком изложении.
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


      <LandingSection className="pb-16 pt-4 sm:pb-20 sm:pt-6">
        <Reveal>
          <LandingLayer className="bg-land-blue text-white">
            <div className="relative grid items-end gap-8 px-6 pt-12 sm:gap-10 sm:px-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="absolute -right-10 top-8 size-40 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-20 left-[40%] size-28 rounded-full bg-white/20 blur-2xl" />
              <div className="relative z-10 pb-4 sm:pb-16">
                <h2 className="max-w-md text-3xl font-extrabold tracking-tight sm:text-5xl">
                  У вас есть тема.
                  <br />
                  И карусель уже готова.
                </h2>
                <p className="mt-4 max-w-sm text-sm text-white/75 sm:text-base">
                  Откройте студию и начните создавать карусель.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/studio"
                    className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-land-blue"
                  >
                    Создать
                  </Link>
                </div>
              </div>
              <div className="relative z-10 -mx-10 overflow-hidden">
                <div className="absolute inset-x-10 h-full top-4 rounded-full bg-land-panel/25 blur-xl" />
                <DualPhonesMock />
              </div>
            </div>
          </LandingLayer>
        </Reveal>
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
              Студия для каруселей. Тема → слайды → экспорт.
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
