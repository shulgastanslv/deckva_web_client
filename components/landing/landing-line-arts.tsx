/**
 * AlignCanvas-style thematic line arts for landing feature cards.
 * Thin stroke, soft isometric wireframes — sit inside ArtWell gray wells.
 */
import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

const STROKE = "#8A8A8A";
const STROKE_SOFT = "#B0B0B0";
const FILL_SOFT = "rgba(255,255,255,0.72)";

function Frame({
  className,
  children,
  viewBox = "0 0 280 200",
}: {
  className?: string;
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full max-h-[11.5rem] max-w-[16rem] p-5 sm:max-h-[13rem] sm:p-7", className)}
    >
      {children}
    </svg>
  );
}

function CardFace(props: SVGProps<SVGRectElement>) {
  return (
    <rect
      rx="10"
      fill={FILL_SOFT}
      stroke={STROKE}
      strokeWidth="1.5"
      {...props}
    />
  );
}

/** Topic seed → ordered slides (sequence 01). */
export function SubjectEnoughArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      {/* isometric tiles on a plane */}
      <path d="M40 148 L140 188 L240 148 L140 108 Z" stroke={STROKE_SOFT} strokeWidth="1.25" />
      <g transform="translate(78 62)">
        <path d="M0 36 L42 18 L84 36 L42 54 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
        <path d="M0 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
        <path d="M84 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
      </g>
      <g transform="translate(128 48)">
        <path d="M0 36 L42 18 L84 36 L42 54 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
        <path d="M0 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
        <path d="M84 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
      </g>
      <g transform="translate(52 86)">
        <path d="M0 36 L42 18 L84 36 L42 54 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
        <path d="M0 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
        <path d="M84 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
      </g>
      <g transform="translate(152 78)">
        <path d="M0 36 L42 18 L84 36 L42 54 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
        <path d="M0 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
        <path d="M84 36 V58 L42 76 V54" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
        <path d="M28 40 h28" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 48 h40" stroke={STROKE_SOFT} strokeWidth="1.25" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

/** Editable unlocked pieces (sequence 02). */
export function NothingLockedArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <CardFace x="78" y="36" width="124" height="128" />
      <rect x="94" y="52" width="92" height="52" rx="8" fill="#EDEDED" stroke={STROKE} strokeWidth="1.35" />
      <path d="M98 120 h84 M98 132 h60" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* floating unlocked pieces */}
      <rect x="36" y="70" width="44" height="28" rx="6" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" transform="rotate(-12 58 84)" />
      <rect x="198" y="58" width="40" height="40" rx="8" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" transform="rotate(14 218 78)" />
      <circle cx="210" cy="140" r="16" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
      <path d="M54 128 L70 144" stroke={STROKE_SOFT} strokeWidth="1.25" strokeDasharray="3 3" />
      <path d="M186 98 L170 112" stroke={STROKE_SOFT} strokeWidth="1.25" strokeDasharray="3 3" />
    </Frame>
  );
}

/** Export / leave with the file (sequence 03) — stack + orbit path. */
export function LeaveWithPostArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <g transform="translate(92 28)">
        <rect x="18" y="0" width="78" height="54" rx="8" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" transform="rotate(-8 57 27)" />
        <rect x="10" y="12" width="78" height="54" rx="8" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" transform="rotate(-3 49 39)" />
        <rect x="0" y="24" width="84" height="58" rx="8" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
        <path d="M16 40 h52 M16 52 h40" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <ellipse cx="140" cy="148" rx="78" ry="22" stroke={STROKE_SOFT} strokeWidth="1.35" strokeDasharray="3 4" />
      <circle cx="198" cy="140" r="5" fill={STROKE} />
    </Frame>
  );
}

/** Cover / type / order edits. */
export function OnTheSlideArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <CardFace x="70" y="28" width="140" height="148" />
      <rect x="86" y="44" width="108" height="64" rx="8" fill="#EAEAEA" stroke={STROKE} strokeWidth="1.35" />
      <path d="M90 128 h80 M90 140 h56 M90 152 h68" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* cursor / edit mark */}
      <path d="M196 86 L214 104 L206 106 L204 114 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
      <circle cx="100" cy="160" r="3" fill={STROKE} />
      <circle cx="116" cy="160" r="3" fill={STROKE_SOFT} />
      <circle cx="132" cy="160" r="3" fill={STROKE_SOFT} />
    </Frame>
  );
}

/** Clean export file. */
export function OnTheWayOutArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="96" y="36" width="88" height="110" rx="12" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
      <path d="M96 60 h88" stroke={STROKE} strokeWidth="1.35" />
      <path d="M112 48 h24" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M112 84 h56 M112 98 h44 M112 112 h52" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="118" y="128" width="44" height="10" rx="5" fill={STROKE} opacity="0.85" />
      {/* zip badge */}
      <rect x="178" y="128" width="46" height="24" rx="12" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
      <path d="M190 140 h22" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
    </Frame>
  );
}

