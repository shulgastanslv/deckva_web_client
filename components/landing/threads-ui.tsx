"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpDown,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Image as ImageIcon,
  ListFilter,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Search,
  Send,
  User,
} from "lucide-react";
import { FaThreads } from "react-icons/fa6";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type ThreadsReplyData = {
  id?: string;
  author: string;
  avatar?: string;
  time?: string;
  text: string;
  likes?: number | string;
  replies?: number | string;
  liked?: boolean;
  isAuthor?: boolean;
  showFollow?: boolean;
  showTranslate?: boolean;
  children?: ThreadsReplyData[];
};

/** One post in the Threads feed — put carousel frames in `media`. */
export type ThreadsPostData = {
  id?: string;
  author: string;
  avatar?: string;
  verified?: boolean;
  time?: string;
  topic?: string;
  text: string;
  showTranslate?: boolean;
  /** Carousel frames shown inside the post media slot */
  media?: string[];
  likes?: number | string;
  replies?: number | string;
  reposts?: number | string;
  liked?: boolean;
  comments?: ThreadsReplyData[];
};

const DEMO_AVATAR = "/post_logo.jpg";

export const DEMO_THREADS_POSTS: ThreadsPostData[] = [
  {
    id: "recursion",
    author: "theshulyaa",
    avatar: DEMO_AVATAR,
    time: "08/22/26",
    topic: "Programming",
    text: "AI: 'Finished Recursion Function'\nFunction:",
    showTranslate: true,
    media: ["/threads/function.png"],
    likes: "148",
    replies: "33",
    liked: true,
    comments: [
      {
        id: "c1",
        author: "arman_azhkhanov",
        avatar: DEMO_AVATAR,
        time: "08/22/26",
        text: "Almost",
        likes: "3",
        replies: "1",
        liked: true,
        showFollow: true,
        children: [
          {
            id: "c1-r1",
            author: "theshulyaa",
            avatar: DEMO_AVATAR,
            time: "08/22/26",
            text: "Almost not considered 🙌",
            isAuthor: true,
            showTranslate: true,
          },
        ],
      },
    ],
  },
  {
    id: "ship",
    author: "deckva",
    avatar: DEMO_AVATAR,
    verified: true,
    time: "2h",
    topic: "Design",
    text: "A carousel from one thought. Cover, middle, ending — already in order.",
    media: [
      "/landing/slide-cover.jpg",
      "/landing/slide-mid.jpg",
      "/landing/slide-end.jpg",
    ],
    likes: "128",
    replies: "14",
    reposts: "9",
    liked: true,
  },
  {
    id: "hook",
    author: "feeddesk",
    avatar: DEMO_AVATAR,
    time: "5h",
    text: "First frame stops the scroll. The rest keep the thread.",
    media: [
      "/landing/slide-mid.jpg",
      "/landing/slide-end.jpg",
      "/landing/slide-cover.jpg",
    ],
    likes: "86",
    replies: "7",
  },
  {
    id: "zip",
    author: "theshulyaa",
    avatar: DEMO_AVATAR,
    time: "1d",
    text: "Six slides. One ZIP. Straight into the thread.",
    media: ["/covers/first.jpg", "/covers/second.jpg", "/covers/third.jpg"],
    likes: "214",
    replies: "31",
    reposts: "18",
    liked: true,
  },
];

function useMediaIndex(count: number, enabled: boolean, start = 0) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(start % Math.max(count, 1));

  useEffect(() => {
    if (reduce || !enabled || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduce, enabled, count]);

  return index;
}

function formatCount(value?: number | string) {
  if (value === undefined) return null;
  return typeof value === "number" ? String(value) : value;
}

function Avatar({
  src,
  name,
  size = "md",
  follow,
}: {
  src?: string;
  name: string;
  size?: "sm" | "md" | "xs";
  follow?: boolean;
}) {
  const dim =
    size === "xs" ? "h-6 w-6" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className={cn("relative shrink-0", dim)}>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-neutral-200 ring-1 ring-black/5",
          dim,
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-neutral-600">
            {initial}
          </span>
        )}
      </div>
      {follow ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#0095f6] ring-2 ring-white">
          <Plus className="size-2.5 text-white" strokeWidth={3} />
        </span>
      ) : null}
    </div>
  );
}

