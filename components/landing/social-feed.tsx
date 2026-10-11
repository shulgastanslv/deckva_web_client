"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

import { ThreadsUI, type ThreadsPostData } from "@/components/landing/threads-ui";

export type FeedSlide = {
  src: string;
  title: string;
  caption: string;
};

const SLIDES = [
  {
    src: "/landing/slide-cover.jpg",
    title: "Finished recursion",
    caption: "One function, one frame.",
  },
  {
    src: "/landing/slide-mid.jpg",
    title: "Hail to the Rainbow",
    caption: "The frames stay in order.",
  },
  {
    src: "/landing/slide-end.jpg",
    title: "How Redis works",
    caption: "Cover, then the explanation.",
  },
];

function useSlide(start = 0, count = SLIDES.length, enabled = true) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(start);

  useEffect(() => {
    if (reduce || !enabled) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 3500);
    return () => window.clearInterval(id);
  }, [reduce, count, enabled]);

  return index;
}

function Dots({ index, count }: { index: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, dot) => (
        <div
          key={dot}
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
            dot === index ? "bg-white" : "bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

function Frame({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative h-full w-full bg-neutral-900">
      <motion.img
        key={src}
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      <div className="absolute bottom-6 left-4 right-4">
        <p className="text-lg font-bold text-white leading-tight drop-shadow-md">
          {title}
        </p>
      </div>
    </div>
  );
}

// --- Instagram Feed Component ---
export function InstagramFeed({
  slides = SLIDES,
  index: controlledIndex,
}: {
  slides?: typeof SLIDES;
  index?: number;
}) {
  const localIndex = useSlide(0, slides.length, controlledIndex === undefined);
  const currentIndex = controlledIndex ?? localIndex;
  const slide = slides[currentIndex];

  return (
    <div className="flex h-full flex-col bg-white text-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden">
             <img src={slide.src} className="h-full w-full object-cover" />
          </div>
          <span className="text-[13px] font-semibold">design_daily</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-neutral-500" />
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        <Frame src={slide.src} title={slide.title} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Dots index={currentIndex} count={slides.length} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 hover:text-red-500 cursor-pointer transition-colors" />
            <MessageCircle className="h-6 w-6 hover:text-blue-500 cursor-pointer transition-colors" />
            <Send className="h-6 w-6 hover:text-green-500 cursor-pointer transition-colors" />
          </div>
          <Bookmark className="h-6 w-6 hover:text-yellow-500 cursor-pointer transition-colors" />
        </div>
        <p className="text-[13px] text-neutral-500">1,240 likes</p>
        <p className="text-[13px] mt-1">
          <span className="font-semibold mr-1">design_daily</span>
          {slide.caption}
        </p>
      </div>
    </div>
  );
}

/** Threads phone feed — `slides` become the post carousel media. */
export function ThreadsFeed({
  slides = SLIDES,
  index: controlledIndex,
  author = "swibp",
  text = "A carousel from one thought. Cover, middle, and ending.",
}: {
  slides?: FeedSlide[];
  index?: number;
  author?: string;
  text?: string;
}) {
  const localIndex = useSlide(0, slides.length, controlledIndex === undefined);
  const currentIndex = controlledIndex ?? localIndex;

  const post: ThreadsPostData = {
    author,
    avatar: slides[0]?.src,
    time: "2h",
    text,
    media: slides.map((s) => s.src),
    likes: 148,
    replies: 33,
    reposts: 8,
  };

  return (
    <ThreadsUI
      posts={[post]}
      mediaIndex={currentIndex}
      autoplay={controlledIndex === undefined}
    />
  );
}
