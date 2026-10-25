import type { ReactElement, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Miro-like micro-illustrations for studio starters.
 * Soft pastels + simple geometry — not badge icons.
 */
const INK = "#14151c";
const LINE = "#c5c8d4";
const WHITE = "#ffffff";
const BLUE = "#7b8cff";
const BLUE_DK = "#2f5bff";
const BLUE_SOFT = "#c9d4ff";
const YELLOW = "#f5d56a";
const CORAL = "#f3a89a";
const GREEN = "#8fd4a8";
const LILAC = "#c4b5f5";
const PEACH = "#f5c9a8";
const SKY = "#9ec9f5";

export type StudioIconName =
  | "fire"
  | "layers"
  | "list"
  | "chart"
  | "trophy"
  | "rocket"
  | "image"
  | "message"
  | "check"
  | "plus"
  | "wand"
  | "carousel"
  | "pro";

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function Scene({
  children,
  className,
  title,
  viewBox = "0 0 160 128",
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={cn("size-full", className)}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Bad → good slide pair */
export function StudioIconFire(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="28" y="30" width="44" height="58" rx="9" fill={WHITE} />
      <rect x="36" y="42" width="28" height="5" rx="2.5" fill={CORAL} />
      <rect x="36" y="52" width="20" height="3.5" rx="1.75" fill={LINE} />
      <rect x="36" y="60" width="24" height="3.5" rx="1.75" fill={LINE} />
      <path
        d="M40 70L52 82M52 70L40 82"
        stroke={CORAL}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="88" y="30" width="44" height="58" rx="9" fill={WHITE} />
      <rect x="96" y="42" width="28" height="5" rx="2.5" fill={GREEN} />
      <rect x="96" y="52" width="20" height="3.5" rx="1.75" fill={LINE} />
      <rect x="96" y="60" width="24" height="3.5" rx="1.75" fill={LINE} />
      <path
        d="M98 76L104 82L116 70"
        stroke={GREEN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M76 52H84" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M80 48L84 52L80 56"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Scene>
  );
}

/** Connected step cards */
export function StudioIconLayers(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="22" y="36" width="36" height="28" rx="7" fill={WHITE} />
      <rect x="28" y="44" width="20" height="4" rx="2" fill={INK} />
      <rect x="28" y="52" width="14" height="3" rx="1.5" fill={LINE} />
      <rect x="62" y="24" width="36" height="28" rx="7" fill={BLUE} />
      <rect x="68" y="32" width="20" height="4" rx="2" fill={WHITE} />
      <rect x="68" y="40" width="14" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="62" y="64" width="36" height="28" rx="7" fill={YELLOW} />
      <rect x="68" y="72" width="20" height="4" rx="2" fill={INK} opacity="0.7" />
      <rect x="68" y="80" width="14" height="3" rx="1.5" fill={INK} opacity="0.25" />
      <rect x="102" y="44" width="36" height="28" rx="7" fill={WHITE} />
      <rect x="108" y="52" width="20" height="4" rx="2" fill={INK} />
      <rect x="108" y="60" width="14" height="3" rx="1.5" fill={LINE} />
      <path
        d="M58 50H62M98 38H102M98 78H102"
        stroke={LINE}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Scene>
  );
}

/** Numbered tip rows */
export function StudioIconList(props: IconProps) {
  const rows = [
    { c: BLUE_DK, ink: WHITE, w: 48 },
    { c: YELLOW, ink: INK, w: 42 },
    { c: GREEN, ink: INK, w: 36 },
    { c: LILAC, ink: WHITE, w: 30 },
  ] as const;

  return (
    <Scene {...props}>
      <rect x="36" y="20" width="88" height="88" rx="12" fill={WHITE} />
      {rows.map((row, i) => {
        const y = 32 + i * 18;
        return (
          <g key={i}>
            <rect x="46" y={y} width="14" height="14" rx="4" fill={row.c} />
            <text
              x="53"
              y={y + 10}
              textAnchor="middle"
              fill={row.ink}
              fontSize="8"
              fontWeight="700"
              fontFamily="system-ui,sans-serif"
            >
              {i + 1}
            </text>
            <rect
              x="66"
              y={y + 2}
              width={row.w}
              height="4"
              rx="2"
              fill={INK}
              opacity="0.8"
            />
            <rect
              x="66"
              y={y + 9}
              width={row.w - 12}
              height="3"
              rx="1.5"
              fill={LINE}
            />
          </g>
        );
      })}
    </Scene>
  );
}

/** Big stat + bars */
export function StudioIconChart(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="24" y="26" width="52" height="76" rx="10" fill={WHITE} />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill={BLUE_DK}
        fontSize="20"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        3×
      </text>
      <rect x="36" y="68" width="28" height="4" rx="2" fill={LINE} />
      <rect x="36" y="76" width="20" height="3" rx="1.5" fill={LINE} />
      <rect x="88" y="34" width="12" height="60" rx="4" fill={BLUE_SOFT} />
      <rect x="104" y="50" width="12" height="44" rx="4" fill={BLUE} />
      <rect x="120" y="26" width="12" height="68" rx="4" fill={BLUE_DK} />
      <rect x="136" y="42" width="12" height="52" rx="4" fill={LILAC} />
    </Scene>
  );
}

/** Story beats */
export function StudioIconTrophy(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="22" y="38" width="34" height="44" rx="8" fill={PEACH} />
      <circle cx="39" cy="54" r="7" fill={WHITE} opacity="0.9" />
      <rect x="30" y="66" width="18" height="3" rx="1.5" fill={INK} opacity="0.35" />
      <rect x="63" y="26" width="34" height="44" rx="8" fill={WHITE} />
      <rect x="71" y="38" width="18" height="4" rx="2" fill={INK} />
      <rect x="71" y="46" width="14" height="3" rx="1.5" fill={LINE} />
      <rect x="71" y="54" width="18" height="8" rx="3" fill={YELLOW} />
      <rect x="104" y="38" width="34" height="44" rx="8" fill={GREEN} opacity="0.85" />
      <path
        d="M115 56L120 61L131 50"
        stroke={WHITE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="112" y="68" width="18" height="3" rx="1.5" fill={WHITE} opacity="0.7" />
    </Scene>
  );
}

/** Launch timeline */
export function StudioIconRocket(props: IconProps) {
  const bars = [
    { x: 28, c: YELLOW, h: 28 },
    { x: 52, c: BLUE, h: 40 },
    { x: 76, c: LILAC, h: 34 },
    { x: 100, c: CORAL, h: 48 },
    { x: 124, c: GREEN, h: 36 },
  ] as const;

  return (
    <Scene {...props}>
      <line
        x1="28"
        y1="64"
        x2="140"
        y2="64"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {bars.map((b) => (
        <g key={b.x}>
          <rect
            x={b.x}
            y={64 - b.h}
            width="16"
            height={b.h}
            rx="5"
            fill={b.c}
          />
          <circle
            cx={b.x + 8}
            cy="64"
            r="3.5"
            fill={WHITE}
            stroke={LINE}
            strokeWidth="1.5"
          />
        </g>
      ))}
      <rect x="118" y="18" width="28" height="14" rx="7" fill={BLUE_DK} />
      <path
        d="M128 22L132 25L128 28M132 25H140"
        stroke={WHITE}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Scene>
  );
}

/** Visual frame grid */
export function StudioIconImage(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="24" y="22" width="50" height="40" rx="8" fill={WHITE} />
      <circle cx="36" cy="36" r="5" fill={SKY} />
      <path
        d="M28 54L40 44L48 50L58 42L70 52V54C70 56.2 68.2 58 66 58H32C29.8 58 28 56.2 28 54Z"
        fill={BLUE}
      />
      <rect x="86" y="22" width="50" height="40" rx="8" fill={LILAC} />
      <rect x="96" y="34" width="30" height="5" rx="2.5" fill={WHITE} opacity="0.9" />
      <rect x="96" y="44" width="20" height="4" rx="2" fill={WHITE} opacity="0.55" />
      <rect x="24" y="70" width="50" height="36" rx="8" fill={YELLOW} />
      <rect x="34" y="84" width="30" height="5" rx="2.5" fill={INK} opacity="0.45" />
      <rect x="86" y="70" width="50" height="36" rx="8" fill={WHITE} />
      <rect x="96" y="80" width="30" height="4" rx="2" fill={INK} />
      <rect x="96" y="88" width="18" height="3" rx="1.5" fill={LINE} />
    </Scene>
  );
}