function MediaCarousel({ media, index }: { media: string[]; index: number }) {
  const frame = media[index % media.length];
  const n = index % media.length;
  const single = media.length === 1;

  if (single) {
    return (
      <div className="relative mt-2.5 w-full overflow-hidden rounded-[16px] border border-black/[0.08] bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frame} alt="" className="block h-auto w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="relative mt-2.5 aspect-square w-full overflow-hidden rounded-[16px] border border-black/[0.08] bg-neutral-100">
      <motion.img
        key={frame}
        src={frame}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0.35, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        {n + 1}/{media.length}
      </span>
      <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1">
        {media.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              i === n ? "bg-white" : "bg-white/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ActionRow({
  likes,
  replies,
  reposts,
  liked,
  insights,
  compact,
}: {
  likes?: string | null;
  replies?: string | null;
  reposts?: string | null;
  liked?: boolean;
  insights?: boolean;
  compact?: boolean;
}) {
  const icon = compact ? "size-[15px]" : "size-[18px]";
  const gap = compact ? "gap-3.5" : "gap-4";
  const text = compact ? "text-[11px]" : "text-[12px]";

  return (
    <div className={cn("mt-2.5 flex items-center text-neutral-800", gap)}>
      <span className={cn("flex items-center gap-1", liked && "text-[#ff3040]")}>
        <Heart
          className={cn(icon, liked && "fill-[#ff3040] text-[#ff3040]")}
          strokeWidth={1.75}
        />
        {likes ? <span className={text}>{likes}</span> : null}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className={icon} strokeWidth={1.75} />
        {replies ? <span className={text}>{replies}</span> : null}
      </span>
      <span className="flex items-center gap-1">
        <Repeat2 className={icon} strokeWidth={1.75} />
        {reposts ? <span className={text}>{reposts}</span> : null}
      </span>
      <Send className={icon} strokeWidth={1.75} />
      {insights ? (
        <ChartNoAxesColumn className={cn(icon, "ml-auto")} strokeWidth={1.75} />
      ) : null}
    </div>
  );
}

function TranslateLink() {
  return (
    <button
      type="button"
      className="ml-1 text-[13px] font-normal text-neutral-400"
    >
      Translate
    </button>
  );
}

/** Single Threads post — drop into `<ThreadsUI>` or use alone. */
export function ThreadsPost({
  post,
  mediaIndex,
  autoplay = true,
  showThreadLine = true,
  className,
}: {
  post: ThreadsPostData;
  mediaIndex?: number;
  autoplay?: boolean;
  showThreadLine?: boolean;
  className?: string;
}) {
  const localIndex = useMediaIndex(
    post.media?.length ?? 0,
    autoplay && mediaIndex === undefined,
    0,
  );
  const index = mediaIndex ?? localIndex;
  const likes = formatCount(post.likes);
  const replies = formatCount(post.replies);
  const reposts = formatCount(post.reposts);

  return (
    <article className={cn("relative flex gap-3 px-4 pt-3 pb-3.5", className)}>
      <div className="relative flex w-9 shrink-0 flex-col items-center">
        <Avatar src={post.avatar} name={post.author} />
        {showThreadLine ? (
          <div className="mt-2 w-px flex-1 bg-neutral-200" aria-hidden />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pr-0.5">
        <div className="flex min-w-0 items-center gap-0.5">
          <span className="truncate text-[14px] font-semibold tracking-tight text-neutral-950">
            {post.author}
          </span>
          {post.verified ? (
            <span
              className="ml-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[8px] font-bold text-white"
              aria-label="Verified"
            >
              ✓
            </span>
          ) : null}
          {post.topic ? (
            <>
              <ChevronRight
                className="mx-0.5 size-3 shrink-0 text-neutral-400"
                strokeWidth={2.5}
              />
              <span className="shrink-0 text-[13px] font-semibold text-neutral-950">
                {post.topic}
              </span>
            </>
          ) : null}
          {post.time ? (
            <span className="ml-auto shrink-0 pl-2 text-[13px] text-neutral-400">
              {post.time}
            </span>
          ) : null}
          <MoreHorizontal className="ml-1 size-4 shrink-0 text-neutral-400" />
        </div>

        <p className="mt-1 whitespace-pre-wrap text-[14px] leading-[1.4] text-neutral-900">
          {post.text}
          {post.showTranslate ? <TranslateLink /> : null}
        </p>

        {post.media && post.media.length > 0 ? (
          <MediaCarousel media={post.media} index={index} />
        ) : null}

        <ActionRow
          likes={likes}
          replies={replies}
          reposts={reposts}
          liked={post.liked}
          insights
        />
      </div>
    </article>
  );
}

function ThreadsReply({
  reply,
  nested = false,
}: {
  reply: ThreadsReplyData;
  nested?: boolean;
}) {
  const hasKids = Boolean(reply.children?.length);

  return (
    <div className={cn("relative flex gap-3 px-4 py-2.5", nested && "pl-[52px]")}>
      <div className="relative flex w-9 shrink-0 flex-col items-center">
        <Avatar
          src={reply.avatar}
          name={reply.author}
          follow={reply.showFollow}
        />
        {hasKids ? (
          <div className="mt-2 w-px flex-1 bg-neutral-200" aria-hidden />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold text-neutral-950">
            {reply.author}
          </span>
          {reply.isAuthor ? (
            <span className="shrink-0 rounded-full bg-[#e8f4ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#0095f6]">
              Author
            </span>
          ) : null}
          {reply.time ? (
            <span className="ml-auto shrink-0 text-[12px] text-neutral-400">
              {reply.time}
            </span>
          ) : null}
          <MoreHorizontal className="size-4 shrink-0 text-neutral-400" />
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-[14px] leading-[1.35] text-neutral-900">
          {reply.text}
          {reply.showTranslate ? <TranslateLink /> : null}
        </p>
        {(reply.likes != null || reply.replies != null || reply.liked) && (
          <ActionRow
            likes={formatCount(reply.likes)}
            replies={formatCount(reply.replies)}
            liked={reply.liked}
            compact
          />
        )}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[44px] shrink-0 items-end justify-between bg-white px-5 pb-1.5 pt-2">
      <span className="min-w-[54px] text-[15px] font-semibold tracking-[-0.02em] text-neutral-950">
        9:41
      </span>
      <div className="mb-0.5 flex items-center gap-[5px]">
        <svg
          width="17"
          height="11"
          viewBox="0 0 17 11"
          fill="none"
          aria-hidden
          className="text-neutral-950"
        >
          <rect x="0.5" y="2.5" width="3" height="8" rx="0.8" fill="currentColor" />
          <rect x="4.5" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
          <rect x="8.5" y="0" width="3" height="10.5" rx="0.8" fill="currentColor" />
          <rect
            x="12.5"
            y="0"
            width="3"
            height="10.5"
            rx="0.8"
            fill="currentColor"
            opacity="0.35"
          />
        </svg>
        <svg
          width="15"
          height="11"
          viewBox="0 0 15 11"
          fill="none"
          aria-hidden
          className="text-neutral-950"
        >
          <path
            d="M7.5 3.2c1.7 0 3.2.7 4.3 1.7l1.1-1.2A7.4 7.4 0 0 0 7.5 1.4 7.4 7.4 0 0 0 2.1 3.7l1.1 1.2A5.9 5.9 0 0 1 7.5 3.2Z"
            fill="currentColor"
          />
          <path
            d="M7.5 6.1c.9 0 1.7.4 2.3 1l1.1-1.2A4.6 4.6 0 0 0 7.5 4.6 4.6 4.6 0 0 0 4.1 5.9l1.1 1.2a3.1 3.1 0 0 1 2.3-1Z"
            fill="currentColor"
          />
          <circle cx="7.5" cy="9.4" r="1.2" fill="currentColor" />
        </svg>
        <div className="relative ml-0.5 flex h-[11px] w-[24px] items-center rounded-[3px] border-[1.2px] border-neutral-950/90 p-[1.5px]">
          <div className="h-full w-[70%] rounded-[1.5px] bg-neutral-950" />
          <div className="absolute -right-[3px] top-1/2 h-[4px] w-[1.5px] -translate-y-1/2 rounded-r-[1px] bg-neutral-950/90" />
        </div>
      </div>
    </div>
  );
}

function ThreadsHeader() {
  return (
    <header className="relative isolate z-10 flex h-11 shrink-0 items-center justify-center border-b border-neutral-100 bg-white px-3 [transform:translateZ(0)]">
      <ChevronLeft
        className="absolute left-2 top-1/2 size-[22px] -translate-y-1/2 text-neutral-950"
        strokeWidth={2}
      />
      <FaThreads className="size-[22px] text-neutral-950" aria-label="Threads" />
      <div
        className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-[5px]"
        aria-label="Menu"
      >
        <span className="h-[1.5px] w-[15px] rounded-full bg-neutral-950" />
        <span className="h-[1.5px] w-[15px] rounded-full bg-neutral-950" />
      </div>
    </header>
  );
}

function ThreadsFilterBar() {
  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-neutral-100 px-4 py-2.5 text-[13px]">
      <button
        type="button"
        className="inline-flex items-center gap-1 font-semibold text-neutral-950"
      >
        <ArrowUpDown className="size-3.5" strokeWidth={2} />
        Top
        <ChevronDown className="size-3.5 text-neutral-500" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1 font-semibold text-neutral-950"
      >
        <ListFilter className="size-3.5" strokeWidth={2} />
        All
        <ChevronDown className="size-3.5 text-neutral-500" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="ml-auto inline-flex items-center gap-0.5 text-neutral-400"
      >
        View activity
        <ChevronRight className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ThreadsReplyBar({ author }: { author: string }) {
  return (
    <div className="shrink-0 border-t border-neutral-100 bg-white/95 px-3.5 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-2.5 py-2">
        <Avatar name="you" src={DEMO_AVATAR} size="xs" />
        <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-400">
          Reply to {author}...
        </span>
        <ImageIcon className="size-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
        <span className="text-[10px] font-bold tracking-wide text-neutral-500">
          GIF
        </span>
        <Maximize2 className="mr-0.5 size-3.5 shrink-0 text-neutral-500" strokeWidth={1.75} />
      </div>
    </div>
  );
}

function ThreadsTabBar() {
  return (
    <nav className="flex h-[50px] shrink-0 items-center justify-around border-t border-neutral-100 bg-white px-2 pb-1">
      <Home className="size-[24px] text-neutral-950" strokeWidth={1.6} />
      <Search className="size-[24px] text-neutral-400" strokeWidth={1.6} />
      <div className="flex h-7 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
        <Plus className="size-4 text-neutral-700" strokeWidth={1.75} />
      </div>
      <Heart className="size-[24px] text-neutral-400 " strokeWidth={1.6} />
      <User className="size-[24px] text-neutral-400" strokeWidth={1.6} />
    </nav>
  );
}

/**
 * Threads phone chrome — thread detail layout matching the real app.
 *
 * @example
 * <PhoneFrame>
 *   <ThreadsUI
 *     posts={[{
 *       author: "you",
 *       topic: "Programming",
 *       text: "Hook for the feed",
 *       media: ["/threads/function.png"],
 *     }]}
 *   />
 * </PhoneFrame>
 */
export function ThreadsUI({
  posts = DEMO_THREADS_POSTS,
  children,
  className,
  mediaIndex,
  autoplay = true,
  showReplyBar = true,
  showTabBar = true,
  compact = false,
}: {
  posts?: ThreadsPostData[];
  children?: ReactNode;
  className?: string;
  /** Controlled media frame index for the first post with media */
  mediaIndex?: number;
  autoplay?: boolean;
  showReplyBar?: boolean;
  showTabBar?: boolean;
  /** Tighter chrome for small phone mocks */
  compact?: boolean;
}) {
  const main = posts[0];
  const replyTo = main?.author ?? "user";
  const comments = main?.comments ?? [];
  const feedTail = posts.slice(1);
  const reply = showReplyBar && !compact;
  const tabs = showTabBar && !compact;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-white text-neutral-950 antialiased",
        className,
      )}
    >
      <StatusBar />
      <ThreadsHeader />

      <div
        className={cn(
          "min-h-0 flex-1 overscroll-contain",
          compact ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        {children ?? (
          <>
            {main ? (
              <ThreadsPost
                post={main}
                mediaIndex={mediaIndex}
                autoplay={autoplay}
                showThreadLine={!compact && (comments.length > 0 || feedTail.length > 0)}
                className={compact ? "px-3 pt-2.5 pb-2" : undefined}
              />
            ) : null}

            {!compact && (comments.length > 0 || main) ? <ThreadsFilterBar /> : null}

            {!compact
              ? comments.map((item) => (
                  <div key={item.id ?? item.author}>
                    <ThreadsReply reply={item} />
                    {item.children?.map((child) => (
                      <ThreadsReply
                        key={child.id ?? `${item.author}-${child.author}`}
                        reply={child}
                        nested
                      />
                    ))}
                  </div>
                ))
              : null}

            {!compact
              ? feedTail.map((post, i) => (
                  <ThreadsPost
                    key={post.id ?? `${post.author}-${i}`}
                    post={post}
                    autoplay={false}
                    showThreadLine={i < feedTail.length - 1}
                  />
                ))
              : null}
          </>
        )}
      </div>

      {reply ? <ThreadsReplyBar author={replyTo} /> : null}
      {tabs ? <ThreadsTabBar /> : null}
    </div>
  );
}
