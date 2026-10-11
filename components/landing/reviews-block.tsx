"use client";

import { useState } from "react";

const PHOTOS = [
  "/threads/function.png",
  "/threads/gotoit.png",
  "/threads/lua.png",
  "/threads/memcashed.png",
  "/threads/rainbow.png",
  "/threads/redis.png",
  "/threads/redis2.png",
  "/threads/vlan.png",
  "/threads/yandexmap.png",
] as const;

const PINS = [
  {
    name: "theshulya",
    time: "2h",
    views: "186K",
    comment: "Cover, middle, ending. I posted the carousel as it came out.",
    aspect: "aspect-[3/4]",
    focus: "object-left",
  },
  {
    name: "theshulya",
    time: "5h",
    views: "42.1K",
    comment: "Launch thread. The frames were already in order.",
    aspect: "aspect-square",
    focus: "object-center",
  },
  {
    name: "theshulya",
    time: "1d",
    views: "91K",
    comment: "One story, and this feed actually got the views.",
    aspect: "aspect-[4/5]",
    focus: "object-center",
  },
  {
    name: "theshulya",
    time: "1d",
    views: "128K",
    comment: "No watermark. The views showed up overnight.",
    aspect: "aspect-[3/4]",
    focus: "object-right",
  },
  {
    name: "theshulya",
    time: "2d",
    views: "240K",
    comment: "I stopped building slides by hand. This is the result.",
    aspect: "aspect-[4/5]",
  },
  {
    name: "theshulya",
    time: "2d",
    views: "64K",
    comment: "The canvas was the post. Exported and published.",
    aspect: "aspect-square",
  },
  {
    name: "theshulya",
    time: "3d",
    views: "18.6K",
    comment: "Replaced the Sunday layout with one prompt.",
    aspect: "aspect-[3/4]",
  },
  {
    name: "theshulya",
    time: "4d",
    views: "33K",
    comment: "Twelve slides before lunch. The order held.",
    aspect: "aspect-[4/5]",
  },
  {
    name: "theshulya",
    time: "5d",
    views: "512K",
    comment: "Icons on the cover. I never left the studio.",
    aspect: "aspect-[3/4]",
  },
  {
    name: "theshulya",
    time: "6d",
    views: "77.4K",
    comment: "The ZIP went straight into the thread.",
    aspect: "aspect-square",
  },
  {
    name: "theshulya",
    time: "1w",
    views: "29K",
    comment: "Same story, shorter caption. Still a swipe.",
    aspect: "aspect-[4/5]",
  },
  {
    name: "theshulya",
    time: "1w",
    views: "154K",
    comment: "Free export. The views match what I saw on the canvas.",
    aspect: "aspect-[3/4]",
  },
] as const;

const PREVIEW = 6;

export function ReviewsBlock() {
  const [open, setOpen] = useState(false);
  const visible = open ? PINS : PINS.slice(0, PREVIEW);

  return (
    <section id="reviews" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-5 sm:px-6 bg-transparent">
      <div className="rounded-[2rem] px-4 py-5 sm:rounded-[2.4rem] sm:px-6 sm:py-6">
        <p className="text-sm font-bold tracking-wide text-[#2f5bff]">Reviews</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
          Threads carousels people posted
        </h2>

        <ul className="mt-4 columns-1 gap-3 min-[480px]:columns-2 lg:columns-3">
          {visible.map((pin, index) => (
            <li key={index} className="mb-3 break-inside-avoid">
              <article className="overflow-hidden rounded-2xl bg-white text-neutral-900">
                <div className="p-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={PHOTOS[index % PHOTOS.length]}
                      alt=""
                      className="size-8 rounded-full object-cover"
                    />
                    <p className="min-w-0 text-[13px] leading-none">
                      <span className="font-semibold">{pin.name}</span>
                      <span className="text-muted-foreground"> · {pin.time}</span>
                    </p>
                  </div>
                  <div className={`relative mt-2 overflow-hidden rounded-xl ${pin.aspect}`}>
                    <img
                      src={PHOTOS[index % PHOTOS.length]}
                      alt=""
                      className={`absolute inset-0 h-full w-full object-cover object-top ${"focus" in pin ? pin.focus : ""}`}
                    />
                    <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
                      <span className="size-1.5 rounded-full bg-white" />
                      <span className="size-1.5 rounded-full bg-white/45" />
                      <span className="size-1.5 rounded-full bg-white/45" />
                    </div>
                  </div>
                  <p className="mt-2 text-[13px] text-neutral-500">{pin.views} views</p>
                </div>
                <p className="border-t border-neutral-100 px-2.5 py-2.5 text-[13px] leading-snug">
                  “{pin.comment}”
                </p>
              </article>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-2 inline-flex h-12 items-center rounded-full bg-foreground px-4 text-[13px] font-semibold text-background"
        >
          {open ? "Show less" : "Show more"}
        </button>
      </div>
    </section>
  );
}
