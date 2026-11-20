"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowsDownUp as ArrowUpDown,
  BookmarkSimple as Bookmark,
  ChartBar as ChartNoAxesColumn,
  CaretDown as ChevronDown,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Heart,
  House as Home,
  Image as ImageIcon,
  ArrowsOut as Maximize2,
  ChatCircle as MessageCircle,
  DotsThree as MoreHorizontal,
  Plus,
  ArrowsClockwise as Repeat2,
  MagnifyingGlass as Search,
  PaperPlaneTilt as Send,
  User,
} from "@phosphor-icons/react";
import { FaThreads } from "react-icons/fa6";
import { motion, useReducedMotion } from "motion/react";

import {
  frames,
  post,
  reply,
  THREADS_AVATAR,
  THREADS_CAROUSELS,
} from "@/components/landing/threads-content";
import { cn } from "@/lib/utils";

export {
  frames,
  post,
  reply,
  heroThreadsPosts,
  THREADS_AVATAR,
  THREADS_CAROUSELS,
} from "@/components/landing/threads-content";

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

/**
 * One post in the Threads feed.
 *
 * ```ts
 * post({
 *   author: "mira",
 *   text: "Карусели, готовые к публикации.",
 *   media: frames(...THREADS_CAROUSELS.product),
 *   likes: 214,
 *   replies: 31,
 * })
 * ```
 */
export type ThreadsPostData = {
  id?: string;
  author: string;
  avatar?: string;
  verified?: boolean;
  time?: string;
  topic?: string;
  text: string;
  showTranslate?: boolean;
  media?: string[];
  likes?: number | string;
  replies?: number | string;
  reposts?: number | string;
  liked?: boolean;
  insights?: boolean;
  comments?: ThreadsReplyData[];
};

export const DEMO_THREADS_POSTS: ThreadsPostData[] = [
  post({
    id: "main",
    author: "deckva",
    verified: true,
    time: "1ч",
    topic: "Примеры",
    text: "Карусели, готовые к публикации.",
    media: frames(...THREADS_CAROUSELS.product),
    likes: "214",
    replies: "31",
    reposts: "18",
    liked: true,
    insights: true,
    comments: [
      reply({
        id: "c1",
        author: "deckva",
        time: "45м",
        text: "Одна идея — уже по порядку.",
        likes: "12",
        replies: "2",
        liked: true,
        showFollow: true,
        children: [
          reply({
            id: "c1-r1",
            author: "mira",
            time: "20м",
            text: "И сразу в ZIP 🙌",
            isAuthor: true,
            showTranslate: true,
          }),
        ],
      }),
      reply({
        id: "c2",
        author: "deckva",
        time: "1ч",
        text: "Первый кадр останавливает скролл.",
        likes: "4",
        showTranslate: true,
      }),
    ],
  }),
  post({
    id: "ship",
    author: "deckva",
    verified: true,
    time: "2ч",
    text: "Обложка, середина, финал — уже в нужном порядке.",
    media: frames(...THREADS_CAROUSELS.launch),
    likes: "128",
    replies: "14",
    reposts: "9",
    liked: true,
  }),
  post({
    id: "tips",
    author: "deckva",
    time: "5ч",
    text: "Шесть слайдов. Один ZIP. Прямо в тред.",
    showTranslate: true,
    media: frames(...THREADS_CAROUSELS.tips),
    likes: "86",
    replies: "7",
  }),
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
  if (value === undefined || value === null || value === "") return null;
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
  // Reference: ~28–32px avatar on phone mock
  const dim =
    size === "xs" ? "size-5" : size === "sm" ? "size-6" : "size-[28px]";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className={cn("relative shrink-0", dim)}>
      <div className={cn("overflow-hidden rounded-full bg-neutral-200", dim)}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[9px] font-medium text-neutral-500">
            {initial}
          </span>
        )}
      </div>
      {follow ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full bg-[#0095f6] ring-[1.5px] ring-white">
          <Plus className="size-1.5 text-white" weight="bold" />
        </span>
      ) : null}
    </div>
  );
}

