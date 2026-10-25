"use client";

import {
  Download,
  Layers,
  LayoutTemplate,
  Sparkles,
  Type,
} from "lucide-react";

import { PhoneFrame, THREAD_SHOTS } from "@/components/landing/hero-stage";
import {
  DEMO_THREADS_POSTS,
  ThreadsUI,
  type ThreadsPostData,
} from "@/components/landing/threads-ui";

const SAMPLE_SLIDES = THREAD_SHOTS;

const ICON_SET = [
  "/icons/Rocket_perspective_matte-1.png",
  "/icons/Chart_perspective_matte-1.png",
  "/icons/Pencil_perspective_matte-1.png",
  "/icons/Flash_perspective_matte-1.png",
  "/icons/Message_perspective_matte-1.png",
  "/icons/Trophy_perspective_matte-1.png",
  "/icons/Cursor_perspective_matte-1.png",
  "/icons/Image_perspective_matte-1.png",
] as const;

/** Phone with a live Threads UI post (pass `posts` to customize). */
export function PhoneCarouselMock({
  start = 0,
  className,
  posts,
  compact = true,
}: {
  start?: number;
  className?: string;
  posts?: ThreadsPostData[];
  compact?: boolean;
}) {
  const feed =
    posts ??
    [DEMO_THREADS_POSTS[start % DEMO_THREADS_POSTS.length]].filter(Boolean);

  return (
    <PhoneFrame
      className={
        className ??
        "h-[380px] w-[200px] border-[6px] sm:h-[420px] sm:w-[210px]"
      }
    >
      <ThreadsUI posts={feed} compact={compact} showReplyBar={false} showTabBar={false} />
    </PhoneFrame>
  );
}

/** Two phones layered for CTA — bleed out of the stage. */
export function DualPhonesMock() {
  return (
    <div className="relative mx-auto h-[280px] w-full max-w-[340px] sm:h-[360px] sm:max-w-[400px]">
      <div className="absolute bottom-[-48px] left-0 z-0 origin-bottom -rotate-[9deg] sm:bottom-[-72px]">
        <PhoneCarouselMock
          start={0}
          className="h-[320px] w-[160px] border-[5px] shadow-none sm:h-[400px] sm:w-[200px] sm:border-[6px]"
        />
      </div>
      <div className="absolute bottom-[-56px] right-0 z-10 origin-bottom rotate-[5deg] sm:bottom-[-80px]">
        <PhoneCarouselMock
          start={1}
          className="h-[340px] w-[170px] border-[5px] shadow-xl sm:h-[420px] sm:w-[210px] sm:border-[6px]"
        />
      </div>
    </div>
  );
}

