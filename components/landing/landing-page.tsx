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
import {
  LandingSection,
  landTitle,
  landSub,
} from "@/components/landing/landing-shell";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SOCIAL_LINKS } from "@/lib/social";

const LEGAL = {
  status: "Professional income tax payer",
  fullName: "Шульга Станислав",
  unp: "XXXXXXXXX",
  email: "hello@deckva.by",
  country: "Republic of Belarus",
} as const;

const NAV = [
  { name: "See it", link: "#studio" },
  { name: "The post", link: "#post" },
  { name: "Examples", link: "#reviews" },
  { name: "Price", link: "#pricing" },
  { name: "Questions", link: "#faq" },
];

const STARTS = [
  "Product launch",
  "How it works",
  "Seven mistakes",
  "Before and after",
  "A checklist",
  "This week’s tips",
  "A short story",
  "What changed",
] as const;

const WAYS = [
  {
    title: "Any topic, a set of slides",
    text: "Write the subject. The slides come back in order, in the ratio of a feed.",
  },
  {
    title: "Every slide stays editable",
    text: "Change the words, the cover, and the order in the same project.",
  },
  {
    title: "The download is the post",
    text: "A PNG of one slide, or a ZIP of the carousel. No watermark on the file.",
  },
] as const;

const MOVES = [
  {
    title: "Write",
    text: "Name the post. The structure shows up on the slides.",
  },
  {
    title: "Shape",
    text: "Rewrite a line, swap the cover, move a slide.",
  },
  {
    title: "Post",
    text: "Download the file when the carousel is the one you want.",
  },
] as const;

const BLOCKS = [
  {
    title: "Launch",
    text: "The offer, the proof, then the next step.",
    span: "sm:col-span-2 lg:col-span-7",
    shot: "h-52 sm:h-64",
  },
  {
    title: "How-to",
    text: "One step on each slide.",
    span: "lg:col-span-5",
    shot: "h-52 sm:h-64",
  },
  {
    title: "Checklist",
    text: "A list people save.",
    span: "lg:col-span-4",
    shot: "h-40 sm:h-48",
  },
  {
    title: "Story",
    text: "A beginning, a turn, an end.",
    span: "lg:col-span-4",
    shot: "h-40 sm:h-48",
  },
  {
    title: "Tips",
    text: "A short run of useful points.",
    span: "lg:col-span-4",
    shot: "h-40 sm:h-48",
  },
  {
    title: "Before and after",
    text: "What changed, on two beats.",
    span: "sm:col-span-2 lg:col-span-8",
    shot: "h-44 sm:h-52",
  },
  {
    title: "A series",
    text: "The same shape, a new topic.",
    span: "lg:col-span-4",
    shot: "h-44 sm:h-52",
  },
] as const;

function Place({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`bg-[#c8c8c8] dark:bg-[#4a4a4a] ${className ?? ""}`}
    />
  );
}