export function LaunchArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <path d="M140 42 L168 118 L140 106 L112 118 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
      <path d="M140 106 V158" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M118 158 h44" stroke={STROKE_SOFT} strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="96" cy="86" r="10" stroke={STROKE} strokeWidth="1.4" />
      <circle cx="184" cy="78" r="7" stroke={STROKE_SOFT} strokeWidth="1.3" />
      <path d="M74 120 h40 M166 128 h42" stroke={STROKE_SOFT} strokeWidth="1.25" strokeLinecap="round" />
    </Frame>
  );
}

export function HowtoArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${64 + i * 52} ${48 + i * 8})`}>
          <CardFace x="0" y="0" width="56" height="72" rx={8} />
          <circle cx="16" cy="18" r="8" stroke={STROKE} strokeWidth="1.4" />
          <path d="M13 18 h6 M16 15 v6" stroke={STROKE} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M12 40 h32 M12 52 h22" stroke={STROKE_SOFT} strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ))}
    </Frame>
  );
}

export function ChecklistArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <CardFace x="68" y="32" width="144" height="140" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(88 ${52 + i * 28})`}>
          <rect x="0" y="0" width="16" height="16" rx="4" stroke={STROKE} strokeWidth="1.4" fill={FILL_SOFT} />
          {i < 3 ? (
            <path d="M4 8 l3 3 l6-7" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
          <path d={`M28 8 h${i === 2 ? 70 : 88}`} stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
    </Frame>
  );
}

export function OfferArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <CardFace x="74" y="34" width="132" height="136" />
      <circle cx="140" cy="78" r="22" stroke={STROKE} strokeWidth="1.5" fill={FILL_SOFT} />
      <path d="M140 66 v24 M130 78 h20" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M94 120 h92 M100 136 h56" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="112" y="148" width="56" height="12" rx="6" fill={STROKE} opacity="0.8" />
    </Frame>
  );
}

export function ReviewArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <CardFace x="70" y="36" width="140" height="132" />
      <path
        d="M100 78 l12 8 14-18 12 18 14-10"
        stroke={STROKE}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M92 118 h96 M100 134 h70" stroke={STROKE_SOFT} strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="108" cy="152" r="5" fill={STROKE} />
      <circle cx="124" cy="152" r="5" fill={STROKE} />
      <circle cx="140" cy="152" r="5" fill={STROKE} />
      <circle cx="156" cy="152" r="5" stroke={STROKE} strokeWidth="1.3" />
      <circle cx="172" cy="152" r="5" stroke={STROKE_SOFT} strokeWidth="1.2" />
    </Frame>
  );
}

export function AnnouncementArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="108" y="40" width="64" height="88" rx="10" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
      <path d="M120 58 h40 M120 72 h28" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M140 128 v20" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M122 148 h36" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* megaphone / rings */}
      <path d="M188 70 a34 34 0 0 1 0 48" stroke={STROKE_SOFT} strokeWidth="1.3" />
      <path d="M200 60 a48 48 0 0 1 0 68" stroke={STROKE_SOFT} strokeWidth="1.2" opacity="0.7" />
      <path d="M78 70 a34 34 0 0 0 0 48" stroke={STROKE_SOFT} strokeWidth="1.3" />
    </Frame>
  );
}

export function RatioArt({
  ratio,
  className,
}: {
  ratio: "4:5" | "1:1" | "9:16" | "16:9";
  className?: string;
}) {
  const frames: Record<typeof ratio, { w: number; h: number }> = {
    "4:5": { w: 96, h: 120 },
    "1:1": { w: 108, h: 108 },
    "9:16": { w: 78, h: 138 },
    "16:9": { w: 148, h: 84 },
  };
  const { w, h } = frames[ratio];
  const x = (280 - w) / 2;
  const y = (200 - h) / 2;
  return (
    <Frame className={className}>
      <rect x={x} y={y} width={w} height={h} rx="12" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
      <rect x={x + 12} y={y + 14} width={w - 24} height={h * 0.42} rx="8" fill="#EBEBEB" stroke={STROKE_SOFT} strokeWidth="1.25" />
      <path
        d={`M${x + 14} ${y + h * 0.58} h${w - 36} M${x + 14} ${y + h * 0.68} h${w - 52}`}
        stroke={STROKE}
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </Frame>
  );
}

