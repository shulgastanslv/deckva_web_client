"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check, Menu } from "lucide-react";

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
import { Reveal } from "@/components/landing/reveal";
import { FreeBlock } from "@/components/landing/free-block";
import { PhotoStatement } from "@/components/landing/photo-statement";
import { SlideMarquee } from "@/components/landing/slide-marquee";
import { ReviewsBlock } from "@/components/landing/reviews-block";
import { LeaveReviewBlock } from "@/components/landing/leave-review-block";
import {
  FeedArt,
  GenerateArt,
  IconsArt,
  StudioArt,
  TemplatesArt,
} from "@/components/landing/landing-art";
import { DualPhonesMock } from "@/components/landing/landing-visuals";
import { EngagementScroll } from "@/components/landing/engagement-scroll";
import { EditorStage } from "./editor-stage";
import {
  LandingGrid,
  LandingLayer,
  LandingPad,
  LandingSection,
} from "@/components/landing/landing-shell";
import { StudioUserNav } from "@/components/studio/studio-user-nav";
import { TooltipProvider } from "../ui/tooltip";

const LEGAL = {
  status: "Плательщик налога на профессиональный доход",
  fullName: "Шульга Станислав",
  unp: "XXXXXXXXX",
  email: "hello@swibp.io",
  country: "Республика Беларусь",
} as const;

const NAV = [
  { name: "Что это?", link: "#product" },
  { name: "Студия", link: "#studio" },
  { name: "Бесплатно", link: "#free" },
  { name: "Отзывы", link: "#reviews" },
  { name: "Обратная связь", link: "#review" },
  { name: "FAQ", link: "#faq" },
];

const EDITOR_POINTS = [
  "Generate on the canvas",
  "Layers and inspector",
  "Slide navigator",
  "Export PNG / ZIP",
];

const FAQ = [
  {
    value: "what",
    q: "Что такое Swibp?",
    a: "Студия для каруселей. Тема становится последовательностью слайдов, затем вы редактируете их на холсте и экспортируете слайды.",
  },
  {
    value: "how-gen",
    q: "Как работает генерация?",
    a: "Вы устанавливаете тему, количество слайдов и стиль. Модель распространяет идею по слайдам и открывает результат в редакторе — обложка, середина, конец уже в наличии.",
  },
  {
    value: "edit",
    q: "Могу ли я редактировать после генерации?",
    a: "Да. Измените текст, фото, иконки, фоновые слои, и порядок слайдов. Генерация — это начало, а не готовый пост.",
  },
  {
    value: "vs-canva",
    q: "В чем отличие от Canva?",
    a: "Canva начинает с пустого макета. Swibp сначала строит историю по слайдам, затем вы завершаете внешний вид в своей студии: слои, шаблоны, экспорт.",
  },
  {
    value: "free",
    q: "Это бесплатно?",
    a: "Да. Без подписки: генерация, редактирование холста, и экспорт PNG или ZIP. Слайды не имеют водяного знака.",
  },
  {
    value: "who",
    q: "Для кого это?",
    a: "Социальные команды, основатели, редакторы, маркетологи — любой, кто объясняет идею как карусель, а не один квадрат.",
  },
];

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="relative bg-[#f9f9f9]">
      <FloatingNav navItems={NAV} ctaHref="/studio" ctaLabel="Studio" />
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <section className="relative overflow-hidden bg-land-blue text-white">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />
        <BackgroundBeams className="opacity-60" />

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
            {signedIn ? (
              <TooltipProvider delayDuration={250}>
                <StudioUserNav />
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                className="hidden h-10 rounded-full px-4 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                onClick={() => setAuthOpen(true)}
              >
                Sign In
              </Button>
            )}
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
              words="Опишите вашу тему. AI создаст карусель."
              duration={0.35}
              className="mt-4 text-lg font-medium text-white/90 sm:text-2xl"
              spanClassName="text-white/90"
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Модель сама решает, что положить на обложку, что объяснить в середине и как закончить. Вы исправляете слова — вы не строите каждый слайд с нуля.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-white px-5 text-land-blue hover:bg-white/90"
              >
                <Link href="/studio">Создать с AI</Link>
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
            <LandingLayer className="bg-white/80 backdrop-blur-xl md:col-span-7 md:row-span-2">
              <LandingPad>
                <p className="text-lg font-bold text-land-ink">Генерация карусели</p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-land-ink">
                  Тема → карусель
                </h2>
                <p className="mt-2 text-base leading-relaxed text-land-ink/55 max-w-sm">
                  Обложка, середина, конец — из нескольких предложений.
                </p>
                <div className="mt-6 flex justify-center">
                  <GenerateArt />
                </div>
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-white/80 backdrop-blur-xl md:col-span-5">
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

            <LandingLayer className="bg-land-ink text-white md:col-span-5">
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

      <LandingSection id="studio" className="space-y-4 py-12 sm:space-y-4 sm:py-16">
        <Reveal>
          <LandingLayer className="bg-white">
            <LandingPad>
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
                <div>
                  <p className="text-sm font-bold text-land-blue">Студия</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-land-ink">
                    Редактор для каруселей
                  </h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-land-ink/55">
                    Холст уже в формате поста. Слайды расположены под:
                    обложка, середина, конец. Текст и слои расположены справа.
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {EDITOR_POINTS.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-base font-semibold text-land-ink sm:text-lg"
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-land-blue text-white">
                          <Check className="size-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/studio"
                    className="mt-8 inline-flex h-11 items-center rounded-full bg-land-ink px-5 text-sm font-semibold text-white"
                  >
                    Открыть
                  </Link>
                </div>
                <EditorStage />
              </div>
            </LandingPad>
          </LandingLayer>
        </Reveal>

        <Reveal delay={0.06}>
          <LandingGrid className="lg:grid-cols-2">
            <LandingLayer className="bg-land-ink">
              <LandingPad>
                <p className="text-sm font-bold text-white">Иконки</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  14 миллионов
                </h2>
                <p className="mt-3 max-w-xs text-sm text-white/70">
                  Поиск расположен рядом с холстом. Иконка падает на слайд.
                </p>
                <IconsArt />
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-land-ink text-white">
              <LandingPad>
                <p className="text-sm font-bold text-white/65">Шаблоны</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Библиотека шаблонов
                </h2>
                <p className="mt-3 max-w-xs text-sm text-white/75">
                  Обложка и конец остаются в ритме. Вы меняете слова.
                </p>
                <TemplatesArt />
              </LandingPad>
            </LandingLayer>
          </LandingGrid>
        </Reveal>
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
                <div className="absolute inset-x-10 h-full top-4 rounded-full bg-land-ink/25 blur-xl" />
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
              swibp.by
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/45">
              Студия для каруселей. Тема → слайды → экспорт.
            </p>
            <p className="mt-4 text-sm text-land-ink/45">
              © {new Date().getFullYear()} Swibp.by
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
