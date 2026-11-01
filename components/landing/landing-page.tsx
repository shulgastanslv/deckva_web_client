"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Menu } from "lucide-react";
import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import Logo from "@/components/logo";
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
import { LeaveReviewBlock } from "@/components/landing/leave-review-block";
import { StudioVideo } from "@/components/landing/studio-video";
import {
  LandingSection,
  landTitle,
  landSub,
} from "@/components/landing/landing-shell";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SOCIAL_LINKS } from "@/lib/social";
import {
  FREE_CAROUSEL_LIMIT,
  PRO_FEATURES,
  STUDIO_PRO_PRICE,
} from "@/lib/studio/plans";

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

const sectionTitle =
  "max-w-3xl text-4xl font-medium tracking-tight text-land-ink sm:text-5xl sm:leading-[1.08]";

const PROMPTS = [
  {
    label: "Launch",
    line: "A launch in six slides: the offer, who it is for, the proof, and what to do next.",
  },
  {
    label: "How-to",
    line: "A how-to where each slide is one step, and the last slide is the result.",
  },
  {
    label: "Checklist",
    line: "A checklist people can save. Short lines, one idea on each slide.",
  },
  {
    label: "Story",
    line: "A short story with a beginning, a turn, and an end.",
  },
] as const;

const SHAPES = [
  {
    value: "story",
    title: "Story",
    text: "A beginning, a turn, and an end. The slides already follow that arc.",
  },
  {
    value: "tips",
    title: "Tips",
    text: "A short run of useful points, one idea on each slide.",
  },
  {
    value: "compare",
    title: "Before and after",
    text: "What changed, shown as two beats in the same carousel.",
  },
  {
    value: "series",
    title: "A series",
    text: "The same shape next time, with a new topic in it.",
  },
] as const;