function MediaCarousel({ media, index }: { media: string[]; index: number }) {
  const frame = media[index % media.length];
  const n = index % media.length;
  const single = media.length === 1;

  return (
    <div className="relative mt-1.5 w-full overflow-hidden rounded-[12px] bg-neutral-100 aspect-square">
      <motion.img
        key={frame}
        src={frame}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0.45, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
      {!single ? (
        <>
          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-[2px] text-[8px] font-medium tabular-nums leading-none text-white">
            {n + 1}/{media.length}
          </span>
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-[3px]">
            {media.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-[3.5px] rounded-full transition-colors",
                  i === n ? "bg-white" : "bg-white/40",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ActionRow({
  likes,
  replies,
  reposts,
  liked,
  trailing = "bookmark",
  compact,
}: {
  likes?: string | null;
  replies?: string | null;
  reposts?: string | null;
  liked?: boolean;
  trailing?: "bookmark" | "insights" | "none";
  compact?: boolean;
}) {
  // Reference: thin ~15–16px icons, ~11px counts, muted
  const icon = compact ? "size-3.5" : "size-4";
  const gap = compact ? "gap-2.5" : "gap-3";
  const text = "text-[11px] font-normal tabular-nums";

  return (
    <div className={cn("mt-1.5 flex items-center text-neutral-600", gap)}>
      <span
        className={cn("flex items-center gap-0.5", liked && "text-[#ff3040]")}
      >
        <Heart
          className={cn(icon, liked && "fill-[#ff3040] text-[#ff3040]")}
          weight={liked ? "fill" : "regular"}
        />
        {likes ? <span className={text}>{likes}</span> : null}
      </span>
      <span className="flex items-center gap-0.5">
        <MessageCircle className={icon} weight="regular" />
        {replies ? <span className={text}>{replies}</span> : null}
      </span>
      <span className="flex items-center gap-0.5">
        <Repeat2 className={icon} weight="regular" />
        {reposts ? <span className={text}>{reposts}</span> : null}
      </span>
      <Send className={icon} weight="regular" />
      {trailing === "insights" ? (
        <ChartNoAxesColumn className={cn(icon, "ml-auto")} weight="regular" />
      ) : trailing === "bookmark" ? (
        <Bookmark className={cn(icon, "ml-auto")} weight="regular" />
      ) : null}
    </div>
  );
}

function TranslateLink() {
  return (
    <button
      type="button"
      className="ml-1 text-[12px] font-normal text-neutral-400"
    >
      Translate
    </button>
  );
}

/** Single Threads post — drop into `<ThreadsUI>` or use alone. */
export function ThreadsPost({
  post: postData,
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
    postData.media?.length ?? 0,
    autoplay && mediaIndex === undefined,
    0,
  );
  const index = mediaIndex ?? localIndex;
  const likes = formatCount(postData.likes);
  const replies = formatCount(postData.replies);
  const reposts = formatCount(postData.reposts);

  return (
    <article className={cn("relative flex gap-2 px-3 pt-2", className)}>
      <div className="relative flex w-[28px] shrink-0 flex-col items-center">
        <Avatar src={postData.avatar} name={postData.author} size="md" />
        {showThreadLine ? (
          <div className="mt-1.5 w-px flex-1 bg-neutral-200" aria-hidden />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-2">
        <div className="flex min-w-0 items-center gap-0.5">
          <span className="truncate text-[13px] font-semibold tracking-tight text-neutral-950">
            {postData.author}
          </span>
          {postData.verified ? (
            <svg
              className="ml-0.5 size-3 shrink-0 text-[#0095f6]"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-label="Verified"
            >
              <path d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0Zm2.4 4.05L5.2 7.35 3.6 5.8l-.85.85 2.45 2.4 4-4.15-.8-.85Z" />
            </svg>
          ) : null}
          {postData.topic ? (
            <>
              <ChevronRight
                className="size-2.5 shrink-0 text-neutral-400"
                weight="bold"
              />
              <span className="max-w-[45%] truncate text-[13px] font-semibold text-neutral-950">
                {postData.topic}
              </span>
            </>
          ) : null}
          {postData.time && !postData.topic ? (
            <span className="shrink-0 text-[12px] text-neutral-400">
              {postData.time}
            </span>
          ) : null}
          <div className="ml-auto flex shrink-0 items-center gap-1 pl-1">
            {postData.time && postData.topic ? (
              <span className="text-[12px] text-neutral-400">{postData.time}</span>
            ) : null}
            <MoreHorizontal className="size-3.5 text-neutral-400" weight="bold" />
          </div>
        </div>

        <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-[1.3] text-neutral-900">
          {postData.text}
          {postData.showTranslate ? <TranslateLink /> : null}
        </p>

        {postData.media && postData.media.length > 0 ? (
          <MediaCarousel media={postData.media} index={index} />
        ) : null}

        <ActionRow
          likes={likes}
          replies={replies}
          reposts={reposts}
          liked={postData.liked}
          trailing={postData.insights ? "insights" : "bookmark"}
        />
      </div>
    </article>
  );
}

function ThreadsReply({
  reply: item,
  nested = false,
}: {
  reply: ThreadsReplyData;
  nested?: boolean;
}) {
  const hasKids = Boolean(item.children?.length);

  return (
    <div className={cn("relative flex gap-2 px-3 py-1.5", nested && "pl-10")}>
      <div className="relative flex w-[28px] shrink-0 flex-col items-center">
        <Avatar
          src={item.avatar}
          name={item.author}
          follow={item.showFollow}
        />
        {hasKids ? (
          <div className="mt-1.5 w-px flex-1 bg-neutral-200" aria-hidden />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[13px] font-semibold text-neutral-950">
            {item.author}
          </span>
          {item.isAuthor ? (
            <span className="shrink-0 rounded-full bg-[#e8f4ff] px-1.5 py-px text-[9px] font-medium text-[#0095f6]">
              Author
            </span>
          ) : null}
          {item.time ? (
            <span className="shrink-0 text-[11px] text-neutral-400">
              {item.time}
            </span>
          ) : null}
          <MoreHorizontal className="ml-auto size-3.5 shrink-0 text-neutral-400" weight="bold" />
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-[1.3] text-neutral-900">
          {item.text}
          {item.showTranslate ? <TranslateLink /> : null}
        </p>
        {(item.likes != null || item.replies != null || item.liked) && (
          <ActionRow
            likes={formatCount(item.likes)}
            replies={formatCount(item.replies)}
            liked={item.liked}
            trailing="none"
            compact
          />
        )}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-10 shrink-0 items-end justify-between bg-white px-5 pb-1 pt-4">
      <span className="min-w-[40px] text-[12px] font-semibold tracking-[-0.02em] text-neutral-950 px-2">
        9:41
      </span>
      <div className="mb-px flex items-center gap-1 px-2">
        <svg width="14" height="9" viewBox="0 0 17 11" fill="none" aria-hidden>
          <rect x="0.5" y="2.5" width="3" height="8" rx="0.8" fill="currentColor" />
          <rect x="4.5" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
          <rect x="8.5" y="0" width="3" height="10.5" rx="0.8" fill="currentColor" />
          <rect x="12.5" y="0" width="3" height="10.5" rx="0.8" fill="currentColor" opacity="0.35" />
        </svg>
        <svg width="12" height="9" viewBox="0 0 15 11" fill="none" aria-hidden>
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
        <div className="relative ml-px flex h-[9px] w-[20px] items-center rounded-[2.5px] border border-neutral-950/90 p-px">
          <div className="h-full w-[70%] rounded-[1px] bg-neutral-950" />
          <div className="absolute -right-[2.5px] top-1/2 h-[3px] w-[1.5px] -translate-y-1/2 rounded-r-[1px] bg-neutral-950/90" />
        </div>
      </div>
    </div>
  );
}

function ThreadsHeader() {
  return (
    <header className="relative isolate z-10 flex h-10 shrink-0 items-center justify-center bg-white px-4">
      <ChevronLeft
        className="absolute left-2.5 top-1/2 size-[18px] -translate-y-1/2 text-neutral-950"
        weight="regular"
      />
      <FaThreads className="size-[18px] text-neutral-950" aria-label="Threads" />
      <div
        className="absolute right-3.5 top-1/2 flex -translate-y-1/2 flex-col gap-1"
        aria-label="Menu"
      >
        <span className="h-px w-3.5 rounded-full bg-neutral-950" />
        <span className="h-px w-3.5 rounded-full bg-neutral-950" />
      </div>
    </header>
  );
}

function ThreadsFilterBar() {
  return (
    <div className="flex shrink-0 items-center px-3 py-2 text-[12px]">
      <button
        type="button"
        className="inline-flex items-center gap-0.5 font-semibold text-neutral-950"
      >
        <ArrowUpDown className="size-3" weight="bold" />
        Top
        <ChevronDown className="size-3 text-neutral-500" weight="bold" />
      </button>
      <button
        type="button"
        className="ml-auto inline-flex items-center gap-px text-neutral-400"
      >
        View activity
        <ChevronRight className="size-3" weight="bold" />
      </button>
    </div>
  );
}

function ThreadsReplyBar({ author }: { author: string }) {
  return (
    <div className="shrink-0 bg-white px-2.5 pb-1 pt-1.5">
      <div className="flex items-center gap-1.5 rounded-2xl bg-neutral-100 px-2 py-1.5">
        <Avatar name="you" src={THREADS_AVATAR} size="xs" />
        <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-400">
          Reply to {author}...
        </span>
        <ImageIcon className="size-3.5 shrink-0 text-neutral-500" weight="regular" />
        <span className="text-[9px] font-bold tracking-wide text-neutral-500">
          GIF
        </span>
        <Maximize2 className="size-3 shrink-0 text-neutral-500" weight="regular" />
      </div>
    </div>
  );
}

/** Tab bar — Home · Search · Create · Activity · Profile (as in hero ref) */
function ThreadsTabBar() {
  return (
    <nav className="grid h-14 grid-cols-5 gap-4 items-center justify-around bg-white px-14 pb-4">
      <Home className="size-[22px] text-neutral-950" weight="regular" />
      <Search className="size-[22px] text-neutral-950" weight="regular" />
      <div className="flex size-7 items-center justify-center rounded-md bg-neutral-100">
        <Plus className="size-3.5 text-neutral-800" weight="regular" />
      </div>
      <Heart className="size-[22px] text-neutral-950" weight="regular" />
      <User className="size-[22px] text-neutral-950" weight="regular" />
    </nav>
  );
}

/**
 * Threads phone chrome — density matched to the landing hero reference.
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
  mediaIndex?: number;
  autoplay?: boolean;
  showReplyBar?: boolean;
  showTabBar?: boolean;
  compact?: boolean;
}) {
  const main = posts[0];
  const replyTo = main?.author ?? "user";
  const comments = main?.comments ?? [];
  const feedTail = posts.slice(1);
  const replyBar = showReplyBar && !compact;
  const tabs = showTabBar;

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
                showThreadLine={
                  !compact && (comments.length > 0 || feedTail.length > 0)
                }
              />
            ) : null}

            {!compact && comments.length > 0 ? <ThreadsFilterBar /> : null}

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
              ? feedTail.map((entry, i) => (
                  <ThreadsPost
                    key={entry.id ?? `${entry.author}-${i}`}
                    post={entry}
                    autoplay={false}
                    showThreadLine={i < feedTail.length - 1}
                  />
                ))
              : null}
          </>
        )}
      </div>

      {replyBar ? <ThreadsReplyBar author={replyTo} /> : null}
      {tabs ? <ThreadsTabBar /> : null}
    </div>
  );
}
