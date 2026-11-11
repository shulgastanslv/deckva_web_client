"use client";

import type { ReactNode } from "react";
import type { StudioTool, StudioToolId } from "@/lib/studio/tools-catalog";
import { cn } from "@/lib/utils";

/**
 * Soft rounded plugin marks — flat shapes with consistent corner radii.
 */

function Tile({
  className,
  fill,
  children,
}: {
  className?: string;
  fill: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block", className)}
      aria-hidden
    >
      <rect width="40" height="40" rx="12" fill={fill} />
      {children}
    </svg>
  );
}

/** Stacked device frames */
function MockupsMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#111827">
      <rect x="10" y="7" width="14" height="24" rx="3.5" fill="#374151" />
      <rect x="12" y="9" width="10" height="16" rx="2" fill="#2F5BFF" />
      <rect x="14" y="27" width="6" height="1.5" rx="0.75" fill="#9CA3AF" />
      <rect x="18" y="10" width="14" height="24" rx="3.5" fill="#1F2937" />
      <rect x="20" y="12" width="10" height="16" rx="2" fill="#60A5FA" />
      <rect x="22" y="30" width="6" height="1.5" rx="0.75" fill="#D1D5DB" />
    </Tile>
  );
}

/** Orange document tile */
function SlidesFromTextMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#F97316">
      <rect x="9" y="8" width="22" height="24" rx="4" fill="#FFF7ED" />
      <rect x="12" y="12" width="12" height="2" rx="1" fill="#FB923C" />
      <rect x="12" y="17" width="16" height="2" rx="1" fill="#FDBA74" />
      <rect x="12" y="22" width="10" height="2" rx="1" fill="#FDBA74" />
      <text
        x="20"
        y="30.5"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#9A3412"
        letterSpacing="0.4"
      >
        TXT
      </text>
    </Tile>
  );
}

/** Black number badge */
function SlideNumberMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#0A0A0A">
      <rect x="8" y="8" width="24" height="24" rx="7" fill="#171717" />
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        rx="7"
        fill="none"
        stroke="#3F3F46"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#FAFAFA"
      >
        01
      </text>
    </Tile>
  );
}

/** Blue @ handle mark */
function AuthorMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#1D4ED8">
      <rect x="10" y="10" width="20" height="20" rx="6" fill="#2563EB" />
      <text
        x="20"
        y="24.5"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="white"
      >
        @
      </text>
    </Tile>
  );
}

/** Colorful plus grid */
function SwipeCueMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#F8FAFC">
      <rect x="9" y="13" width="4" height="2" rx="1" fill="#EF4444" />
      <rect x="11" y="9" width="2" height="10" rx="1" fill="#EF4444" />
      <rect x="13" y="13" width="4" height="2" rx="1" fill="#EF4444" />

      <rect x="21" y="13" width="4" height="2" rx="1" fill="#2F5BFF" />
      <rect x="23" y="9" width="2" height="10" rx="1" fill="#2F5BFF" />
      <rect x="25" y="13" width="4" height="2" rx="1" fill="#2F5BFF" />

      <rect x="9" y="25" width="4" height="2" rx="1" fill="#22C55E" />
      <rect x="11" y="21" width="2" height="10" rx="1" fill="#22C55E" />
      <rect x="13" y="25" width="4" height="2" rx="1" fill="#22C55E" />

      <rect x="21" y="25" width="4" height="2" rx="1" fill="#F59E0B" />
      <rect x="23" y="21" width="2" height="10" rx="1" fill="#F59E0B" />
      <rect x="25" y="25" width="4" height="2" rx="1" fill="#F59E0B" />
    </Tile>
  );
}

/** Split black / white with soft dots */
function ProgressDotsMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#111827">
      <rect x="0" y="0" width="20" height="40" fill="#0B0B0B" />
      <rect x="20" y="0" width="20" height="40" fill="#F4F4F5" />
      <rect x="9" y="17" width="6" height="6" rx="2" fill="#2F5BFF" />
      <rect x="17" y="17" width="6" height="6" rx="2" fill="#A1A1AA" />
      <rect x="25" y="17" width="6" height="6" rx="2" fill="#18181B" />
    </Tile>
  );
}

/** A → B with soft arrow */
function FindReplaceMark({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#EA580C">
      <text
        x="11"
        y="24"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="white"
      >
        A
      </text>
      <path
        d="M16 20h8M22 16l4 4-4 4"
        fill="none"
        stroke="#FED7AA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="30"
        y="24"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="white"
      >
        B
      </text>
    </Tile>
  );
}

