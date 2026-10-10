"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
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
import { AudienceBlock } from "@/components/landing/audience-block";
import { Reveal } from "@/components/landing/reveal";
import { FreeBlock } from "@/components/landing/free-block";
import { NetworksBlock } from "@/components/landing/networks-block";
import { StudioCapabilities } from "@/components/landing/studio-capabilities";
import { ReviewsBlock } from "@/components/landing/reviews-block";
import {
  ExportArt,
  FeedArt,
  GenerateArt,
  IconsArt,
  PublishArt,
  StudioArt,
  TemplatesArt,
} from "@/components/landing/landing-art";
import { DualPhonesMock } from "@/components/landing/landing-visuals";
import { EditorStage } from "./editor-stage";

const NAV = [
  { name: "Product", link: "#product" },
  { name: "Studio", link: "#studio" },
  { name: "Networks", link: "#networks" },
  { name: "Free", link: "#free" },
  { name: "Reviews", link: "#reviews" },
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

function Layer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.4rem] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl sm:mb-8">
      <p className="text-sm font-bold tracking-wide text-[#2f5bff]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {text ? (
        <p className="mt-3 text-base leading-relaxed text-[#5c6170]">{text}</p>
      ) : null}
    </div>
  );
}

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="relative">
      <FloatingNav navItems={NAV} ctaHref="/studio" ctaLabel="Studio" />
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <section className="relative overflow-hidden bg-[#2f5bff] text-white">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />
        <BackgroundBeams className="opacity-60" />
        <div className="relative z-10 mx-auto mt-4 flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">

          <WhiteLogo width={36} height={36} />

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/85 md:flex">
            {NAV.map((item) => (
              <a key={item.link} href={item.link} className="hover:text-white">
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden h-10 rounded-full px-4 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              onClick={() => setAuthOpen(true)}
            >
              Sign In
            </Button>
            <Button
              asChild
              className="h-10 rounded-full bg-white px-4 text-[#1a2f86] hover:bg-white/90"
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
                  <Button
                    variant="outline"
                    className="mt-3 h-10 rounded-full"
                    onClick={() => setAuthOpen(true)}
                  >
                    Sign in
                  </Button>
                  <Button asChild className="h-10 rounded-full">
                    <Link href="/studio">Open studio</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-6 grid max-w-6xl items-center gap-2 px-4 pt-2 pb-12 sm:mt-10 sm:gap-6 sm:px-6 sm:pt-4 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-5 lg:pb-20">
          <div>
            <h1 className="max-w-xl text-4xl leading-[0.95] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Make carousel
              <br />
              from one idea.
            </h1>
            <TextGenerateEffect
              words="Describe your topic. AI will create the carousel."
              duration={0.35}
              className="text-lg font-medium text-white/90 sm:text-2xl"
              spanClassName="text-white/90"
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              The model itself decides what to put on the cover, why to explain the middle and
              why to finish.               You fix the wording. You do not build every frame from scratch.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-white px-5 text-[#1a2f86] hover:bg-white/90"
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

      <section
        id="product"
        className="relative z-20 mx-auto -mt-8 max-w-6xl scroll-mt-24 px-4 sm:-mt-16 sm:px-6 lg:-mt-20"
      >
        <Reveal>
          <div className="grid gap-3 md:grid-cols-12 md:grid-rows-[auto_auto_auto]">
            <Layer className="bg-[#f4f5f9] p-5 backdrop-blur-xl sm:p-8 md:col-span-7 md:row-span-2 md:min-h-[480px]">
              <p className="text-sm font-bold text-black  ">#Generate</p>
              <h2 className="mt-3 max-w-sm text-3xl font-extrabold tracking-tight sm:text-4xl text-black">
                Topic → carousel
              </h2>
              <p className="mt-3 max-w-xs text-sm text-black">
                Cover, middle, ending — from a couple of sentences.
              </p>
              <div className="mt-6 flex justify-center md:mt-8">
                <GenerateArt />
              </div>
            </Layer>

            <Layer className="bg-[#e4ebff] p-5 sm:p-6 md:col-span-5 md:min-h-[230px]">
              <p className="text-sm font-bold text-[#3a4f9a]">#Feed</p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight">
                A post, not a file
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5c6170]">
                The carousel is already in feed proportions. Cover plus the next frames, not a single square.
              </p>
              <div className="mt-2 flex justify-center">
                <FeedArt />
              </div>
            </Layer>

            <Layer className="bg-[#efe7ff] p-5 sm:p-6 md:col-span-5">
              <p className="text-sm font-bold text-[#6b5f9a]">#Studio</p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight">
                Edit on the canvas
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5c6170]">
                Text, background, and frame order. Generation only opens the carousel. You finish it.
              </p>
              <div className="mt-3">
                <StudioArt />
              </div>
            </Layer>

            <Layer className="bg-[#e5f6ea] p-5 sm:p-6 md:col-span-5">
              <p className="text-sm font-bold text-[#3d6b4f]">#Export</p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight">
                ZIP or PNG
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5c6170]">
                Each slide is its own PNG. The whole carousel downloads as one archive, with no watermark.
              </p>
              <ExportArt />
            </Layer>

            <Layer className="bg-[#ffe4ef] p-5 sm:p-6 md:col-span-7">
              <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-[#9a4f6b]">#Ready</p>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
                    From topic to post
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#5c6170]">
                    The topic becomes frames, the frames download, and they go straight into the post. No blank canvas and no evening of assembly.
                  </p>
                  <Link
                    href="/studio"
                    className="mt-5 inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white"
                  >
                    Open studio
                  </Link>
                </div>
                <PublishArt />
              </div>
            </Layer>
          </div>
        </Reveal>
      </section>


     
      <Reveal>
        <FreeBlock />
      </Reveal>

      <Reveal>
        <ReviewsBlock />
      </Reveal>

      <section id="studio" className="mx-auto max-w-6xl scroll-mt-24 space-y-4 px-4 py-5 sm:px-6">
        <Reveal>
          <Layer className="bg-white">
            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-10">
              <div>
                <p className="text-sm font-bold text-[#6b5f9a]">Studio</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
                  An editor built for the feed
                </h2>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#5c6170]">
                  The canvas is already in post format. Frames sit underneath: cover, middle, ending. Text and layers sit on the right.
                </p>
                <ul className="mt-5 flex flex-col gap-2">
                  {EDITOR_POINTS.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-lg font-semibold">
                      <span className="grid size-6 place-items-center rounded-full bg-[#14151c] text-white">
                        <Check className="size-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/studio"
                  className="mt-6 inline-flex h-11 items-center rounded-full bg-[#14151c] px-5 text-sm font-semibold text-white"
                >
                  Open studio
                </Link>
              </div>
              <EditorStage />
            </div>
          </Layer>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid gap-3 lg:grid-cols-2">
            <Layer className="bg-[#e4ebff] p-7 sm:p-10">
              <p className="text-sm font-bold text-[#3a4f9a]">Icons</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                14 million
              </h2>
              <p className="mt-3 max-w-xs text-sm text-[#5c6170]">
                Search sits next to the canvas. The icon drops onto the slide.
              </p>
              <IconsArt />
            </Layer>

            <Layer className="bg-[#fff4cc] p-7 sm:p-10">
              <p className="text-sm font-bold text-[#8a7a3a]">Templates</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Library of templates
              </h2>
              <p className="mt-3 max-w-xs text-sm text-[#5c6170]">
                Cover and ending stay in rhythm. You change the words.
              </p>
              <TemplatesArt />
            </Layer>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <StudioCapabilities />
        </Reveal>
      </section>

      <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                FAQ
              </h2>
              <p className="mt-3 max-w-xs text-sm text-[#5c6170]">
                Generation, edits, export, and your account — in short.
              </p>
            </div>
            <Accordion type="single" collapsible defaultValue="what">
              {FAQ.map((item) => (
                <AccordionItem
                  key={item.value}
                  value={item.value}
                  className="border-black/10"
                >
                  <AccordionTrigger className="py-4 text-left text-base font-semibold hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#5c6170]">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Reveal>
          <Layer className="bg-[#2f5bff] text-white">
            <div className="relative grid items-end gap-6 px-6 pt-12 sm:px-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="absolute -right-10 top-8 size-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-20 left-[40%] size-28 rounded-full bg-[#9eb6ff]/30 blur-xl" />
              <div className="relative z-10 pb-12 sm:pb-16">
                <h2 className="mt-3 max-w-md text-3xl font-extrabold tracking-tight sm:text-5xl">
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
                    className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#1a2f86]"
                  >
                    Create a carousel
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold"
                  >
                    Sign in
                  </button>
                </div>
              </div>
              <div className="relative z-10 overflow-hidden">
                <div className="absolute inset-x-8 top-5 bottom-0 h-96 rounded-full bg-[#1a3fd6]" />
                <DualPhonesMock />
              </div>
            </div>
          </Layer>
        </Reveal>
      </section>

      <footer>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            swibp.io
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c6170]">
            {NAV.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className="hover:text-[#14151c]"
              >
                {item.name}
              </a>
            ))}
          </nav>
          <p className="text-sm text-[#8b90a0]">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
