"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { Check, ChevronRight, Menu, X } from "lucide-react";
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
import { HeroStage } from "@/components/landing/hero-stage";
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

const MENU_GROUPS = [
  {
    title: "Product",
    links: [
      { name: "See it", href: "#studio" },
      { name: "The post", href: "#post" },
      { name: "Examples", href: "#reviews" },
    ],
  },
  {
    title: "Make",
    links: [
      { name: "Starting lines", href: "#start" },
      { name: "The example", href: "#post" },
      { name: "Shapes", href: "#make" },
      { name: "Ratios", href: "#ratios" },
      { name: "Figma", href: "#figma" },
      { name: "The picture", href: "#picture" },
      { name: "AI generation", href: "#generate" },
    ],
  },
] as const;

const MENU_LINKS = [
  { name: "Price", href: "#pricing" },
  { name: "Questions", href: "#faq" },
] as const;

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
  {
    label: "Offer",
    line: "An offer in five slides: the problem, the thing, the proof, the price, and the next step.",
  },
  {
    label: "Review",
    line: "A review of one product: what it is, who it fits, and whether to buy it.",
  },
  {
    label: "Announcement",
    line: "An announcement: what changed, who it is for, and when it starts.",
  },
] as const;

const JOBS = [
  ["Launch", "The offer, the proof, then the next step."],
  ["How-to", "One step on each slide, and the result at the end."],
  ["Checklist", "Short lines people can save and come back to."],
  ["Offer", "The problem, the thing, the price, and where to go."],
  ["Review", "What it is, who it fits, and a clear yes or no."],
  ["Announcement", "What changed, who it reaches, and when it starts."],
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
  {
    value: "offer",
    title: "Offer",
    text: "A problem, a thing, a proof, and a place to go next.",
  },
  {
    value: "quote",
    title: "A quote",
    text: "One line large, then who said it, then why it matters.",
  },
  {
    value: "list",
    title: "A list",
    text: "Numbered points. Each slide is one item, nothing else.",
  },
  {
    value: "faq",
    title: "Questions",
    text: "A question on one slide, the answer on the next.",
  },
] as const;

const RATIOS = [
  { label: "4:5", frame: "aspect-[4/5] w-full" },
  { label: "1:1", frame: "aspect-square w-full" },
  { label: "9:16", frame: "aspect-[9/16] w-full" },
  { label: "16:9", frame: "aspect-video w-full" },
] as const;

function Place({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`bg-[#c8c8c8] dark:bg-[#4a4a4a] ${className ?? ""}`}
    />
  );
}

const POSTS = [
  "/reviews/1.jpg",
  "/reviews/2.jpg",
  "/reviews/3.jpg",
  "/reviews/4.jpg",
  "/reviews/5.jpg",
  "/reviews/6.jpg",
] as const;