const FAQ = [
  {
    value: "project",
    q: "What is a project?",
    a: "One carousel. The slides, their order, and the file you download all live in that project.",
  },
  {
    value: "output",
    q: "What do I download?",
    a: "A PNG of one slide, or a ZIP of the whole carousel. No watermark, so you can publish the file.",
  },
  {
    value: "start",
    q: "Where does a post start?",
    a: "A topic, a template, or an empty project. A topic gives you the slide structure. Then you edit the text, the cover, and the order.",
  },
  {
    value: "price",
    q: "What does it cost?",
    a: "15 Br a month. Cancel any time. Access stays until the end of the paid period.",
  },
  {
    value: "where",
    q: "Where do I use it?",
    a: "In the browser on a computer. Laying out slides needs a wide screen.",
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
                <span className="sm:hidden">Studio</span>
                <span className="hidden sm:inline">Open</span>
              </a>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full text-white hover:bg-white/10 hover:text-white md:hidden"
                  aria-label="Menu"
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
                      <a href="/studio">Projects</a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-3 h-11 rounded-full"
                      onClick={() => setAuthOpen(true)}
                    >
                      Sign in
                    </Button>
                  )}
                  <Button asChild className="h-11 rounded-full">
                    <a href="/studio">Open studio</a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-land-blue text-white">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-10 sm:px-6 sm:pt-[calc(6rem+env(safe-area-inset-top))] sm:pb-14 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-md">
            <p className="text-sm font-medium text-white/70">
              Where a topic becomes a post
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight leading-[1.02] sm:text-6xl">
              Carousel studio
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
              Write what the post is about. The slides follow, in order. You
              edit them, then download the file.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-6 text-land-blue hover:bg-white/90"
              >
                <a href="/studio">Open studio</a>
              </Button>
              <a
                href="#studio"
                className="text-sm font-medium text-white/75 hover:text-white"
              >
                See it
              </a>
            </div>
          </div>
          <HeroStage />
        </div>
        <div className="relative z-10 overflow-hidden pb-8">
          <ul className="flex w-max gap-2 motion-safe:animate-marquee">
            {[...STARTS, ...STARTS].map((name, index) => (
              <li key={`${name}-${index}`} aria-hidden={index >= STARTS.length}>
                <a
                  href="/studio"
                  className="inline-flex h-10 items-center rounded-full bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LandingSection id="studio" className="relative z-20">
        <h2 className={`${landTitle} text-land-ink`}>See it come together</h2>
        <p className={`mt-3 max-w-lg ${landSub}`}>
          One project, from the topic you write to the file you download.
        </p>
        <div className="mt-6 overflow-hidden rounded-3xl bg-land-card">
          <StudioVideo />
        </div>
      </LandingSection>

      <LandingSection id="post">
        <Reveal>
          <h2 className={`${landTitle} max-w-xl text-land-ink`}>
            From a topic. Into a post.
          </h2>
          <p className={`mt-3 max-w-xl ${landSub}`}>
            Start with what the post is about. The studio lays out the slides.
            You take them from there.
          </p>
          <ul className="mt-8 grid gap-3 lg:grid-cols-3">
            {WAYS.map((item) => (
              <li
                key={item.title}
                className="overflow-hidden rounded-3xl bg-land-card"
              >
                <Place className="aspect-[4/3] w-full" />
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold tracking-tight text-land-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-land-ink/60">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </LandingSection>

      <LandingSection>
        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className={`${landTitle} text-land-ink`}>
                The whole post stays in one project
              </h2>
              <p className={`mt-3 max-w-md ${landSub}`}>
                The topic, the slides, the edits, and the file live together.
                You download when the carousel is finished.
              </p>
            </div>
            <Place className="aspect-[4/3] w-full rounded-3xl" />
          </div>
        </Reveal>
      </LandingSection>

      <LandingSection>
        <Reveal>
          <h2 className={`${landTitle} max-w-xl text-land-ink`}>
            You work the slides
          </h2>
          <p className={`mt-3 max-w-xl ${landSub}`}>
            Write the topic, change what came back, then take the file.
          </p>
          <ul className="mt-8 grid gap-3 lg:grid-cols-3">
            {MOVES.map((item) => (
              <li
                key={item.title}
                className="overflow-hidden rounded-3xl bg-land-card"
              >
                <Place className="aspect-[5/4] w-full" />
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold tracking-tight text-land-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-land-ink/60">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </LandingSection>

      <LandingSection id="make">
        <Reveal>
          <h2 className={`${landTitle} max-w-xl text-land-ink`}>
            Make the next one the same way
          </h2>
          <p className={`mt-3 max-w-xl ${landSub}`}>
            A shape you already know, a new topic inside it.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {BLOCKS.map((item) => (
              <li
                key={item.title}
                className={`overflow-hidden rounded-3xl bg-land-card ${item.span}`}
              >
                <Place className={`${item.shot} w-full`} />
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold tracking-tight text-land-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-land-ink/60">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </LandingSection>

      <LandingSection>
        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <Place className="aspect-[16/10] w-full rounded-3xl" />
            <div>
              <h2 className={`${landTitle} text-land-ink`}>The file is yours</h2>
              <p className={`mt-3 ${landSub}`}>
                No logo on the slides. The project stays in your account.
                Cancel the month whenever you want.
              </p>
            </div>
          </div>
        </Reveal>
      </LandingSection>

      <Reveal>
        <ReviewsBlock />
      </Reveal>

      <LandingSection id="pricing">
        <Reveal>
          <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
            <p className="text-5xl font-semibold tracking-tight text-land-ink">
              15
              <span className="ml-2 text-xl font-medium text-land-ink/45">
                Br
              </span>
            </p>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-land-ink">
                A month in the studio
              </h2>
              <p className="mt-2 max-w-md text-base leading-relaxed text-land-ink/55">
                Keep editing the same project. Download a file with no
                watermark. Cancel any time.
              </p>
            </div>
            <a
              href="/studio"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-land-blue px-6 text-sm font-semibold text-white hover:bg-land-blue/90 lg:w-auto"
            >
              Open studio
            </a>
          </div>
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
              <h2 className={`${landTitle} text-land-ink`}>Questions</h2>
              <p className={`mt-3 max-w-xs ${landSub}`}>
                Before you open the studio.
              </p>
            </div>
            <Accordion type="single" collapsible defaultValue="project">
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

      <LandingSection className="pb-4 sm:pb-6">
        <p className="max-w-xl text-4xl font-semibold tracking-tight text-land-ink sm:text-6xl sm:leading-[1.05]">
          Write it.
          <br />
          Shape it.
          <br />
          Post it.
        </p>
        <a
          href="/studio"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-land-blue px-6 text-sm font-semibold text-white hover:bg-land-blue/90"
        >
          Open studio
        </a>
      </LandingSection>

      <LandingSection>
        <h2 className={`${landTitle} text-land-ink`}>Find us</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SOCIAL.map(({ key, name, href, Icon }) => (
            <li key={key} className="min-w-0">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full min-h-36 flex-col justify-between rounded-3xl bg-land-card p-5 text-land-ink transition-colors hover:text-land-blue sm:min-h-40 sm:p-6"
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-lg font-semibold tracking-tight">
                  {name}
                </span>
              </a>
            </li>
          ))}
        </ul>
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
              Write the topic. Shape the slides. Post the file.
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
                <dt className="text-land-ink/45">Name</dt>
                <dd className="font-medium text-land-ink">{LEGAL.fullName}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-land-ink/45">Tax ID</dt>
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
