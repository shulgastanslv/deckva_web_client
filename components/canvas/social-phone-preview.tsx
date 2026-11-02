"use client";

import { useRef, type ReactNode } from "react";
import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Search,
  Send,
  Share,
  ThumbsUp,
  User,
  X as XIcon,
} from "lucide-react";
import { FaThreads } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { PhoneFrame } from "@/components/canvas/phone-frame";

export type SocialPreviewNetwork =
  | "instagram"
  | "threads"
  | "tiktok"
  | "stories"
  | "x"
  | "linkedin"
  | "clean";

export const SOCIAL_PREVIEW_NETWORKS: {
  id: SocialPreviewNetwork;
  label: string;
}[] = [
  { id: "instagram", label: "Instagram" },
  { id: "threads", label: "Threads" },
  { id: "tiktok", label: "TikTok" },
  { id: "stories", label: "Stories" },
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "clean", label: "Clean" },
];

type Props = {
  image: string | null;
  loading?: boolean;
  aspectRatio: number;
  slideIndex: number;
  slideTotal: number;
  author?: string;
  onPrev?: () => void;
  onNext?: () => void;
  network: SocialPreviewNetwork;
  className?: string;
};

/** Instagram feed posts sit between 4:5 and ~1.91:1. */
function clampFeedAspect(ratio: number) {
  return Math.min(1.91, Math.max(0.8, ratio || 0.8));
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden className={className}>
      <rect x="0.5" y="2.5" width="3" height="8" rx="0.8" fill="currentColor" />
      <rect x="4.5" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
      <rect x="8.5" y="0" width="3" height="10.5" rx="0.8" fill="currentColor" />
      <rect x="12.5" y="0" width="3" height="10.5" rx="0.8" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden className={className}>
      <path
        d="M7.5 9.6a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"
        fill="currentColor"
      />
      <path
        d="M4.1 6.55a4.8 4.8 0 0 1 6.8 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M1.7 4.2a8.1 8.1 0 0 1 11.6 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden className={className}>
      <rect x="0.5" y="0.5" width="21" height="11" rx="2.2" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="16" height="8" rx="1.2" fill="currentColor" />
      <path d="M23 4v4a1.6 1.6 0 0 0 0-4Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function StatusBar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-white" : "text-neutral-950";
  return (
    <div
      className={cn(
        "relative z-20 flex h-11 shrink-0 items-end justify-between px-[18px] pb-1.5",
        color,
      )}
    >
      <span className="min-w-[52px] text-[14px] font-semibold tracking-[-0.02em]">9:41</span>
      <div className="mb-px flex items-center gap-[6px]">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function HomeIndicator({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className="flex shrink-0 justify-center pb-[6px] pt-1">
      <span
        className={cn(
          "h-[5px] w-[108px] rounded-full",
          tone === "light" ? "bg-white/90" : "bg-neutral-950",
        )}
      />
    </div>
  );
}

function Avatar({
  name,
  size = "md",
  ring,
  follow,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
  follow?: boolean;
}) {
  const dim = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8";
  return (
    <div className={cn("relative shrink-0", dim)}>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-neutral-200",
          dim,
          ring && "ring-2 ring-pink-500 ring-offset-1 ring-offset-white",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/post_logo.jpg" alt="" className="size-full object-cover" />
      </div>
      {follow ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#fe2c55] ring-2 ring-black">
          <Plus className="size-2.5 text-white" strokeWidth={3} />
        </span>
      ) : null}
      <span className="sr-only">{name}</span>
    </div>
  );
}

function SlideImage({
  image,
  loading,
  aspectRatio,
  className,
  fit = "cover",
  badge,
  maxHeight,
}: {
  image: string | null;
  loading?: boolean;
  aspectRatio: number;
  className?: string;
  fit?: "cover" | "contain";
  badge?: string;
  maxHeight?: string;
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-neutral-100", className)}
      style={{ aspectRatio, maxHeight }}
    >
      {loading && !image ? (
        <div className="absolute inset-0 animate-pulse bg-neutral-200" />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          draggable={false}
          className={cn(
            "h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain bg-neutral-50",
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-neutral-400">
          Empty slide
        </div>
      )}
      {badge ? (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function CarouselDots({
  total,
  active,
  tone = "brand",
}: {
  total: number;
  active: number;
  tone?: "brand" | "light" | "dark";
}) {
  const n = Math.min(Math.max(total, 1), 10);
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all",
            i === active ? "h-[6px] w-[6px]" : "h-[5px] w-[5px]",
            i === active
              ? tone === "brand"
                ? "bg-[#0095f6]"
                : tone === "light"
                  ? "bg-white"
                  : "bg-neutral-950"
              : tone === "light"
                ? "bg-white/40"
                : "bg-neutral-300",
          )}
        />
      ))}
    </div>
  );
}

function TabIcon({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span className={cn(active ? "text-neutral-950" : "text-neutral-400")}>{children}</span>
  );
}

function InstagramChrome(props: Props) {
  const { author = "deckva", slideIndex, slideTotal, image, loading } = props;
  const ar = clampFeedAspect(props.aspectRatio);

  return (
    <div className="flex h-full w-full flex-col bg-white text-neutral-950">
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center gap-2.5 px-3">
        <Avatar name={author} size="sm" ring />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-none tracking-tight">
            {author}
          </p>
        </div>
        <MoreHorizontal className="size-5 text-neutral-950" strokeWidth={1.75} />
      </div>

      <SlideImage
        image={image}
        loading={loading}
        aspectRatio={ar}
        maxHeight="52%"
        badge={slideTotal > 1 ? `${slideIndex + 1}/${slideTotal}` : undefined}
        className="shrink-0"
      />

      <div className="relative flex shrink-0 items-center px-3 pt-2.5">
        <div className="flex items-center gap-[14px]">
          <Heart className="size-[24px]" strokeWidth={1.6} />
          <MessageCircle className="size-[24px]" strokeWidth={1.6} />
          <Send className="size-[24px]" strokeWidth={1.6} />
        </div>
        {slideTotal > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <CarouselDots total={slideTotal} active={slideIndex} />
          </div>
        ) : null}
        <Bookmark className="ml-auto size-[24px]" strokeWidth={1.6} />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-hidden px-3 pt-2">
        <p className="text-[13px] font-semibold leading-none">128 likes</p>
        <p className="text-[13px] leading-snug">
          <span className="font-semibold">{author}</span>{" "}
          <span className="text-neutral-800">
            {slideTotal > 1 ? `Slide ${slideIndex + 1} of ${slideTotal}` : "New post"}
          </span>
        </p>
        <p className="text-[13px] text-neutral-500">View all comments</p>
      </div>

      <nav className="flex h-12 shrink-0 items-center justify-around border-t border-neutral-200/80 px-1">
        <TabIcon active>
          <Home className="size-[24px]" strokeWidth={1.6} />
        </TabIcon>
        <TabIcon>
          <Search className="size-[24px]" strokeWidth={1.6} />
        </TabIcon>
        <TabIcon>
          <Plus className="size-[24px]" strokeWidth={1.6} />
        </TabIcon>
        <TabIcon>
          <Heart className="size-[24px]" strokeWidth={1.6} />
        </TabIcon>
        <TabIcon>
          <User className="size-[24px]" strokeWidth={1.6} />
        </TabIcon>
      </nav>
      <HomeIndicator />
    </div>
  );
}

