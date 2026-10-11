"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Heart,
  Home,
  Image as ImageIcon,
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

/** One post in the Threads feed — put carousel frames in `media`. */
export type ThreadsPostData = {
  id?: string;
  author: string;
  avatar?: string;
  verified?: boolean;
  time?: string;
  text: string;
  /** Carousel frames shown inside the post media slot */
  media?: string[];
  likes?: number | string;
  replies?: number | string;
  reposts?: number | string;
  liked?: boolean;
};

export const DEMO_THREADS_POSTS: ThreadsPostData[] = [
  {
    id: "ship",
    author: "swibp",
    avatar: "post_logo.jpg",
    verified: true,
    time: "2h",
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
    avatar: "post_logo.jpg",
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
    avatar: "post_logo.jpg",
    time: "1d",
    text: "Six slides. One ZIP. Straight into the thread.",
    media: ["/covers/first.jpg", "/covers/second.jpg", "/covers/third.jpg"],
    likes: "214",
    replies: "31",
    reposts: "18",
    liked: true,
  },
  {
    id: "rhythm",
    author: "productnotes",
    avatar: "post_logo.jpg",
    time: "1d",
    text: "One point per frame. The carousel keeps the rhythm.",
    media: [
      "/covers/fourth.jpg",
      "/landing/slide-cover.jpg",
      "/landing/slide-mid.jpg",
    ],
    likes: "97",
    replies: "12",
  },
  {
    id: "canvas",
    author: "release",
    avatar: "post_logo.jpg",
    time: "2d",
    text: "The canvas was already the post. Exported and published.",
    media: ["/landing/slide-end.jpg", "/landing/slide-cover.jpg"],
    likes: "64",
    replies: "9",
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
}: {
  src?: string;
  name: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-black/5",
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
  );
}

function MediaCarousel({ media, index }: { media: string[]; index: number }) {
  const frame = media[index % media.length];
  const n = index % media.length;

  return (
    <div className="relative mt-2 aspect-square w-full overflow-hidden rounded-2xl border border-black/[0.08] bg-neutral-100">
      <motion.img
        key={frame}
        src={frame}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0.35, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {media.length > 1 ? (
        <>
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
        </>
      ) : null}
    </div>
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
    <article className={cn("relative flex gap-2.5 px-3 py-3", className)}>
      <div className="relative flex w-9 shrink-0 flex-col items-center">
        <Avatar src={post.avatar} name={post.author} />
        {showThreadLine ? (
          <div className="mt-1.5 w-px flex-1 bg-neutral-200" aria-hidden />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-[13px] font-semibold tracking-tight text-neutral-950">
            {post.author}
          </span>
          {post.verified ? (
            <span
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-950 text-[8px] font-bold text-white"
              aria-label="Verified"
            >
              ✓
            </span>
          ) : null}
          {post.time ? (
            <span className="ml-auto shrink-0 text-[12px] text-neutral-400">
              {post.time}
            </span>
          ) : null}
          <MoreHorizontal className="ml-1 size-4 shrink-0 text-neutral-400" />
        </div>

        <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-[1.35] text-neutral-900">
          {post.text}
        </p>

        {post.media && post.media.length > 0 ? (
          <MediaCarousel media={post.media} index={index} />
        ) : null}

        <div className="mt-2.5 flex items-center gap-4 text-neutral-600">
          <span
            className={cn(
              "flex items-center gap-1",
              post.liked && "text-red-500",
            )}
          >
            <Heart
              className={cn("size-[18px]", post.liked && "fill-red-500")}
              strokeWidth={1.75}
            />
            {likes ? <span className="text-[11px]">{likes}</span> : null}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-[18px]" strokeWidth={1.75} />
            {replies ? <span className="text-[11px]">{replies}</span> : null}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="size-[18px]" strokeWidth={1.75} />
            {reposts ? <span className="text-[11px]">{reposts}</span> : null}
          </span>
          <Send className="size-[18px]" strokeWidth={1.75} />
        </div>
      </div>
    </article>
  );
}

function ThreadsHeader() {
  return (
    <header className="relative flex h-11 shrink-0 items-center justify-center bg-white px-3">
      <FaThreads className="size-6 text-neutral-950" aria-label="Threads" />
      <MoreHorizontal className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
    </header>
  );
}

function ThreadsReplyBar({ author }: { author: string }) {
  return (
    <div className="shrink-0 px-3 pb-2">
      <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1.5">
        <Avatar name="you" size="sm" />
        <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-400">
          Reply to {author}...
        </span>
        <ImageIcon className="size-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
        <span className="pr-1 text-[10px] font-bold tracking-wide text-neutral-400">
          GIF
        </span>
      </div>
    </div>
  );
}

function ThreadsTabBar() {
  return (
    <nav className="flex h-12 shrink-0 items-center justify-around border-t border-neutral-100 bg-white px-2 pb-1">
      <Home className="size-6 fill-neutral-950 text-neutral-950" strokeWidth={1.5} />
      <Search className="size-6 text-neutral-400" strokeWidth={1.5} />
      <div className="flex h-8 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
        <Plus className="size-5 text-neutral-700" strokeWidth={1.75} />
      </div>
      <Heart className="size-6 text-neutral-400" strokeWidth={1.5} />
      <User className="size-6 text-neutral-400" strokeWidth={1.5} />
    </nav>
  );
}

/**
 * Threads phone chrome. Pass `posts` to fill the feed, or compose with
 * `<ThreadsPost post={...} />` as children.
 *
 * @example
 * <PhoneFrame>
 *   <ThreadsUI
 *     posts={[{
 *       author: "you",
 *       text: "Hook for the feed",
 *       media: ["/slides/1.jpg", "/slides/2.jpg"],
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
}: {
  posts?: ThreadsPostData[];
  children?: ReactNode;
  className?: string;
  /** Controlled media frame index for the first post with media */
  mediaIndex?: number;
  autoplay?: boolean;
  showReplyBar?: boolean;
}) {
  const replyTo = posts[0]?.author ?? "user";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-white text-neutral-950",
        className,
      )}
    >
      <div className="flex h-10 shrink-0 items-end justify-between px-5 pb-1 text-[11px] font-semibold text-neutral-950">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-sm bg-neutral-950/80" />
          <span className="h-2.5 w-5 rounded-[3px] border border-neutral-950/80" />
        </div>
      </div>

      <ThreadsHeader />

      <div className="min-h-0 flex-1 overflow-hidden">
        {children ??
          posts.map((post, i) => (
            <ThreadsPost
              key={post.id ?? `${post.author}-${i}`}
              post={post}
              mediaIndex={i === 0 ? mediaIndex : undefined}
              autoplay={autoplay && i === 0}
              showThreadLine={i < posts.length - 1}
            />
          ))}
      </div>

      {showReplyBar ? <ThreadsReplyBar author={replyTo} /> : null}
      <ThreadsTabBar />
    </div>
  );
}