export function ShapeArt({
  kind,
  className,
}: {
  kind: "story" | "tips" | "compare" | "series" | "offer" | "quote" | "list" | "faq";
  className?: string;
}) {
  if (kind === "story") {
    return (
      <Frame className={className} viewBox="0 0 160 120">
        <path d="M20 90 C40 40 60 40 80 70 C100 100 120 90 140 50" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="28" cy="82" r="5" fill={STROKE} />
        <circle cx="80" cy="70" r="5" fill={STROKE} />
        <circle cx="136" cy="52" r="5" fill={STROKE} />
      </Frame>
    );
  }
  if (kind === "tips") {
    return (
      <Frame className={className} viewBox="0 0 160 120">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${28 + i * 40} 28)`}>
            <rect x="0" y="0" width="28" height="64" rx="6" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
            <circle cx="14" cy="16" r="5" stroke={STROKE} strokeWidth="1.3" />
          </g>
        ))}
      </Frame>
    );
  }
  if (kind === "compare") {
    return (
      <Frame className={className} viewBox="0 0 160 120">
        <rect x="18" y="28" width="52" height="68" rx="8" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
        <rect x="90" y="28" width="52" height="68" rx="8" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
        <path d="M72 62 h16" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M82 56 l8 6 -8 6" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </Frame>
    );
  }
  if (kind === "series") {
    return (
      <Frame className={className} viewBox="0 0 160 120">
        <rect x="24" y="36" width="44" height="56" rx="7" fill={FILL_SOFT} stroke={STROKE_SOFT} strokeWidth="1.3" />
        <rect x="58" y="30" width="44" height="56" rx="7" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
        <rect x="92" y="24" width="44" height="56" rx="7" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
      </Frame>
    );
  }
  if (kind === "offer") return <OfferArt className={className} />;
  if (kind === "quote") {
    return (
      <Frame className={className} viewBox="0 0 160 120">
        <path d="M42 44 h28 v22 h-16 c0 12 8 18 16 22" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 44 h28 v22 h-16 c0 12 8 18 16 22" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 96 h80" stroke={STROKE_SOFT} strokeWidth="1.3" strokeLinecap="round" />
      </Frame>
    );
  }
  if (kind === "list") {
    return (
      <Frame className={className} viewBox="0 0 160 120">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(36 ${30 + i * 28})`}>
            <circle cx="8" cy="8" r="8" stroke={STROKE} strokeWidth="1.4" />
            <path d={`M6 8 h4`} stroke={STROKE} strokeWidth="1.3" strokeLinecap="round" />
            <path d="M28 8 h70" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
          </g>
        ))}
      </Frame>
    );
  }
  return (
    <Frame className={className} viewBox="0 0 160 120">
      <rect x="28" y="24" width="104" height="36" rx="10" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
      <path d="M44 42 h72" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="28" y="72" width="104" height="28" rx="10" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
      <path d="M44 86 h56" stroke={STROKE_SOFT} strokeWidth="1.3" strokeLinecap="round" />
    </Frame>
  );
}

export function RemoveBgArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="58" y="36" width="164" height="128" rx="14" fill="#E8E8E8" stroke={STROKE_SOFT} strokeWidth="1.2" strokeDasharray="4 4" />
      <path
        d="M118 148 C118 100 138 72 160 72 C182 72 196 96 196 124 C196 148 178 156 160 148 C148 156 118 156 118 148 Z"
        fill={FILL_SOFT}
        stroke={STROKE}
        strokeWidth="1.6"
      />
      <circle cx="160" cy="96" r="14" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.5" />
      <path d="M72 56 l16 16 M88 56 l-16 16" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </Frame>
  );
}

export function MagicLayerArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="86" y="44" width="108" height="78" rx="10" fill={FILL_SOFT} stroke={STROKE_SOFT} strokeWidth="1.3" transform="translate(10 -14) rotate(6 140 83)" />
      <rect x="86" y="44" width="108" height="78" rx="10" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" transform="translate(0 0)" />
      <rect x="86" y="44" width="108" height="78" rx="10" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" transform="translate(-12 16) rotate(-5 140 83)" />
      <path d="M96 132 h60" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="200" cy="70" r="4" fill={STROKE} />
      <circle cx="74" cy="118" r="3" fill={STROKE_SOFT} />
    </Frame>
  );
}

export function UpscaleArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="54" y="70" width="72" height="72" rx="10" fill={FILL_SOFT} stroke={STROKE_SOFT} strokeWidth="1.35" />
      <rect x="118" y="36" width="108" height="108" rx="12" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
      <path d="M134 72 h48 M158 48 v48" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M96 96 L126 66" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M114 66 h12 v12" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function TopicArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="56" y="62" width="168" height="56" rx="28" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.6" />
      <circle cx="84" cy="90" r="12" stroke={STROKE} strokeWidth="1.4" />
      <path d="M108 82 h88 M108 98 h64" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M140 42 v12 M140 126 v12 M92 48 l8 10 M188 48 l-8 10" stroke={STROKE_SOFT} strokeWidth="1.3" strokeLinecap="round" />
    </Frame>
  );
}

export function SlidesArt({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      {/* circular carousel of panels — like AlignCanvas 02 */}
      <g transform="translate(140 100)">
        {[
          { x: -70, y: -10, r: -28 },
          { x: -28, y: -46, r: -12 },
          { x: 22, y: -48, r: 10 },
          { x: 58, y: -8, r: 26 },
          { x: -6, y: 8, r: 0 },
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
            <rect
              x="-22"
              y="-34"
              width="44"
              height="68"
              rx="8"
              fill={FILL_SOFT}
              stroke={STROKE}
              strokeWidth={i === 4 ? 1.8 : 1.35}
            />
          </g>
        ))}
      </g>
    </Frame>
  );
}

export function FileArt({ className }: { className?: string }) {
  return <LeaveWithPostArt className={className} />;
}

export const JOB_ARTS = {
  Launch: LaunchArt,
  "How-to": HowtoArt,
  Checklist: ChecklistArt,
  Offer: OfferArt,
  Review: ReviewArt,
  Announcement: AnnouncementArt,
} as const;