function ThreadsChrome(props: Props) {
  const { author = "deckva", slideIndex, slideTotal, image, loading } = props;
  const ar = clampFeedAspect(props.aspectRatio);

  return (
    <div className="flex h-full w-full flex-col bg-white text-neutral-950">
      <StatusBar />
      <header className="relative flex h-9 shrink-0 items-center justify-center border-b border-neutral-100 px-3">
        <FaThreads className="size-[22px]" aria-label="Threads" />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-[5px]" aria-hidden>
          <span className="h-[1.5px] w-[15px] rounded-full bg-neutral-950" />
          <span className="h-[1.5px] w-[15px] rounded-full bg-neutral-950" />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pt-3">
        <div className="flex gap-2.5">
          <div className="flex flex-col items-center">
            <Avatar name={author} size="md" />
            <span className="mt-2 w-px flex-1 bg-neutral-200" />
          </div>
          <div className="min-w-0 flex-1 pb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="truncate text-[14px] font-semibold tracking-tight">{author}</span>
              <span className="shrink-0 text-[13px] text-neutral-400">2h</span>
            </div>
            <p className="mt-1 text-[14px] leading-[1.3] text-neutral-900">
              {slideTotal > 1
                ? `Carousel preview · ${slideIndex + 1}/${slideTotal}`
                : "Previewing this slide in Threads"}
            </p>
            <div className="mt-2.5 overflow-hidden rounded-[16px] border border-black/[0.08]">
              <SlideImage
                image={image}
                loading={loading}
                aspectRatio={ar}
                badge={slideTotal > 1 ? `${slideIndex + 1}/${slideTotal}` : undefined}
              />
            </div>
            <div className="mt-2.5 flex items-center gap-4 text-neutral-800">
              <Heart className="size-[18px]" strokeWidth={1.75} />
              <MessageCircle className="size-[18px]" strokeWidth={1.75} />
              <Repeat2 className="size-[18px]" strokeWidth={1.75} />
              <Send className="size-[18px]" strokeWidth={1.75} />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex h-[50px] shrink-0 items-center justify-around border-t border-neutral-100 px-2">
        <Home className="size-6 text-neutral-950" strokeWidth={1.6} />
        <Search className="size-6 text-neutral-400" strokeWidth={1.6} />
        <div className="flex h-7 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
          <Plus className="size-4 text-neutral-700" strokeWidth={1.75} />
        </div>
        <Heart className="size-6 text-neutral-400" strokeWidth={1.6} />
        <User className="size-6 text-neutral-400" strokeWidth={1.6} />
      </nav>
      <HomeIndicator />
    </div>
  );
}