function ExtraBars({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#0F172A">
      <rect x="8" y="10" width="24" height="6" rx="3" fill="#22D3EE" />
      <rect x="8" y="18" width="16" height="6" rx="3" fill="#F43F5E" />
      <rect x="8" y="26" width="20" height="6" rx="3" fill="#A78BFA" />
    </Tile>
  );
}

function ExtraBlocks({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#1E293B">
      <rect x="8" y="8" width="12" height="12" rx="3.5" fill="#94A3B8" />
      <rect x="22" y="8" width="10" height="10" rx="3" fill="#64748B" />
      <rect x="8" y="22" width="10" height="10" rx="3" fill="#CBD5E1" />
      <rect x="20" y="20" width="12" height="12" rx="3.5" fill="#475569" />
    </Tile>
  );
}

function ExtraGeo({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#FEF3C7">
      <path
        d="M10.5 28.5 L20 11.5 L29.5 28.5 Z"
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="24" y="8" width="8" height="8" rx="2.5" fill="#2F5BFF" />
    </Tile>
  );
}

function ExtraGrid({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#F1F5F9">
      <rect x="8" y="8" width="10" height="10" rx="3" fill="#334155" />
      <rect x="22" y="8" width="10" height="10" rx="3" fill="#94A3B8" />
      <rect x="8" y="22" width="10" height="10" rx="3" fill="#94A3B8" />
      <rect x="22" y="22" width="10" height="10" rx="3" fill="#0F172A" />
    </Tile>
  );
}

function ExtraStripe({ className }: { className?: string }) {
  return (
    <Tile className={className} fill="#111827">
      <rect x="4" y="4" width="32" height="7" rx="3.5" fill="#EF4444" />
      <rect x="4" y="12.5" width="32" height="7" rx="3.5" fill="#F59E0B" />
      <rect x="4" y="21" width="32" height="7" rx="3.5" fill="#22C55E" />
      <rect x="4" y="29.5" width="32" height="7" rx="3.5" fill="#2F5BFF" />
    </Tile>
  );
}

const MARKS: Record<StudioToolId, (props: { className?: string }) => ReactNode> = {
  mockups: MockupsMark,
  "slides-from-text": SlidesFromTextMark,
  "slide-number": SlideNumberMark,
  author: AuthorMark,
  "swipe-cue": SwipeCueMark,
  "progress-dots": ProgressDotsMark,
  "find-replace": FindReplaceMark,
};

const BANNER_EXTRAS = [ExtraBars, ExtraBlocks, ExtraGeo, ExtraGrid, ExtraStripe] as const;

export function ToolAvatar({
  tool,
  size = "md",
  className,
}: {
  tool: StudioTool;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const Mark = MARKS[tool.id];
  const box =
    size === "sm"
      ? "size-7"
      : size === "lg"
        ? "size-14"
        : size === "xl"
          ? "size-16"
          : "size-10";

  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden rounded-2xl", box, className)} aria-hidden>
      <Mark className="size-full" />
    </span>
  );
}

export function ToolAvatarTile({
  tool,
  className,
}: {
  tool: StudioTool;
  className?: string;
}) {
  const Mark = MARKS[tool.id];
  return (
    <div className={cn("aspect-square overflow-hidden rounded-2xl", className)}>
      <Mark className="size-full" />
    </div>
  );
}

/** Dense dark collage — in-flow grid that bleeds past the card clip. */
export function ToolsBannerCollage({ className }: { className?: string }) {
  const toolIds = Object.keys(MARKS) as StudioToolId[];
  const marks = [
    ...toolIds.map((id) => ({ key: id, Mark: MARKS[id] })),
    ...BANNER_EXTRAS.map((Extra, index) => ({ key: `extra-${index}`, Mark: Extra })),
  ];

  const dense = Array.from({ length: 12 }, (_, index) => {
    const item = marks[index % marks.length]!;
    const Mark = item.Mark;
    return (
      <div
        key={`${item.key}-${index}`}
        className="aspect-square overflow-hidden rounded-[10px] bg-zinc-800"
      >
        <Mark />
      </div>
    );
  });

  return (
    <div className={cn("bg-[#1C1C1E]", className)} aria-hidden>
      {/* Negative margins push tiles past the clip edges (top / sides). */}
      <div className="-mx-2 -mt-4 mb-0 grid grid-cols-4 gap-1.5 p-2">
        {dense}
      </div>
    </div>
  );
}