/** Thread → slide stack */
export function StudioIconMessage(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="18" y="34" width="52" height="48" rx="12" fill={WHITE} />
      <circle cx="32" cy="48" r="6" fill={BLUE_SOFT} />
      <rect x="42" y="44" width="20" height="3.5" rx="1.75" fill={INK} />
      <rect x="42" y="51" width="14" height="3" rx="1.5" fill={LINE} />
      <rect x="28" y="62" width="32" height="10" rx="4" fill={LINE} opacity="0.55" />
      <path d="M78 58H90" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M86 52L94 58L86 64"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="100" y="28" width="28" height="36" rx="6" fill={BLUE_SOFT} />
      <rect x="112" y="40" width="28" height="36" rx="6" fill={WHITE} />
      <rect x="124" y="52" width="28" height="36" rx="6" fill={BLUE_DK} />
      <rect x="130" y="62" width="16" height="3" rx="1.5" fill={WHITE} />
      <rect x="130" y="69" width="12" height="2.5" rx="1.25" fill={BLUE_SOFT} />
    </Scene>
  );
}

/** Checklist slide */
export function StudioIconCheck(props: IconProps) {
  const rows = [
    { y: 48, done: true },
    { y: 64, done: true },
    { y: 80, done: false },
    { y: 96, done: false },
  ] as const;

  return (
    <Scene {...props}>
      <rect x="40" y="18" width="80" height="92" rx="12" fill={WHITE} />
      <rect x="52" y="30" width="48" height="6" rx="3" fill={INK} />
      {rows.map((row) => (
        <g key={row.y}>
          <rect
            x="52"
            y={row.y}
            width="12"
            height="12"
            rx="3.5"
            fill={row.done ? GREEN : LINE}
          />
          {row.done ? (
            <path
              d={`M55 ${row.y + 6}L57.5 ${row.y + 8.5}L61 ${row.y + 4}`}
              stroke={WHITE}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          <rect
            x="70"
            y={row.y + 3}
            width={row.done ? 36 : 28}
            height="5"
            rx="2.5"
            fill={row.done ? INK : LINE}
            opacity={row.done ? 0.75 : 1}
          />
        </g>
      ))}
    </Scene>
  );
}

export function StudioIconPlus(props: IconProps) {
  return (
    <Scene {...props}>
      <path
        d="M80 44V84M60 64H100"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
        className="dark:stroke-foreground"
      />
    </Scene>
  );
}

export function StudioIconWand(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="48" y="28" width="64" height="72" rx="12" fill={WHITE} />
      <path
        d="M68 78L92 48"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M92 36V42M92 36H98M92 36L98 30"
        stroke={BLUE_DK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="62" cy="44" r="4" fill={YELLOW} />
      <circle cx="108" cy="70" r="3" fill={LILAC} />
    </Scene>
  );
}

export function StudioIconCarousel(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="28" y="32" width="32" height="56" rx="8" fill={BLUE_SOFT} />
      <rect x="48" y="26" width="36" height="64" rx="9" fill={WHITE} />
      <rect x="56" y="40" width="20" height="4" rx="2" fill={INK} />
      <rect x="56" y="50" width="14" height="3" rx="1.5" fill={LINE} />
      <rect x="56" y="60" width="20" height="14" rx="4" fill={BLUE} />
      <rect x="72" y="32" width="32" height="56" rx="8" fill={LILAC} opacity="0.85" />
      <rect x="100" y="38" width="28" height="48" rx="7" fill={YELLOW} opacity="0.9" />
    </Scene>
  );
}

/** Pro — stacked coins for upgrade dialog */
export function StudioIconPro(props: IconProps) {
  return (
    <Scene viewBox="0 0 200 140" {...props}>
      {/* soft ground */}
      <ellipse cx="100" cy="118" rx="72" ry="10" fill={BLUE_SOFT} opacity="0.55" />

      {/* back coin — green */}
      <circle cx="58" cy="76" r="34" fill={GREEN} />
      <circle cx="58" cy="76" r="26" fill="#7bc498" />
      <circle cx="58" cy="76" r="22" fill={GREEN} />
      <text
        x="58"
        y="85"
        textAnchor="middle"
        fill={INK}
        fontSize="26"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        $
      </text>

      {/* front coin — yellow */}
      <circle cx="112" cy="56" r="46" fill={YELLOW} />
      <circle cx="112" cy="56" r="36" fill="#f0c84a" />
      <circle cx="112" cy="56" r="30" fill={YELLOW} />
      <text
        x="112"
        y="69"
        textAnchor="middle"
        fill={INK}
        fontSize="38"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        $
      </text>

      {/* small coin — brand blue */}
      <circle cx="156" cy="96" r="20" fill={BLUE_SOFT} />
      <circle cx="156" cy="96" r="15" fill={BLUE_DK} />
      <text
        x="156"
        y="102"
        textAnchor="middle"
        fill={WHITE}
        fontSize="15"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        $
      </text>

      {/* spark accents */}
      <path
        d="M148 28C148 31.3 150.7 34 154 34C150.7 34 148 36.7 148 40C148 36.7 145.3 34 142 34C145.3 34 148 31.3 148 28Z"
        fill={CORAL}
      />
      <circle cx="42" cy="42" r="4" fill={LILAC} />
    </Scene>
  );
}

const ICONS: Record<StudioIconName, (props: IconProps) => ReactElement> = {
  fire: StudioIconFire,
  layers: StudioIconLayers,
  list: StudioIconList,
  chart: StudioIconChart,
  trophy: StudioIconTrophy,
  rocket: StudioIconRocket,
  image: StudioIconImage,
  message: StudioIconMessage,
  check: StudioIconCheck,
  plus: StudioIconPlus,
  wand: StudioIconWand,
  carousel: StudioIconCarousel,
  pro: StudioIconPro,
};

export function StudioIcon({
  name,
  className,
  ...props
}: IconProps & { name: StudioIconName }) {
  const Comp = ICONS[name];
  return <Comp className={className} {...props} />;
}