function TikTokChrome(props: Props) {
  const { author = "deckva", slideIndex, slideTotal, image, loading } = props;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {loading && !image ? (
          <div className="h-full w-full animate-pulse bg-neutral-800" />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-white/40">
            Empty slide
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />
      </div>

      <div className="relative z-10">
        <StatusBar tone="light" />
        <div className="flex items-center justify-center gap-5 pt-1 text-[14px]">
          <span className="text-white/55">Following</span>
          <span className="relative font-semibold">
            For You
            <span className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white" />
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-end gap-3 px-3 pb-2 pt-16">
        <div className="min-w-0 flex-1 space-y-2.5 pb-1">
          <p className="text-[15px] font-semibold tracking-tight">@{author}</p>
          <p className="line-clamp-2 text-[13px] leading-snug text-white/95">
            {slideTotal > 1
              ? `Slide ${slideIndex + 1} of ${slideTotal} · swipe to preview`
              : "Previewing this slide on TikTok"}
          </p>
          <div className="flex items-center gap-2 text-[12px] text-white/80">
            <span className="truncate rounded bg-white/10 px-1.5 py-0.5">♪ Original sound - {author}</span>
          </div>
          {slideTotal > 1 ? (
            <div className="flex gap-1 pt-1">
              {Array.from({ length: Math.min(slideTotal, 8) }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-[2px] flex-1 rounded-full",
                    i === slideIndex ? "bg-white" : "bg-white/30",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-4 pb-1">
          <Avatar name={author} size="lg" follow />
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="size-8 fill-white" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">24.1K</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <MessageCircle className="size-8" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">842</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Bookmark className="size-8" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">1,204</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Share className="size-8" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">Share</span>
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex h-12 shrink-0 items-center justify-around border-t border-white/10 bg-black/40 px-1 backdrop-blur-sm">
        <Home className="size-6" strokeWidth={1.6} />
        <Search className="size-6 text-white/55" strokeWidth={1.6} />
        <div className="flex h-7 w-11 items-center justify-center rounded-lg bg-gradient-to-r from-[#25f4ee] via-white to-[#fe2c55] p-[1.5px]">
          <span className="flex h-full w-full items-center justify-center rounded-[7px] bg-black">
            <Plus className="size-4" strokeWidth={2.25} />
          </span>
        </div>
        <MessageCircle className="size-6 text-white/55" strokeWidth={1.6} />
        <User className="size-6 text-white/55" strokeWidth={1.6} />
      </nav>
      <div className="relative z-10">
        <HomeIndicator tone="light" />
      </div>
    </div>
  );
}

function StoriesChrome(props: Props) {
  const { author = "deckva", slideIndex, slideTotal, image, loading } = props;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {loading && !image ? (
          <div className="h-full w-full animate-pulse bg-neutral-800" />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-white/40">
            Empty slide
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col">
        <StatusBar tone="light" />
        <div className="flex gap-1 px-3 pt-1">
          {Array.from({ length: Math.max(slideTotal, 1) }, (_, i) => (
            <span key={i} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/35">
              <span
                className={cn(
                  "block h-full rounded-full bg-white transition-all duration-300",
                  i < slideIndex ? "w-full" : i === slideIndex ? "w-[42%]" : "w-0",
                )}
              />
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 pt-3">
          <Avatar name={author} size="sm" />
          <span className="text-[13px] font-semibold tracking-tight">{author}</span>
          <span className="text-[12px] text-white/65">2h</span>
          <button type="button" className="ml-auto" aria-label="Close">
            <XIcon className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-auto px-3 pb-2 pt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 min-w-0 flex-1 items-center rounded-full border border-white/35 px-4 text-[13px] text-white/70">
            Send message
          </div>
          <Heart className="size-6" strokeWidth={1.6} />
          <Send className="size-6" strokeWidth={1.6} />
        </div>
        <HomeIndicator tone="light" />
      </div>
    </div>
  );
}

function XChrome(props: Props) {
  const { author = "deckva", slideIndex, slideTotal, image, loading } = props;
  const ar = clampFeedAspect(props.aspectRatio);

  return (
    <div className="flex h-full w-full flex-col bg-black text-white">
      <StatusBar tone="light" />
      <header className="flex h-11 shrink-0 items-center gap-6 px-3">
        <XIcon className="size-5" strokeWidth={2} />
        <span className="text-[17px] font-bold tracking-tight">Post</span>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pt-1">
        <div className="flex gap-2.5">
          <Avatar name={author} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-1 leading-tight">
              <span className="text-[14px] font-bold">{author}</span>
              <span className="text-[14px] text-white/45">@{author}</span>
              <span className="text-[14px] text-white/45">· 2h</span>
            </div>
            <p className="mt-1 text-[15px] leading-snug text-white">
              {slideTotal > 1
                ? `Previewing slide ${slideIndex + 1} of ${slideTotal}`
                : "Previewing this slide on X"}
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/15">
              <SlideImage image={image} loading={loading} aspectRatio={ar} />
            </div>
            <div className="mt-3 flex max-w-[95%] items-center justify-between text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="size-[17px]" strokeWidth={1.6} />
                <span className="text-[12px]">24</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Repeat2 className="size-[17px]" strokeWidth={1.6} />
                <span className="text-[12px]">11</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="size-[17px]" strokeWidth={1.6} />
                <span className="text-[12px]">186</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ChartNoAxesColumn className="size-[17px]" strokeWidth={1.6} />
                <span className="text-[12px]">12K</span>
              </span>
              <Share className="size-[17px]" strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex h-12 shrink-0 items-center justify-around border-t border-white/10 px-2">
        <Home className="size-6" strokeWidth={1.6} />
        <Search className="size-6 text-white/45" strokeWidth={1.6} />
        <Repeat2 className="size-6 text-white/45" strokeWidth={1.6} />
        <BellDot />
        <MessageCircle className="size-6 text-white/45" strokeWidth={1.6} />
      </nav>
      <HomeIndicator tone="light" />
    </div>
  );
}

function BellDot() {
  return (
    <span className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white/45" aria-hidden>
        <path
          d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function LinkedInChrome(props: Props) {
  const { author = "deckva", slideIndex, slideTotal, image, loading } = props;
  const ar = clampFeedAspect(props.aspectRatio);

  return (
    <div className="flex h-full w-full flex-col bg-[#f4f2ee] text-neutral-900">
      <StatusBar />
      <header className="flex h-11 shrink-0 items-center gap-3 bg-white px-3 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#0a66c2] text-[13px] font-bold text-white">
          in
        </div>
        <div className="flex h-8 min-w-0 flex-1 items-center rounded-md bg-[#edf3f8] px-3 text-[12px] text-neutral-500">
          Search
        </div>
        <MessageCircle className="size-5 text-neutral-600" strokeWidth={1.6} />
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-2.5">
        <article className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-2.5 px-3 pt-3">
            <Avatar name={author} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">{author}</p>
              <p className="truncate text-[11px] text-neutral-500">Founder · 1,240 followers</p>
              <p className="text-[11px] text-neutral-500">2h · 🌐</p>
            </div>
            <MoreHorizontal className="size-5 text-neutral-500" strokeWidth={1.75} />
          </div>
          <p className="px-3 pb-2.5 pt-2 text-[13px] leading-snug text-neutral-900">
            {slideTotal > 1
              ? `Slide ${slideIndex + 1} of ${slideTotal} — carousel preview`
              : "Previewing this slide on LinkedIn"}
          </p>
          <SlideImage image={image} loading={loading} aspectRatio={ar} fit="contain" />
          <div className="flex items-center justify-between px-3 py-2 text-[11px] text-neutral-500">
            <span>👍 48</span>
            <span>6 comments · 2 reposts</span>
          </div>
          <div className="grid grid-cols-4 border-t border-neutral-200/80 px-1 py-1.5">
            {[
              { icon: ThumbsUp, label: "Like" },
              { icon: MessageCircle, label: "Comment" },
              { icon: Repeat2, label: "Repost" },
              { icon: Send, label: "Send" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-neutral-600"
              >
                <Icon className="size-4" strokeWidth={1.7} />
                <span className="text-[10px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <nav className="flex h-12 shrink-0 items-center justify-around border-t border-neutral-200 bg-white px-1">
        <Home className="size-5 text-[#191919]" strokeWidth={1.7} />
        <User className="size-5 text-neutral-400" strokeWidth={1.7} />
        <Plus className="size-5 text-neutral-400" strokeWidth={1.7} />
        <BellDot />
        <div className="flex size-5 items-center justify-center rounded-sm bg-[#0a66c2] text-[8px] font-bold text-white">
          in
        </div>
      </nav>
      <HomeIndicator />
    </div>
  );
}

function CleanChrome(props: Props) {
  const { slideIndex, slideTotal, image, loading, aspectRatio } = props;
  return (
    <div className="flex h-full w-full flex-col bg-neutral-950">
      <StatusBar tone="light" />
      <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-2">
        <div className="w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <SlideImage
            image={image}
            loading={loading}
            aspectRatio={aspectRatio}
            fit="contain"
            className="bg-neutral-900"
          />
        </div>
      </div>
      {slideTotal > 1 ? (
        <div className="flex justify-center gap-1.5 pb-2">
          <CarouselDots total={slideTotal} active={slideIndex} tone="light" />
        </div>
      ) : null}
      <HomeIndicator tone="light" />
    </div>
  );
}

const CHROME: Record<SocialPreviewNetwork, (props: Props) => ReactNode> = {
  instagram: (p) => <InstagramChrome {...p} />,
  threads: (p) => <ThreadsChrome {...p} />,
  tiktok: (p) => <TikTokChrome {...p} />,
  stories: (p) => <StoriesChrome {...p} />,
  x: (p) => <XChrome {...p} />,
  linkedin: (p) => <LinkedInChrome {...p} />,
  clean: (p) => <CleanChrome {...p} />,
};

export function SocialPhonePreview(props: Props) {
  const startX = useRef<number | null>(null);

  return (
    <PhoneFrame className="shrink-0">
      <div
        className="h-full w-full touch-pan-y select-none"
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (dx <= -40) props.onNext?.();
          else if (dx >= 40) props.onPrev?.();
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        {CHROME[props.network](props)}
      </div>
    </PhoneFrame>
  );
}
