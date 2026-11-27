"use client";

import { useTranslations } from "next-intl";
import { useRef, type ReactNode } from "react";
import {
  Bookmark,
  Heart,
  House as Home,
  ChatCircle as MessageCircle,
  DotsThree as MoreHorizontal,
  Plus,
  MagnifyingGlass as Search,
  PaperPlaneTilt as Send,
  User,
  X as XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { PhoneFrame } from "@/components/canvas/phone-frame";
import { ThreadsUI, type ThreadsReplyData } from "@/components/landing/threads-ui";
import { post, reply, THREADS_AVATAR } from "@/components/landing/threads-content";

export type SocialPreviewNetwork =
  | "instagram"
  | "stories"
  | "threads"
  | "clean";

export const SOCIAL_PREVIEW_NETWORKS: {
  id: SocialPreviewNetwork;
  label: string;
}[] = [
  { id: "instagram", label: "Instagram" },
  { id: "threads", label: "Threads" },
];

type Props = {
  image: string | null;
  /** All slide previews for Threads carousel chrome (ordered). */
  images?: Array<string | null>;
  loading?: boolean;
  aspectRatio: number;
  slideIndex: number;
  slideTotal: number;
  author?: string;
  /** Post caption shown under the media in feed-style networks. */
  caption?: string;
  onPrev?: () => void;
  onNext?: () => void;
  network: SocialPreviewNetwork;
  className?: string;
};

function captionOrFallback(caption: string | undefined, fallback: string) {
  const trimmed = caption?.trim();
  return trimmed || fallback;
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
          "h-[5px] w-[108px] rounded-md",
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
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-md bg-[#fe2c55] ring-2 ring-black">
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
  fill,
}: {
  image: string | null;
  loading?: boolean;
  aspectRatio?: number;
  className?: string;
  fit?: "cover" | "contain";
  badge?: string;
  /** Fill a flex parent instead of driving height via aspect-ratio. */
  fill?: boolean;
}) {
  const t = useTranslations("editor.phonePreview");
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-neutral-100",
        fill && "min-h-0 flex-1",
        className,
      )}
      style={fill || aspectRatio == null ? undefined : { aspectRatio }}
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
            fill ? "absolute inset-0 size-full" : "h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain bg-neutral-50",
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-neutral-400">
          {t("emptySlide")}
        </div>
      )}
      {badge ? (
        <span className="absolute right-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
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
            "rounded-md transition-all",
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
  const t = useTranslations("editor.phonePreview");

  const { author = "deckva", slideIndex, slideTotal, image, loading, caption } = props;
  const body = captionOrFallback(
    caption,
    slideTotal > 1 ? `Slide ${slideIndex + 1} of ${slideTotal}` : t("newPost"),
  );

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
        fill
        badge={slideTotal > 1 ? `${slideIndex + 1}/${slideTotal}` : undefined}
      />

      <div className="relative flex shrink-0 items-center px-3 pt-2.5">
        <div className="flex items-center gap-[14px]">
          <Heart className="size-[24px]" strokeWidth={1.6} />
          <MessageCircle className="size-[24px]" strokeWidth={1.6} />
          <Send className="size-[24px]" strokeWidth={1.6} />
        </div>
        {slideTotal > 1 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <CarouselDots total={slideTotal} active={slideIndex} />
          </div>
        ) : null}
        <Bookmark className="ml-auto size-[24px]" strokeWidth={1.6} />
      </div>

      <div className="shrink-0 space-y-1 px-3 pt-2 pb-2">
        <p className="text-[13px] font-semibold leading-none">128 likes</p>
        <p className="line-clamp-3 text-[13px] leading-snug whitespace-pre-wrap">
          <span className="font-semibold">{author}</span>{" "}
          <span className="text-neutral-800">{body}</span>
        </p>
        <p className="text-[13px] text-neutral-500">{t("viewAllComments")}</p>
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

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(list: readonly T[], seed: number, salt: number): T {
  return list[(seed + salt * 97) % list.length]!;
}

function formatEngagement(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

const COMMENT_AUTHORS = [
  "mira",
  "noah",
  "lena",
  "kai",
  "sofia",
  "owen",
  "aria",
  "julio",
  "nina",
  "theo",
] as const;

const COMMENT_LINES = [
  "This carousel hits hard 🔥",
  "Saving this for later.",
  "Slide 1 alone already stops the scroll.",
  "Need this energy for my next post.",
  "Clean layout. Who designed this?",
  "The pacing between frames is perfect.",
  "Okay this is actually useful.",
  "Sending this to the team rn.",
  "More of this please.",
  "Looks ready to publish as-is.",
  "The last slide is the hook.",
  "Bookmarking — great example.",
] as const;

const NESTED_LINES = [
  "Agreed 🙌",
  "Same here.",
  "Exactly.",
  "This.",
  "Facts.",
] as const;

const POST_TIMES = ["12m", "34m", "1h", "2h", "3h", "5h"] as const;
const REPLY_TIMES = ["2m", "8m", "14m", "22m", "41m", "1h"] as const;

function buildPreviewEngagement(author: string, slideTotal: number) {
  const seed = hashSeed(`${author}:${slideTotal}`);
  const likes = 48 + (seed % 920) + slideTotal * 17;
  const replies = 3 + (seed % 38) + Math.min(slideTotal, 6);
  const reposts = 2 + (seed % 24) + Math.floor(slideTotal / 2);

  const commentCount = 2 + (seed % 3);
  const comments: ThreadsReplyData[] = [];

  for (let i = 0; i < commentCount; i += 1) {
    const name = pick(COMMENT_AUTHORS, seed, i + 1);
    const withNest = (seed + i) % 3 === 0;
    const kids: ThreadsReplyData[] | undefined = withNest
      ? [
          reply({
            id: `c${i}-r1`,
            author,
            time: pick(REPLY_TIMES, seed, i + 11),
            text: pick(NESTED_LINES, seed, i + 13),
            isAuthor: true,
            likes: 1 + ((seed + i) % 9),
          }),
        ]
      : undefined;

    comments.push(
      reply({
        id: `c${i}`,
        author: name,
        time: pick(REPLY_TIMES, seed, i + 3),
        text: pick(COMMENT_LINES, seed, i + 5),
        likes: 2 + ((seed + i * 7) % 48),
        replies: kids ? String(kids.length) : ((seed + i) % 4 === 0 ? "1" : undefined),
        liked: (seed + i) % 2 === 0,
        showFollow: (seed + i) % 3 === 1,
        showTranslate: (seed + i) % 5 === 0,
        children: kids,
      }),
    );
  }

  return {
    likes: formatEngagement(likes),
    replies: formatEngagement(replies),
    reposts: formatEngagement(reposts),
    time: pick(POST_TIMES, seed, 2),
    liked: seed % 3 !== 0,
    comments,
  };
}

function ThreadsChrome(props: Props) {
  const t = useTranslations("editor.phonePreview");
  const {
    author = "deckva",
    slideIndex,
    slideTotal,
    image,
    images,
    caption,
  } = props;

  const media = Array.from({ length: Math.max(slideTotal, 1) }, (_, i) => {
    const fromList = images?.[i];
    if (fromList) return fromList;
    if (i === slideIndex && image) return image;
    return THREADS_AVATAR;
  });

  const body = captionOrFallback(
    caption,
    slideTotal > 1
      ? `Carousel · ${slideIndex + 1}/${slideTotal}`
      : t("previewingThreads"),
  );

  const engagement = buildPreviewEngagement(author, slideTotal);

  const posts = [
    post({
      id: "editor-preview",
      author,
      verified: true,
      time: engagement.time,
      text: body,
      media,
      likes: engagement.likes,
      replies: engagement.replies,
      reposts: engagement.reposts,
      liked: engagement.liked,
      insights: true,
      comments: engagement.comments,
    }),
  ];

  return (
    <ThreadsUI
      posts={posts}
      mediaIndex={slideIndex}
      autoplay={false}
      showReplyBar
      showTabBar
    />
  );
}

function StoriesChrome(props: Props) {
  const t = useTranslations("editor.phonePreview");

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
            {t("emptySlide")}
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col">
        <StatusBar tone="light" />
        <div className="flex gap-1 px-3 pt-1">
          {Array.from({ length: Math.max(slideTotal, 1) }, (_, i) => (
            <span key={i} className="h-[2px] flex-1 overflow-hidden rounded-md bg-white/35">
              <span
                className={cn(
                  "block h-full rounded-md bg-white transition-all duration-300",
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
          <button type="button" className="ml-auto" aria-label={t("close")}>
            <XIcon className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-auto px-3 pb-2 pt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 min-w-0 flex-1 items-center rounded-md border border-white/35 px-4 text-[13px] text-white/70">
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

function CleanChrome(props: Props) {
  const { slideIndex, slideTotal, image, loading } = props;
  return (
    <div className="flex h-full w-full flex-col bg-neutral-950">
      <StatusBar tone="light" />
      <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-2">
        <div className="relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <SlideImage
            image={image}
            loading={loading}
            fill
            fit="contain"
            className="bg-neutral-900"
          />
        </div>
      </div>
      {slideTotal > 1 ? (
        <div className="flex shrink-0 justify-center gap-1.5 pb-2">
          <CarouselDots total={slideTotal} active={slideIndex} tone="light" />
        </div>
      ) : null}
      <HomeIndicator tone="light" />
    </div>
  );
}

const CHROME: Record<SocialPreviewNetwork, (props: Props) => ReactNode> = {
  instagram: (p) => <InstagramChrome {...p} />,
  stories: (p) => <StoriesChrome {...p} />,
  threads: (p) => <ThreadsChrome {...p} />,
  clean: (p) => <CleanChrome {...p} />,
};

export function SocialPhonePreview(props: Props) {
  const startX = useRef<number | null>(null);

  return (
    <PhoneFrame
      size="auto"
      className={cn(
        // Prefer stage height; width follows device AR. max-w keeps narrow viewports safe.
        "h-[min(100%,calc(100dvh-11.5rem))] w-auto max-w-full shrink-0",
        props.className,
      )}
    >
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
