"use client";

import { cn } from "@/lib/utils";
import { landMuted, landSerif } from "@/components/landing/landing-shell";

const STEPS = [
  {
    title: "Write the topic",
    text: "One sentence is enough. Deckva lays the slides out in order.",
    tone: "bg-[#FFF6C8] text-[#050038] dark:bg-muted/40 dark:text-foreground",
  },
  {
    title: "Shape the slides",
    text: "Rewrite a line, swap the cover, move a frame. Nothing is locked.",
    tone: "bg-[#E8EEFF] text-[#050038] dark:bg-muted/40 dark:text-foreground",
  },
  {
    title: "Download the post",
    text: "PNG of one slide, or a ZIP of the set. No watermark on the way out.",
    tone: "bg-[#F0F0EC] text-[#050038] dark:bg-muted/40 dark:text-foreground",
  },
] as const;

export function HowItWorks() {
  return (
    <div className="mx-auto w-full max-w-[960px]">
      <h2
        className={cn(
          landSerif,
          "mx-auto max-w-[16ch] text-center text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[3.5rem]",
        )}
      >
        From one line to a finished post
      </h2>
      <p className={cn(landMuted, "mx-auto mt-5 max-w-md text-center")}>
        Still one project — topic, slides, and the file you publish.
      </p>

      <ul className="mt-12 grid gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4">
        {STEPS.map(({ title, text, tone }) => (
          <li
            key={title}
            className={cn(
              "flex min-h-[200px] flex-col justify-between rounded-[1.5rem] p-6 sm:min-h-[220px] sm:rounded-[1.75rem] sm:p-7",
              tone,
            )}
          >
            <h3
              className={cn(
                landSerif,
                "text-2xl leading-tight sm:text-[1.65rem]",
              )}
            >
              {title}
            </h3>
            <p className="mt-8 text-[15px] leading-relaxed opacity-70">
              {text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
