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
  { name: "Studio", link: "#studio" },
  { name: "Why", link: "#why" },
  { name: "Examples", link: "#reviews" },
  { name: "Price", link: "#pricing" },
  { name: "Questions", link: "#faq" },
];

const REASONS = [
  {
    title: "One post",
    text: "Slides are already in feed order and in the right ratio. You don’t slice them out of a layout after export.",
  },
  {
    title: "Start from a topic",
    text: "A topic or a template sets the structure. You edit the words, the cover, and the order.",
  },
  {
    title: "A file you can post",
    text: "A PNG of one slide, or a ZIP of the carousel. No Deckva logo, and no second editor.",
  },
] as const;

const FAQ = [
  {
    value: "why",
    q: "Why not build the slides in another editor?",
    a: "There, a carousel is several separate layouts. Here the post is the slides: ratio, order, and a file to publish, in one project.",
  },
  {
    value: "output",
    q: "What do I download?",
    a: "A PNG of one slide, or a ZIP of the whole carousel. No watermark, so you can publish the file.",
  },
  {
    value: "start",
    q: "Where does a post start?",
    a: "A topic, a template, or a blank canvas. A topic gives you the slide structure. Then you edit the text, the cover, and the order.",
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
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-16 sm:px-6 sm:pt-[calc(6rem+env(safe-area-inset-top))] sm:pb-20 lg:grid-cols-2 lg:gap-12 lg:pb-24">
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight leading-[1.05] sm:text-5xl">
              One carousel, not a folder
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
              A topic becomes the slides. Edit the words and the order here,
              then download a file you can post.
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
                See how it works
              </a>
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      <LandingSection
        id="studio"
        className="relative z-20 -mt-8 py-0 sm:-mt-12 sm:py-0"
      >
        <div className="overflow-hidden rounded-3xl bg-land-card">
          <StudioVideo />
        </div>
      </LandingSection>

      <LandingSection id="why">
        <Reveal>
          <h2 className={`${landTitle} text-land-ink`}>Why this</h2>
          <p className={`mt-3 max-w-lg ${landSub}`}>
            A carousel should be one post, not a folder of layouts.
          </p>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {REASONS.map((reason) => (
              <li key={reason.title}>
                <h3 className="text-lg font-semibold tracking-tight text-land-ink">
                  {reason.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-land-ink/60">
                  {reason.text}
                </p>
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
          <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
            <p className="text-5xl font-semibold tracking-tight text-land-ink">
              15
              <span className="ml-2 text-xl font-medium text-land-ink/45">
                Br
              </span>
            </p>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-land-ink">
                A month, instead of building the feed by hand
              </h2>
              <p className="mt-2 max-w-md text-base leading-relaxed text-land-ink/55">
                Edits stay in the same project. Export has no watermark.
                Cancel any time.
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
              One carousel: the slides, the edits, and a file you can post.
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