const POSTS = [
  "/reviews/1.jpg",
  "/reviews/2.jpg",
  "/reviews/3.jpg",
  "/reviews/4.jpg",
  "/reviews/5.jpg",
  "/reviews/6.jpg",
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

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { name: "Open studio", href: "/studio" },
      { name: "See it", href: "#studio" },
      { name: "The post", href: "#post" },
      { name: "Examples", href: "#reviews" },
      { name: "Questions", href: "#faq" },
    ],
  },
  {
    title: "Make",
    links: [
      { name: "Starting lines", href: "#start" },
      { name: "AI generation", href: "#generate" },
      { name: "Shapes", href: "#make" },
      { name: "Price", href: "#pricing" },
    ],
  },
  {
    title: "Find us",
    links: [
      { name: "Threads", href: SOCIAL_LINKS.threads },
      { name: "Telegram", href: SOCIAL_LINKS.telegram },
      { name: "Instagram", href: SOCIAL_LINKS.instagram },
      { name: "TikTok", href: SOCIAL_LINKS.tiktok },
    ],
  },
] as const;

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
  const [prompt, setPrompt] = useState(0);
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const activePrompt = PROMPTS[prompt];

  return (
    <div className="relative bg-land-mist">
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 rounded-full border border-white/50 bg-white/70 px-2.5 py-2 text-land-ink backdrop-blur-xl dark:border-white/10 dark:bg-[#14151c]/70 sm:px-4">
          <Logo width={32} height={32} />

          <nav className="hidden items-center gap-6 text-sm font-medium text-land-ink/70 md:flex">
            {NAV.map((item) => (
              <a key={item.link} href={item.link} className="hover:text-land-ink">
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeSwitcher className="h-10 w-10 text-land-ink hover:bg-land-ink/10 hover:text-land-ink" />
            <Button
              asChild
              className="h-10 rounded-full bg-land-ink px-4 text-land-mist hover:bg-land-ink/90"
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
                  className="size-10 rounded-full text-land-ink hover:bg-land-ink/10 hover:text-land-ink md:hidden"
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
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-4 pt-[calc(7.25rem+env(safe-area-inset-top))] pb-16 sm:px-6 sm:pt-[calc(8rem+env(safe-area-inset-top))] sm:pb-20 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-16 lg:pb-24">
          <div className="flex w-full max-w-xl flex-col items-center text-center lg:w-[24rem] lg:shrink-0 lg:items-start lg:text-left">
            <h1 className="max-w-[10ch] text-6xl font-semibold tracking-tight leading-[0.92] sm:text-7xl lg:text-8xl">
              Slides from a sentence
            </h1>
            <p className="mt-6 max-w-lg text-xl leading-snug text-white/80 sm:text-2xl">
              Write what the post is about. The slides follow, in order. You
              edit them, then download the file.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start">
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
      </section>

      <LandingSection id="start">
        <h2 className={`${sectionTitle} mx-auto text-center`}>
          Four starting lines
        </h2>
        <div className="mx-auto mt-8 max-w-2xl rounded-[1.75rem] bg-land-card p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setPrompt(index)}
                className={`h-9 rounded-full px-4 text-sm font-medium ${
                  index === prompt
                    ? "bg-land-ink text-land-mist"
                    : "bg-land-mist text-land-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-6 text-2xl font-medium tracking-tight text-land-ink sm:text-3xl">
            {activePrompt.line}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-land-ink/50">
              This is the topic the slides start from.
            </p>
            <a
              href="/studio"
              className="inline-flex h-11 items-center justify-center rounded-full bg-land-ink px-5 text-sm font-semibold text-land-mist"
            >
              Open studio
            </a>
          </div>
        </div>
      </LandingSection>

      <LandingSection id="studio" className="relative z-20">
        <h2 className={sectionTitle}>Topic, slides, then the file</h2>
        <p className={`mt-4 max-w-xl ${landSub}`}>
          From the sentence you write to the slides you can download.
        </p>
        <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-land-card">
          <StudioVideo />
        </div>
      </LandingSection>

      <LandingSection id="post">
        <h2 className={sectionTitle}>Sequence is the first draft</h2>
        <p className={`mt-4 max-w-2xl ${landSub}`}>
          You name the subject. The studio returns a carousel in the ratio of
          a feed. Then you change the words, the cover, and the sequence until
          the post is yours.
        </p>
        <a
          href="/studio"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-land-ink px-5 text-sm font-semibold text-land-mist"
        >
          Open studio
        </a>
        <Place className="mt-8 h-64 w-full rounded-[1.75rem] sm:h-80" />
        <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          <li>
            <h3 className="text-xl font-medium tracking-tight text-land-ink">
              The subject is enough
            </h3>
            <p className="mt-2 text-base leading-relaxed text-land-ink/60">
              A topic, a template, or an empty project. A topic already lays
              the slides out in order.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-medium tracking-tight text-land-ink">
              Nothing is locked
            </h3>
            <p className="mt-2 text-base leading-relaxed text-land-ink/60">
              Rewrite a line, swap the cover, move a slide. The project stays
              the same one.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-medium tracking-tight text-land-ink">
              You leave with the post
            </h3>
            <p className="mt-2 text-base leading-relaxed text-land-ink/60">
              A PNG of one slide, or a ZIP of the carousel. No watermark on
              the file.
            </p>
          </li>
        </ul>
      </LandingSection>

      <LandingSection>
        <div className="grid items-center gap-8 rounded-[1.75rem] bg-land-card p-6 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div>
            <h2 className={sectionTitle}>
              One project holds the carousel
            </h2>
            <p className={`mt-4 ${landSub}`}>
              The topic, the slides, the edits, and the download live together.
              You take the file when the carousel is finished.
            </p>
            <a
              href="/studio"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-land-mist px-5 text-sm font-semibold text-land-ink"
            >
              Open studio
            </a>
          </div>
          <Place className="min-h-64 rounded-2xl" />
        </div>
      </LandingSection>

      <LandingSection>
        <div className="rounded-[1.75rem] bg-land-panel px-6 py-10 text-white sm:px-10 sm:py-14">
          <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl sm:leading-[1.08]">
            Direct edits, then a plain file
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Cover, type, and order are the work. The studio does not hand you
            a separate file to rebuild.
          </p>
          <div className="mt-10 grid items-center gap-6 rounded-[1.5rem] bg-white/5 p-4 sm:grid-cols-2 sm:p-6">
            <Place className="min-h-56 rounded-2xl" />
            <div>
              <p className="text-sm font-medium text-white/50">On the slide</p>
              <h3 className="mt-2 text-3xl font-medium tracking-tight">
                Cover, type, and order
              </h3>
              <p className="mt-3 text-base leading-relaxed text-white/70">
                Change the words, replace the picture, and move the sequence
                without starting over.
              </p>
            </div>
          </div>
          <div className="mt-4 grid items-center gap-6 rounded-[1.5rem] bg-white/5 p-4 sm:grid-cols-2 sm:p-6">
            <div className="sm:order-2">
              <Place className="min-h-56 rounded-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/50">On the way out</p>
              <h3 className="mt-2 text-3xl font-medium tracking-tight">
                A file with nothing extra
              </h3>
              <p className="mt-3 text-base leading-relaxed text-white/70">
                PNG or ZIP. No logo on the slides. The project stays in your
                account.
              </p>
            </div>
          </div>
        </div>
      </LandingSection>

      <LandingSection id="make">
        <h2 className={sectionTitle}>Posts with a job to do</h2>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            ["Launch", "The offer, the proof, then the next step."],
            ["How-to", "One step on each slide, and the result at the end."],
            ["Checklist", "Short lines people can save and come back to."],
          ].map(([title, text]) => (
            <li
              key={title}
              className="overflow-hidden rounded-[1.75rem] bg-land-card"
            >
              <Place className="h-52 w-full" />
              <div className="p-6">
                <h3 className="text-2xl font-medium tracking-tight text-land-ink">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                  {text}
                </p>
                <a
                  href="/studio"
                  className="mt-6 inline-flex h-10 items-center rounded-full bg-land-mist px-4 text-sm font-semibold text-land-ink"
                >
                  Open studio
                </a>
              </div>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
          <div>
            <h2 className={sectionTitle}>Same structure, next subject</h2>
            <a
              href="/studio"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-land-ink px-5 text-sm font-semibold text-land-mist"
            >
              Open studio
            </a>
          </div>
          <Accordion type="single" collapsible defaultValue="story">
            {SHAPES.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-land-ink/10"
              >
                <AccordionTrigger className="py-5 text-left text-xl font-medium text-land-ink hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid items-center gap-4 pb-2 sm:grid-cols-[7rem_1fr]">
                    <Place className="h-24 rounded-2xl" />
                    <p className="text-base leading-relaxed text-land-ink/60">
                      {item.text}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </LandingSection>

      <LandingSection id="reviews">
        <h2 className={sectionTitle}>Carousels from the studio</h2>
        <ul className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {POSTS.map((src) => (
            <li
              key={src}
              className="w-56 shrink-0 overflow-hidden rounded-[1.75rem] bg-land-card sm:w-64"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="pricing">
        <h2 className={sectionTitle}>Price</h2>
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          <li className="flex flex-col rounded-[1.75rem] bg-white p-6 text-land-ink dark:bg-[#2a2c38] sm:p-8">
            <p className="text-sm font-medium text-land-ink/50">Free</p>
            <p className="mt-3 flex items-baseline gap-2 text-land-ink">
              <span className="text-5xl font-medium tracking-tight">0</span>
              <span className="text-lg">Br</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-base text-land-ink/75">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-land-blue" strokeWidth={2.5} />
                {FREE_CAROUSEL_LIMIT} editable carousels
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-land-blue" strokeWidth={2.5} />
                Generation from a topic
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-land-blue" strokeWidth={2.5} />
                Edit the slides, then download
              </li>
            </ul>
            <a
              href="/studio"
              className="mt-8 inline-flex h-11 items-center justify-center self-stretch rounded-full bg-[#14151c] px-5 text-sm font-semibold text-white dark:bg-white dark:text-[#14151c]"
            >
              Open studio
            </a>
          </li>
          <li className="flex flex-col rounded-[1.75rem] bg-land-ink p-6 text-land-mist sm:p-8">
            <p className="text-sm font-medium text-land-mist/60">Pro</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-medium tracking-tight">
                {STUDIO_PRO_PRICE}
              </span>
              <span className="text-lg">Br / month</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-base text-land-mist/80">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
                Cancel any time
              </li>
            </ul>
            <a
              href="/studio"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-land-mist px-5 text-sm font-semibold text-land-ink"
            >
              Open studio
            </a>
          </li>
        </ul>

        <h2 id="generate" className={`${sectionTitle} mt-16 scroll-mt-28 sm:mt-20`}>
          AI generation
        </h2>
        <p className={`mt-4 max-w-xl ${landSub}`}>
          A topic goes in. Ordered slides come back. You change them before
          the file leaves.
        </p>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            ["01", "The topic", "One sentence about the post. The language follows the words you type."],
            ["02", "The slides", "Four to ten frames, in order, at the ratio of a feed."],
            ["03", "The file", "Rewrite a line, swap the cover, move a slide. Download PNG or ZIP."],
          ].map(([step, title, text]) => (
            <li
              key={title}
              className="flex min-h-56 flex-col rounded-[1.75rem] bg-white p-6 dark:bg-[#2a2c38] sm:p-8"
            >
              <p className="text-sm font-medium text-land-blue">{step}</p>
              <h3 className="mt-6 text-2xl font-medium tracking-tight text-land-ink">
                {title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                {text}
              </p>
            </li>
          ))}
        </ul>
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

      <footer className="bg-[#0e0f12] text-white">
        <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:pt-20 lg:px-[120px]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
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
              <p className="text-sm font-semibold">Details</p>
              <ul className="mt-4 space-y-3 text-sm text-white/65">
                <li>{LEGAL.status}</li>
                <li>{LEGAL.country}</li>
                <li className="text-white/90">{LEGAL.fullName}</li>
                <li className="tabular-nums">Tax ID {LEGAL.unp}</li>
                <li>
                  <a
                    href={`mailto:${LEGAL.email}`}
                    className="hover:text-white"
                  >
                    {LEGAL.email}
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
            <a href={`mailto:${LEGAL.email}`} className="hover:text-white">
              {LEGAL.email}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