/** Minimal wireframe storyboard — no photos, no color. */
export function StoryboardMock() {
  return (
    <div className="flex w-full max-w-sm items-end gap-2">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="flex flex-1 flex-col items-center gap-1.5"
        >
          <div className="aspect-[4/5] w-full rounded-lg bg-muted/5" />
          <span className="text-[10px] font-semibold tracking-wide text-[#14151c]/45">
            {String(n).padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Compact editor shell: rail + canvas + inspector. */
export function EditorMock() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[1.2rem] bg-[#1a1b22] shadow-[0_20px_50px_rgba(28,32,58,0.22)]">
      <div className="flex items-center justify-between border-b border-white/10 px-2.5 py-1.5">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-[#ff5f57]" />
          <span className="size-1.5 rounded-full bg-[#febc2e]" />
          <span className="size-1.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[9px] font-semibold tracking-wide text-white/45">
          STUDIO
        </span>
        <span className="rounded-full bg-[#2f5bff] px-2 py-0.5 text-[9px] font-semibold text-white">
          Export
        </span>
      </div>
      <div className="grid grid-cols-[36px_1fr_72px]">
        <aside className="flex flex-col items-center gap-2.5 border-r border-white/10 py-2.5 text-white/50">
          <Sparkles className="size-3.5 text-[#2f5bff]" />
          <LayoutTemplate className="size-3.5" />
          <Layers className="size-3.5" />
          <Type className="size-3.5" />
        </aside>
        <div className="bg-[#12131a] p-3">
          <div className="relative mx-auto aspect-[4/5] max-h-[150px] overflow-hidden rounded-lg bg-[#2a2b34]">
            <img
              src={THREAD_SHOTS[2]}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-[16%] rounded border border-[#2f5bff]" />
          </div>
          <div className="mt-2 flex justify-center gap-1">
            {SAMPLE_SLIDES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`h-6 w-5 rounded object-cover ${i === 2 ? "ring-1 ring-[#2f5bff]" : "opacity-55"}`}
              />
            ))}
          </div>
        </div>
        <aside className="space-y-1.5 border-l border-white/10 p-2">
          <div className="rounded-md bg-white/5 p-1.5">
            <p className="text-[8px] font-semibold text-white/35">Text</p>
            <div className="mt-1 h-1 rounded-full bg-white/15" />
            <div className="mt-0.5 h-1 w-2/3 rounded-full bg-white/10" />
          </div>
          <div className="rounded-md bg-white/5 p-1.5">
            <p className="text-[8px] font-semibold text-white/35">Fill</p>
            <div className="mt-1 flex gap-0.5">
              <span className="size-2.5 rounded-full bg-[#2f5bff]" />
              <span className="size-2.5 rounded-full bg-white/40" />
              <span className="size-2.5 rounded-full bg-white/20" />
            </div>
          </div>
          <div className="rounded-md bg-white/5 p-1.5">
            <p className="text-[8px] font-semibold text-white/35">Layers</p>
            <div className="mt-1 space-y-0.5">
              <div className="h-1 rounded-full bg-white/20" />
              <div className="h-1 w-4/5 rounded-full bg-white/10" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const ICON_LABELS = [
  "Rocket",
  "Chart",
  "Pencil",
  "Flash",
  "Message",
  "Trophy",
  "Cursor",
  "Image",
] as const;

const ICON_TAGS = ["Business", "Social", "UI", "3D", "Arrows"];

/** Polished icon library preview — flat, no nested cards. */
export function IconsShowcase() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[12rem] flex-1 items-center gap-2 rounded-full bg-[#14151c]/[0.06] px-4 text-[13px] text-[#5c6170]">
          <svg
            viewBox="0 0 24 24"
            className="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Search icons…
        </div>
        {ICON_TAGS.map((tag) => (
          <span
            key={tag}
            className="hidden h-10 items-center rounded-full px-3.5 text-[13px] font-semibold text-[#3a4f9a] sm:inline-flex"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-4">
        {ICON_SET.map((src, index) => (
          <div key={src} className="group text-center">
            <div className="grid aspect-square place-items-center rounded-[1.25rem] bg-[#14151c]/[0.05] transition-colors group-hover:bg-[#14151c]/[0.09]">
              <img
                src={src}
                alt=""
                className="size-10 object-contain sm:size-12"
              />
            </div>
            <p className="mt-2 text-[11px] font-medium text-[#5c6170]">
              {ICON_LABELS[index]}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-[13px] font-semibold tracking-wide text-[#3a4f9a]/80">
        14,000,000+ icons · drop onto the canvas in one click
      </p>
    </div>
  );
}

/** Two template previews — flat images. */
export function TemplatesPair() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SAMPLE_SLIDES.slice(0, 2).map((src, index) => (
        <figure key={src} className="min-w-0">
          <img
            src={src}
            alt=""
            className="aspect-[4/5] w-full rounded-[1.25rem] object-cover"
          />
          <figcaption className="mt-2 text-[13px] font-semibold text-[#5c6170]">
            {index === 0 ? "Cover" : "Ending"}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Prompt content without a nested white card. */
export function PromptInline() {
  return (
    <div className="mt-6 max-w-md">
      <p className="text-[13px] leading-relaxed text-[#14151c]/80">
        “Explain a product launch in 6 frames. Calm, for founders.”
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["6 slides", "Night", "Calm tone"].map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-[#14151c]/[0.07] px-3 py-1 text-[13px] font-semibold"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Export rows without a nested white card. */
export function ExportInline() {
  return (
    <ul className="mt-5 space-y-2">
      {[
        ["carousel.zip", "archive"],
        ["01-cover.png", "PNG"],
        ["06-close.png", "PNG"],
      ].map(([name, kind]) => (
        <li
          key={name}
          className="flex items-center justify-between text-[13px] font-semibold"
        >
          <span className="flex items-center gap-2">
            <Download className="size-3.5 text-[#3d6b4f]" />
            {name}
          </span>
          <span className="text-[13px] font-medium text-[#5c6170]">{kind}</span>
        </li>
      ))}
    </ul>
  );
}

/** Export pack mock. */
export function ExportMock() {
  return (
    <div className="w-full max-w-xs rounded-[1.4rem] bg-white p-5 shadow-[0_20px_50px_rgba(28,32,58,0.12)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#e4ebff] text-[#2f5bff]">
          <Download className="size-5" />
        </span>
        <div>
          <p className="text-[13px] font-extrabold">carousel.zip</p>
          <p className="text-[13px] text-[#8b90a0]">6 × PNG · 2×</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {["01-cover.png", "02-mid.png", "03-close.png"].map((name) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-xl bg-[#f4f5f9] px-3 py-2 text-[13px] font-semibold"
          >
            <span>{name}</span>
            <span className="text-[#8b90a0]">PNG</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Minimal layer list — no photos, no color fills. */
export function LayersMock() {
  const rows = ["Background", "Image", "Headline", "CTA"];
  return (
    <div className="mx-auto w-full max-w-[200px] space-y-1.5">
      {rows.map((label, index) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-full bg-muted/5 px-2.5 py-2"
        >
          <span className="grid size-5 place-items-center rounded text-[9px] font-semibold text-[#14151c]/40">
            {rows.length - index}
          </span>
          <span className="text-[13px] font-medium text-[#14151c]/70">{label}</span>
          <Layers className="ml-auto size-3 text-[#14151c]/25" />
        </div>
      ))}
    </div>
  );
}
