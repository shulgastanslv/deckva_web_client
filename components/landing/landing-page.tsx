"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { Check, ChevronRight, Menu, X } from "lucide-react";
import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import Logo from "@/components/logo/logo";
import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FigmaExportArt, FigmaImportArt } from "@/components/landing/figma-miro-art";
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
import { PromptSection } from "./prompt-section";
const LEGAL = {
  status: "Professional income tax payer",
  fullName: "Шульга Станислав",
  email: "hello@deckva.by",
  country: "Republic of Belarus",
} as const;

const NAV = [
  { name: "See it", link: "#studio" },
  { name: "The post", link: "#example" },
  { name: "Examples", link: "#examples" },
  { name: "Price", link: "#pricing" },
  { name: "Questions", link: "#faq" },
];

const MENU_GROUPS = [
  {
    title: "Product",
    links: [
      { name: "See it", href: "#studio" },
      { name: "The post", href: "#example" },
      { name: "Examples", href: "#examples" },
    ],
  },
  {
    title: "Make",
    links: [
      { name: "Starting lines", href: "#start" },
      { name: "The example", href: "#example" },
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

export function SequenceIllustration({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#F6F6F5] border border-black/[0.06] p-6 sm:p-10 select-none ${className}`}
    >
      <svg
        viewBox="0 0 920 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-[380px]"
      >
        <defs>
          {/* Мягкие нейтральные тени */}
          <filter id="shadow-card" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="10" stdDeviation="16" floodColor="#000000" flood-opacity="0.06" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" flood-opacity="0.04" />
          </filter>
          
          <filter id="shadow-float" x="-20%" y="-20%" width="140%" height="150%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#000000" flood-opacity="0.09" />
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" flood-opacity="0.05" />
          </filter>

          {/* Минималистичные фоновые градиенты слайдов */}
          <linearGradient id="art-gradient-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F9ECE2" />
            <stop offset="50%" stopColor="#F4DCD0" />
            <stop offset="100%" stopColor="#DF9475" />
          </linearGradient>

          <linearGradient id="art-gradient-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E9EDEC" />
            <stop offset="100%" stopColor="#CCD6D3" />
          </linearGradient>

          <linearGradient id="art-gradient-3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EDEAE4" />
            <stop offset="100%" stopColor="#D9D2C7" />
          </linearGradient>
        </defs>

        {/* Фоновые маркеры шагов / соединяющая пунктирная линия */}
        <path
          d="M 120 70 L 800 70"
          stroke="#E5E4E2"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Слайд 1 (Cover / Обложка) */}
        <g filter="url(#shadow-card)">
          <rect x="70" y="80" width="190" height="240" rx="18" fill="#FFFFFF" />
          <rect x="70.5" y="80.5" width="189" height="239" rx="17.5" stroke="#EAEAE9" strokeWidth="1" />
          
          {/* Превью арт-блока обложки */}
          <rect x="86" y="96" width="158" height="110" rx="10" fill="url(#art-gradient-1)" />
          
          {/* Абстрактная верстка текста на обложке */}
          <rect x="86" y="222" width="70" height="10" rx="5" fill="#1C1A17" />
          <rect x="86" y="240" width="120" height="6" rx="3" fill="#D3D1CD" />
          <rect x="86" y="252" width="95" height="6" rx="3" fill="#E6E4DF" />
          
          {/* Индикатор номера слайда */}
          <circle cx="94" cy="292" r="7" fill="#F4F3F1" />
          <text x="94" y="295" fontSize="8" fontWeight="600" fill="#7A7874" textAnchor="middle" fontFamily="sans-serif">1</text>
        </g>

        {/* Слайд 2 (Центральный слайд — активный, слегка приподнят) */}
        <g filter="url(#shadow-float)">
          <rect x="290" y="65" width="200" height="255" rx="20" fill="#FFFFFF" />
          <rect x="290.5" y="65.5" width="199" height="254" rx="19.5" stroke="#E5E4E1" strokeWidth="1" />
          
          {/* Превью контента */}
          <rect x="306" y="81" width="168" height="118" rx="12" fill="url(#art-gradient-2)" />
          <circle cx="390" cy="140" r="26" fill="#FFFFFF" fillOpacity="0.4" />
          
          {/* Строки текста */}
          <rect x="306" y="215" width="110" height="10" rx="5" fill="#1C1A17" />
          <rect x="306" y="233" width="148" height="6" rx="3" fill="#CBC8C2" />
          <rect x="306" y="245" width="130" height="6" rx="3" fill="#E5E3DF" />

          {/* Бейдж номера слайда */}
          <rect x="306" y="280" width="46" height="18" rx="9" fill="#F4F3F1" />
          <text x="329" y="292.5" fontSize="9" fontWeight="600" fill="#4B4843" textAnchor="middle" fontFamily="sans-serif">02 / 05</text>
        </g>

        {/* Слайд 3 */}
        <g filter="url(#shadow-card)">
          <rect x="520" y="80" width="190" height="240" rx="18" fill="#FFFFFF" />
          <rect x="520.5" y="80.5" width="189" height="239" rx="17.5" stroke="#EAEAE9" strokeWidth="1" />
          
          <rect x="536" y="96" width="158" height="110" rx="10" fill="url(#art-gradient-3)" />
          <rect x="536" y="222" width="90" height="10" rx="5" fill="#1C1A17" />
          <rect x="536" y="240" width="130" height="6" rx="3" fill="#D3D1CD" />
          <rect x="536" y="252" width="105" height="6" rx="3" fill="#E6E4DF" />
          
          <circle cx="544" cy="292" r="7" fill="#F4F3F1" />
          <text x="544" y="295" fontSize="8" fontWeight="600" fill="#7A7874" textAnchor="middle" fontFamily="sans-serif">3</text>
        </g>

        {/* Слайд 4 (Уходящий в край) */}
        <g filter="url(#shadow-card)" opacity="0.6">
          <rect x="740" y="95" width="160" height="210" rx="16" fill="#FFFFFF" />
          <rect x="740.5" y="95.5" width="159" height="209" rx="15.5" stroke="#ECEBE9" strokeWidth="1" />
          <rect x="754" y="110" width="132" height="95" rx="8" fill="#EFEFEF" />
          <rect x="754" y="220" width="80" height="8" rx="4" fill="#D2CFC9" />
        </g>

        {/* Плавающий UI-элемент слева сверху: генерация темы */}
        <g filter="url(#shadow-float)">
          <rect x="110" y="40" width="176" height="38" rx="19" fill="#FFFFFF" />
          <rect x="110.5" y="40.5" width="175" height="37" rx="18.5" stroke="#ECEBEA" strokeWidth="1" />
          <circle cx="129" cy="59" r="8" fill="#F4F3F0" />
          <path d="M126.5 59h5M129 56.5v5" stroke="#5F5D58" strokeWidth="1.5" strokeLinecap="round" />
          <text x="146" y="63" fontSize="12" fontWeight="500" fill="#1D1B18" fontFamily="sans-serif">Architecture 101</text>
        </g>

        {/* Плавающий UI-элемент справа: экспорт */}
        <g filter="url(#shadow-float)">
          <rect x="635" y="285" width="150" height="42" rx="21" fill="#FFFFFF" />
          <rect x="635.5" y="285.5" width="149" height="41" rx="20.5" stroke="#ECEBEA" strokeWidth="1" />
          
          <rect x="643" y="293" width="26" height="26" rx="13" fill="#1C1A17" />
          <path d="M656 300v9M652.5 305.5l3.5 3.5 3.5-3.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          
          <text x="678" y="310" fontSize="11" fontWeight="600" fill="#1C1A17" fontFamily="sans-serif">Export</text>
          <text x="718" y="310" fontSize="10.5" fontWeight="400" fill="#888580" fontFamily="sans-serif">.zip</text>
        </g>

        {/* Минималистичный курсор перетаскивания (Drag & Drop) */}
        <g transform="translate(485, 175)" filter="url(#shadow-float)">
          <circle cx="16" cy="16" r="16" fill="#1C1A17" />
          <path d="M10 16h12M13 13l-3 3 3 3M19 13l3 3-3 3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { name: "Open studio", href: "/studio" },
      { name: "See it", href: "#studio" },
      { name: "The post", href: "#example" },
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

export function ProjectContainerIllustration({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#F6F6F5] border border-black/[0.06] p-6 sm:p-8 select-none ${className}`}
    >
      <svg
        viewBox="0 0 540 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-[340px]"
      >
        <defs>
          {/* Мягкие нейтральные тени */}
          <filter id="shadow-container" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.05" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.03" />
          </filter>

          <filter id="shadow-elevated" x="-20%" y="-15%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.04" />
          </filter>

          {/* Градиенты для обложек и слайдов */}
          <linearGradient id="proj-gradient-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAF1E8" />
            <stop offset="100%" stopColor="#E4BAA6" />
          </linearGradient>

          <linearGradient id="proj-gradient-thumb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ECEEEA" />
            <stop offset="100%" stopColor="#D2D9D5" />
          </linearGradient>
        </defs>

        {/* 1. Основное окно проекта (Container) */}
        <g filter="url(#shadow-container)">
          <rect x="40" y="35" width="460" height="330" rx="20" fill="#FFFFFF" />
          <rect x="40.5" y="35.5" width="459" height="329" rx="19.5" stroke="#ECEAE7" strokeWidth="1" />

          {/* Верхний бар проекта */}
          <rect x="58" y="55" width="10" height="10" rx="5" fill="#E4E2DC" />
          <rect x="74" y="55" width="10" height="10" rx="5" fill="#E4E2DC" />
          <rect x="90" y="55" width="10" height="10" rx="5" fill="#E4E2DC" />

          {/* Название и статус проекта */}
          <rect x="120" y="56" width="90" height="8" rx="4" fill="#1C1A17" />
          <rect x="424" y="52" width="60" height="16" rx="8" fill="#F4F3F1" />
          <circle cx="433" cy="60" r="3" fill="#1C1A17" />
          <rect x="442" y="57" width="32" height="6" rx="3" fill="#7A7874" />

          <path d="M 40 80 L 500 80" stroke="#F1F0ED" strokeWidth="1" />
        </g>

        {/* 2. Левая панель: Свойства темы и история правок (The topic & edits) */}
        <g>
          {/* Блок темы */}
          <rect x="62" y="98" width="128" height="64" rx="12" fill="#F8F8F7" />
          <rect x="74" y="112" width="40" height="6" rx="3" fill="#999690" />
          <rect x="74" y="126" width="85" height="8" rx="4" fill="#1C1A17" />
          <rect x="74" y="140" width="65" height="6" rx="3" fill="#BFBCB6" />

          {/* Блок версий/правок */}
          <rect x="62" y="172" width="128" height="80" rx="12" fill="#F8F8F7" />
          <rect x="74" y="186" width="55" height="6" rx="3" fill="#999690" />

          <circle cx="78" cy="206" r="3.5" fill="#1C1A17" />
          <rect x="88" y="203" width="70" height="6" rx="3" fill="#4B4843" />

          <circle cx="78" cy="224" r="3.5" fill="#CBC8C2" />
          <rect x="88" y="221" width="55" height="6" rx="3" fill="#999690" />

          <circle cx="78" cy="242" r="3.5" fill="#CBC8C2" />
          <rect x="88" y="239" width="62" height="6" rx="3" fill="#BFBCB6" />
        </g>

        {/* 3. Центр: Стопка слайдов карусели (The slides) */}
        {/* Задний слайд (Slide 3) */}
        <g opacity="0.5">
          <rect x="290" y="110" width="145" height="195" rx="14" fill="#FFFFFF" stroke="#E2E0DC" strokeWidth="1" />
          <rect x="302" y="122" width="121" height="85" rx="8" fill="#ECEAE5" />
        </g>

        {/* Промежуточный слайд (Slide 2) */}
        <g opacity="0.8">
          <rect x="255" y="118" width="145" height="195" rx="14" fill="#FFFFFF" stroke="#E2E0DC" strokeWidth="1" />
          <rect x="267" y="130" width="121" height="85" rx="8" fill="url(#proj-gradient-thumb)" />
        </g>

        {/* Передний активный слайд (Slide 1 / Cover) */}
        <g filter="url(#shadow-elevated)">
          <rect x="215" y="128" width="155" height="205" rx="16" fill="#FFFFFF" />
          <rect x="215.5" y="128.5" width="154" height="204" rx="15.5" stroke="#ECEAE7" strokeWidth="1" />

          {/* Превью арт-обложки */}
          <rect x="227" y="140" width="131" height="96" rx="10" fill="url(#proj-gradient-card)" />

          {/* Строки контента */}
          <rect x="227" y="250" width="80" height="8" rx="4" fill="#1C1A17" />
          <rect x="227" y="266" width="105" height="5" rx="2.5" fill="#D3D1CD" />
          <rect x="227" y="277" width="75" height="5" rx="2.5" fill="#E6E4DF" />

          {/* Бейдж номера слайда */}
          <rect x="227" y="302" width="38" height="15" rx="7.5" fill="#F4F3F1" />
          <text x="246" y="312.5" fontSize="8" fontWeight="600" fill="#66645E" textAnchor="middle" fontFamily="sans-serif">01</text>
        </g>

        {/* 4. Плавающий элемент: Готовый файл (The download / ZIP) */}
        <g filter="url(#shadow-elevated)">
          <rect x="340" y="255" width="140" height="48" rx="24" fill="#1C1A17" />

          {/* Иконка скачивания */}
          <circle cx="364" cy="279" r="13" fill="#2E2C28" />
          <path d="M 364 273 L 364 283 M 360.5 279.5 L 364 283 L 367.5 279.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

          {/* Лейбл файла */}
          <text x="388" y="280" fontSize="11" fontWeight="600" fill="#FFFFFF" fontFamily="sans-serif">carousel.zip</text>
          <text x="388" y="291" fontSize="9" fontWeight="400" fill="#999690" fontFamily="sans-serif">Ready to post</text>
        </g>

        {/* 5. Индикатор связки: аккуратный пинцет/бейджик состояния */}
        <g filter="url(#shadow-container)">
          <rect x="62" y="270" width="128" height="34" rx="17" fill="#FFFFFF" stroke="#EBEAE7" strokeWidth="1" />
          <circle cx="78" cy="287" r="4.5" fill="#34C759" />
          <text x="90" y="291" fontSize="10" fontWeight="500" fill="#3D3B37" fontFamily="sans-serif">Auto-saved</text>
        </g>
      </svg>
    </div>
  );
}

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
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "1") return;
    setAuthOpen(true);
    params.delete("auth");
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  }, []);

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
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 rounded-full border-none bg-white/70 px-2 py-1.5 text-land-ink backdrop-blur-xl dark:border-white/10 dark:bg-[#14151c]/70 sm:gap-3 sm:px-3">
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
              className="max-w-[14ch] text-5xl font-semibold tracking-tight leading-[0.96] sm:text-6xl lg:text-7xl"
            >
              Your post, from one line
            </motion.h1>
            <motion.p
              className="mt-6 max-w-md text-xl leading-snug text-white/80"
            >
              Name what it is about. The slides arrive in order, ready to edit and download.
            </motion.p>
            <motion.div
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
        <PromptSection /> 
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

      <LandingSection id="examples">
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

      <footer className="bg-[#0e0f12] text-white m-10 rounded-2xl">
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