const EXAMPLE_LINE =
  "A launch in six slides: the offer, who it is for, the proof, and what to do next.";

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
    a: `The first ${FREE_CAROUSEL_LIMIT} carousels are free. After that, Pro is ${STUDIO_PRO_PRICE} Br a month. Cancel any time. Access stays until the end of the paid period.`,
  },
  {
    value: "where",
    q: "Where do I use it?",
    a: "In the browser, on a computer or a phone.",
  },
  {
    value: "figma-in",
    q: "Can I import from Figma?",
    a: "Yes. Bring a frame onto the slide. The picture, the type, and the order stay editable in the same project.",
  },
  {
    value: "figma-out",
    q: "Can I export back to Figma?",
    a: "Yes. Send the carousel back, or download a PNG of one slide and a ZIP of the set. The file has no watermark.",
  },
  {
    value: "background",
    q: "What does Remove background do?",
    a: "Select a picture. The subject stays, and the backdrop goes. The slide itself does not change.",
  },
  {
    value: "magic",
    q: "What is Magic layer?",
    a: "It splits one picture into layers you can move, like separate pieces on the same slide.",
  },
  {
    value: "upscale",
    q: "How far can I upscale?",
    a: "2×, 3×, or 4×. The sharper image stays on the slide.",
  },
  {
    value: "ratios",
    q: "Which frame sizes are there?",
    a: "4:5 for a feed, 1:1 for a square, 9:16 for a story, and 16:9 for a wide frame. The sequence stays one project.",
  },
  {
    value: "count",
    q: "How many slides does a topic make?",
    a: "From four to ten, in order. You can add, delete, and move slides after that.",
  },
  {
    value: "language",
    q: "What language are the slides?",
    a: "The language follows the words you type. A Russian sentence comes back in Russian. An English sentence comes back in English.",
  },
  {
    value: "template",
    q: "Can I start from a template?",
    a: "Yes. A template, a topic, or an empty project. A topic already lays the slides out. A template gives you a shape to fill.",
  },
  {
    value: "pro",
    q: "What is on Pro that is not free?",
    a: `Unlimited private carousels, high-resolution exports, folders and brand kits, and priority support. The first ${FREE_CAROUSEL_LIMIT} carousels stay free.`,
  },
  {
    value: "cancel",
    q: "What happens if I cancel?",
    a: "Pro stops renewing. Access stays until the end of the paid period. The projects stay in your account.",
  },
  {
    value: "edit",
    q: "Can I change a generated carousel?",
    a: "Yes. Rewrite a line, swap the cover, move a slide, or run Remove background, Magic layer, and Upscale on a picture.",
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
      { name: "The example", href: "#post" },
      { name: "Shapes", href: "#make" },
      { name: "Ratios", href: "#ratios" },
      { name: "Figma", href: "#figma" },
      { name: "The picture", href: "#picture" },
      { name: "AI generation", href: "#generate" },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(0);
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const activePrompt = PROMPTS[prompt];
  const reduceMotion = useReducedMotion();
  const rise = {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="relative bg-land-mist">
      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />

      <header className="fixed inset-x-0 top-0 z-[70] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 rounded-full border border-white/50 bg-white/70 px-2 py-1.5 text-land-ink backdrop-blur-xl dark:border-white/10 dark:bg-[#14151c]/70 sm:gap-3 sm:px-3">
          <div className="flex min-w-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-land-ink hover:bg-land-ink/10 hover:text-land-ink lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu />
            </Button>
            <Logo width={32} height={32} className="text-land-ink" />
            <nav className="ml-5 hidden items-center gap-5 text-sm font-medium text-land-ink/75 lg:flex">
              {NAV.map((item) => (
                <a key={item.link} href={item.link} className="hover:text-land-ink">
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeSwitcher className="h-10 w-10 text-land-ink hover:bg-land-ink/10 hover:text-land-ink" />
            {signedIn ? (
              <a
                href="/studio"
                className="hidden px-2 text-sm font-medium text-land-ink/80 hover:text-land-ink sm:inline"
              >
                Projects
              </a>
            ) : (
              <button
                type="button"
                className="hidden px-2 text-sm font-medium text-land-ink/80 hover:text-land-ink sm:inline"
                onClick={() => setAuthOpen(true)}
              >
                Sign in
              </button>
            )}
            <Button
              asChild
              className="h-10 rounded-full bg-land-ink px-4 text-land-mist hover:bg-land-ink/90"
            >
              <a href="/studio">Open studio</a>
            </Button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-3 z-[65] top-[calc(4.75rem+env(safe-area-inset-top))] max-h-[min(36rem,calc(100dvh-6.5rem))] overflow-auto rounded-[1.75rem] bg-white p-5 text-[#14151c] lg:hidden dark:bg-[#1c1d26] dark:text-[#eef0f6]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-[0.16em] text-black/40 uppercase dark:text-white/40">
                Menu
              </p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl bg-[#f0f1f4] text-[#14151c] dark:bg-white/10 dark:text-[#eef0f6]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4">
              {MENU_GROUPS.map((group) => {
                const open = openGroup === group.title;
                return (
                  <div
                    key={group.title}
                    className="border-b border-black/10 dark:border-white/10"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-4 text-left text-base font-medium"
                      aria-expanded={open}
                      onClick={() => setOpenGroup(open ? null : group.title)}
                    >
                      {group.title}
                      <ChevronRight
                        className={`size-4 transition-transform ${open ? "rotate-90" : ""}`}
                      />
                    </button>
                    {open ? (
                      <ul className="pb-3">
                        {group.links.map((item) => (
                          <li key={item.href}>
                            <a
                              href={item.href}
                              className="block py-2 text-sm text-black/60 dark:text-white/60"
                              onClick={() => setMenuOpen(false)}
                            >
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              {MENU_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block border-b border-black/10 py-4 text-base font-medium dark:border-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
            {signedIn ? (
              <a
                href="/studio"
                className="mt-6 block text-center text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Projects
              </a>
            ) : (
              <button
                type="button"
                className="mt-6 block w-full text-center text-base font-medium"
                onClick={() => {
                  setMenuOpen(false);
                  setAuthOpen(true);
                }}
              >
                Sign in
              </button>
            )}
            <a
              href="/studio"
              className="mt-4 flex h-12 items-center justify-center rounded-2xl border border-black/15 text-sm font-semibold dark:border-white/20"
            >
              Open studio
            </a>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden bg-land-blue text-white">
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-4 pt-[calc(7.25rem+env(safe-area-inset-top))] pb-16 sm:px-6 sm:pt-[calc(8rem+env(safe-area-inset-top))] sm:pb-20 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-16 lg:pb-24">
          <motion.div
            className="flex w-full max-w-xl flex-col items-start text-left lg:w-[28rem] lg:shrink-0"
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: reduceMotion ? 0 : 0.12,
                  delayChildren: reduceMotion ? 0 : 0.05,
                },
              },
            }}
          >
            <motion.h1
              variants={rise}
              className="max-w-[14ch] text-5xl font-semibold tracking-tight leading-[0.96] sm:text-6xl lg:text-7xl"
            >
              Your post, from one line
            </motion.h1>
            <motion.p
              variants={rise}
              className="mt-6 max-w-md text-xl leading-snug text-white/80"
            >
              Name what it is about. The slides arrive in order, ready to edit and download.
            </motion.p>
            <motion.div
              variants={rise}
              className="mt-8 flex flex-wrap items-center justify-start gap-x-5 gap-y-3"
            >
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
            </motion.div>
          </motion.div>
          <motion.div
            className="w-full max-w-[28rem] sm:max-w-[36rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <HeroStage />
          </motion.div>
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
              href={`/studio?topic=${encodeURIComponent(activePrompt.line)}`}
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
        <p className="text-sm font-medium text-land-ink/50">
          For a coach, a small brand, or anyone posting from one sentence.
        </p>
        <h2 className={`${sectionTitle} mt-3`}>From this line</h2>
        <p className="mt-6 max-w-3xl text-2xl font-medium tracking-tight text-land-ink sm:text-3xl">
          {EXAMPLE_LINE}
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {POSTS.slice(0, 4).map((src, index) => (
            <li
              key={src}
              className="overflow-hidden rounded-[1.75rem] bg-land-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Slide ${index + 1} from the example carousel`}
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className={`max-w-xl ${landSub}`}>
            The file is a PNG of one slide, or a ZIP of the carousel. No watermark.
          </p>
          <a
            href={`/studio?topic=${encodeURIComponent(EXAMPLE_LINE)}`}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-land-ink px-5 text-sm font-semibold text-land-mist"
          >
            Open studio with this line
          </a>
        </div>
      </LandingSection>

      <LandingSection>
        <h2 className={sectionTitle}>Sequence is the first draft</h2>
        <p className={`mt-4 max-w-2xl ${landSub}`}>
          You name the subject. The studio returns a carousel in the ratio of
          a feed. Then you change the words, the cover, and the sequence until
          the post is yours.
        </p>
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
            <h2 className={sectionTitle}>One project holds the carousel</h2>
            <p className={`mt-4 ${landSub}`}>
              The topic, the slides, the edits, and the download live together.
              You take the file when the carousel is finished.
            </p>
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
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOBS.map(([title, text]) => (
            <li
              key={title}
              className="overflow-hidden rounded-[1.75rem] bg-land-card"
            >
              <Place className="h-40 w-full sm:h-52" />
              <div className="p-6">
                <h3 className="text-2xl font-medium tracking-tight text-land-ink">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="ratios">
        <h2 className={sectionTitle}>The same post, four frames</h2>
        <p className={`mt-4 max-w-xl ${landSub}`}>
          A feed, a square, a story, and a wide frame. The sequence stays one project.
        </p>
        <ul className="mt-8 grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
          {RATIOS.map((item) => (
            <li key={item.label}>
              <Place className={`${item.frame} rounded-[1.75rem]`} />
              <p className="mt-3 text-sm font-medium text-land-ink/60">{item.label}</p>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
          <div>
            <h2 className={sectionTitle}>Same structure, next subject</h2>
            <p className={`mt-4 ${landSub}`}>
              Eight ways to shape the same carousel. Pick one, then change the subject.
            </p>
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

      <LandingSection id="figma">
        <h2 className={sectionTitle}>From Figma, and back</h2>
        <p className={`mt-4 max-w-xl ${landSub}`}>
          A frame comes into the slide. The finished carousel can leave again.
        </p>
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          <li className="overflow-hidden rounded-[1.75rem] bg-land-card">
            <Place className="h-52 w-full" />
            <div className="p-6">
              <h3 className="text-2xl font-medium tracking-tight text-land-ink">
                Import
              </h3>
              <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                Bring a frame from Figma onto the slide. The picture, the type, and the order stay editable.
              </p>
            </div>
          </li>
          <li className="overflow-hidden rounded-[1.75rem] bg-land-card">
            <Place className="h-52 w-full" />
            <div className="p-6">
              <h3 className="text-2xl font-medium tracking-tight text-land-ink">
                Export
              </h3>
              <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                Send the carousel back to Figma, or take a PNG of one slide and a ZIP of the set.
              </p>
            </div>
          </li>
        </ul>
      </LandingSection>

      <LandingSection id="picture">
        <h2 className={sectionTitle}>On the picture</h2>
        <p className={`mt-4 max-w-xl ${landSub}`}>
          Three tools on a selected image. The slide stays the same project.
        </p>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            ["Remove background", "The subject stays. The backdrop goes."],
            ["Magic layer", "One picture splits into layers you can move."],
            ["Upscale", "2×, 3×, or 4×. The sharper image stays on the slide."],
          ].map(([title, text]) => (
            <li
              key={title}
              className="overflow-hidden rounded-[1.75rem] bg-land-card"
            >
              <Place className="h-40 w-full sm:h-52" />
              <div className="p-6">
                <h3 className="text-2xl font-medium tracking-tight text-land-ink">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-land-ink/60">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
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
              Start free
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
        <p className={`mt-6 max-w-xl ${landSub}`}>
          The first {FREE_CAROUSEL_LIMIT} carousels are free. The next one is Pro, {STUDIO_PRO_PRICE} Br a month.
        </p>

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

      <LeaveReviewBlock />

      <LandingSection id="faq">
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
