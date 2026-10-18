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
  ExportArt,
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

/** Belarus self-employed (НПД) disclosure — replace with your real details. */
const LEGAL = {
  status: "Плательщик налога на профессиональный доход",
  fullName: "Шуляк Станислав",
  unp: "XXXXXXXXX",
  email: "hello@swibp.io",
  country: "Республика Беларусь",
} as const;

const NAV = [
  { name: "Product", link: "#product" },
  { name: "Studio", link: "#studio" },
  { name: "Free", link: "#free" },
  { name: "Reviews", link: "#reviews" },
  { name: "Feedback", link: "#review" },
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
    q: "What is Swibp?",
    a: "A studio for carousels. A topic becomes a sequence of slides, then you edit them on the canvas and export the frames.",
  },
  {
    value: "how-gen",
    q: "How does generation work?",
    a: "You set the topic, slide count, and style. The model spreads the idea across frames and opens the result in the editor — cover, middle, and ending already in place.",
  },
  {
    value: "edit",
    q: "Can I edit after generation?",
    a: "Yes. Change text, photos, icons, backgrounds, and slide order. Generation is the start, not the finished post.",
  },
  {
    value: "vs-canva",
    q: "How is this different from Canva?",
    a: "Canva starts from an empty layout. Swibp first builds the story across frames, then you finish the look in your studio: layers, templates, export.",
  },
  {
    value: "templates",
    q: "Do I need templates?",
    a: "No. Generate from scratch, or take a template as a frame and rewrite it for your topic.",
  },
  {
    value: "export",
    q: "What do I download?",
    a: "Separate PNG or JPEG frames, or a ZIP. Ready to post on Instagram, LinkedIn, Threads, or Telegram.",
  },
  {
    value: "slides",
    q: "How many slides can I make?",
    a: "You pick the length when you generate. In the editor you can add, duplicate, and delete slides.",
  },
  {
    value: "account",
    q: "Do I need an account?",
    a: "Yes, if you want projects saved so you can come back. Drafts stay on the account.",
  },
  {
    value: "lang",
    q: "What language is the text?",
    a: "Write the topic in the language you want on the carousel. The editor is not tied to one language.",
  },
  {
    value: "free",
    q: "Is it actually free?",
    a: "Yes. No subscription: generation, canvas edits, and PNG or ZIP export. Frames have no watermark.",
  },
  {
    value: "who",
    q: "Who is it for?",
    a: "Social teams, founders, editors, marketers — anyone who explains an idea as a carousel, not a single square.",
  },
];

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="relative">
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
              <Button
                asChild
                variant="ghost"
                className="hidden h-10 rounded-full px-4 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <Link href="/studio">Projects</Link>
              </Button>
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
                <span className="sm:hidden">Studio</span>
                <span className="hidden sm:inline">Open a studio</span>
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
                <SheetHeader>
                  <SheetTitle>Swibp</SheetTitle>
                </SheetHeader>
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
                    <Link href="/studio">Open studio</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
          <div>
            <h1 className="max-w-xl text-4xl leading-[0.95] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Make carousel
              <br />
              from one idea.
            </h1>
            <TextGenerateEffect
              words="Describe your topic. AI will create the carousel."
              duration={0.35}
              className="mt-4 text-lg font-medium text-white/90 sm:text-2xl"
              spanClassName="text-white/90"
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              The model itself decides what to put on the cover, what to explain
              in the middle, and how to finish. You fix the wording — you do not
              build every frame from scratch.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-white px-5 text-land-blue hover:bg-white/90"
              >
                <Link href="/studio">Create carousel</Link>
              </Button>
              <a
                href="#product"
                className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10"
              >
                How it works
              </a>
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      <LandingSection
        id="product"
        className="relative z-20 -mt-10 py-0 sm:-mt-14 sm:py-0 lg:-mt-16"
      >
        <Reveal>
          <LandingGrid className="md:grid-cols-12">
            <LandingLayer className="bg-white md:col-span-7 md:row-span-2">
              <LandingPad>
                <p className="text-sm font-bold text-land-blue">#Generate</p>
                <h2 className="mt-2 max-w-sm text-2xl font-extrabold tracking-tight text-land-ink sm:text-3xl">
                  Topic → carousel
                </h2>
                <p className="mt-2 max-w-xs text-sm text-land-ink/55">
                  Cover, middle, ending — from a couple of sentences.
                </p>
                <div className="mt-6 flex justify-center">
                  <GenerateArt />
                </div>
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-white md:col-span-5">
              <LandingPad className="sm:p-7">
                <p className="text-sm font-bold text-land-blue">#Feed</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-land-ink">
                  A post, not a file
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/55">
                  Already in feed proportions — not a single square.
                </p>
                <div className="mt-4 flex justify-center">
                  <FeedArt />
                </div>
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-land-ink text-white md:col-span-5">
              <LandingPad className="sm:p-7">
                <p className="text-sm font-bold text-white/60">#Studio</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight">
                  Edit on the canvas
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">
                  Text, background, and frame order — you finish it.
                </p>
                <div className="mt-4">
                  <StudioArt />
                </div>
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-white w-full md:col-span-7">
              <LandingPad className="sm:p-7">
                <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-bold text-land-blue">#Export</p>
                    <h3 className="mt-2 text-xl font-extrabold tracking-tight text-land-ink sm:text-2xl">
                      ZIP or PNG
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-land-ink/55">
                      Each slide as its own file. The whole set as one archive.
                    </p>
                  </div>
                  <ExportArt />
                </div>
              </LandingPad>
            </LandingLayer>
          </LandingGrid>
        </Reveal>
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
                  <p className="text-sm font-bold text-land-blue">Studio</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-land-ink">
                    An editor built for the feed
                  </h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-land-ink/55">
                    The canvas is already in post format. Frames sit underneath:
                    cover, middle, ending. Text and layers sit on the right.
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
                    Open studio
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
                <p className="text-sm font-bold text-white">Icons</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  14 million
                </h2>
                <p className="mt-3 max-w-xs text-sm text-white/70">
                  Search sits next to the canvas. The icon drops onto the slide.
                </p>
                <IconsArt />
              </LandingPad>
            </LandingLayer>

            <LandingLayer className="bg-land-ink text-white">
              <LandingPad>
                <p className="text-sm font-bold text-white/65">Templates</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Library of templates
                </h2>
                <p className="mt-3 max-w-xs text-sm text-white/75">
                  Cover and ending stay in rhythm. You change the words.
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
                Generation, edits, export, and your account — in short.
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
              <div className="absolute -right-10 top-8 size-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-20 left-[40%] size-28 rounded-full bg-white/15 blur-xl" />
              <div className="relative z-10 pb-4 sm:pb-16">
                <h2 className="max-w-md text-3xl font-extrabold tracking-tight sm:text-5xl">
                  You have the topic.
                  <br />
                  The carousel is next.
                </h2>
                <p className="mt-4 max-w-sm text-sm text-white/75 sm:text-base">
                  Open the studio and build the first feed in one pass.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/studio"
                    className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-land-blue"
                  >
                    Create a carousel
                  </Link>
                  {signedIn ? (
                    <Link
                      href="/studio"
                      className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold"
                    >
                      Projects
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthOpen(true)}
                      className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold"
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </div>
              <div className="relative z-10 -mx-2 overflow-hidden pb-0 sm:mx-0">
                <div className="absolute inset-x-6 top-8 bottom-0 rounded-full bg-land-ink/25 blur-sm" />
                <DualPhonesMock />
              </div>
            </div>
          </LandingLayer>
        </Reveal>
      </LandingSection>

      <footer className="border-t border-land-ink/8 bg-white/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto_1.2fr] lg:items-start">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-land-ink"
            >
              swibp.io
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/45">
              Studio for carousels. Topic to frames to export.
            </p>
            <p className="mt-4 text-sm text-land-ink/45">
              © {new Date().getFullYear()} Swibp
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
