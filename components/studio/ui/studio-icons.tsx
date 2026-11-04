import type { ReactElement, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Studio micro-illustrations — soft multi-hue palette, one visual scale.
 * Soft fills read on tile bg #ebeaf2 / dark:muted.
 */
const INK = "#1a1b24";
const LINE = "#c8cedd";
const WHITE = "#ffffff";

const BLUE = "#6b86f7";
const BLUE_SOFT = "#d4dcfb";
const CORAL = "#f07a6a";
const CORAL_SOFT = "#fdd9d3";
const TEAL = "#3db8a8";
const TEAL_SOFT = "#d0efe9";
const AMBER = "#e8a23a";
const AMBER_SOFT = "#fce8c4";
const VIOLET = "#8b7cf0";
const VIOLET_SOFT = "#e2ddfb";
const ROSE = "#e86b9a";
const ROSE_SOFT = "#f9d6e4";
const SAGE = "#6aaa78";
const SAGE_SOFT = "#d8ebd9";

/** Shared canvas — every icon uses the same viewBox and visual scale. */
const VIEW = "0 0 160 128";

const MIRO = {
  canvas: '#F1F0F7',
  frame: '#FFFFFF',
  frameBorder: '#E5E3F0',
  line: '#E2E0EC',
  lineDark: '#CBD5E1',
  yellow: '#FDE047',
  yellowDark: '#EAB308',
  purple: '#C4B5FD',
  purpleDark: '#8B5CF6',
  blue: '#93C5FD',
  blueDark: '#3B82F6',
  green: '#86EFAC',
  greenDark: '#22C55E',
  coral: '#FCA5A5',
};

export type StudioIconName =
  | "codeblock"
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
  | "carousel";

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function Scene({
  children,
  className,
  title,
  viewBox = VIEW,
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
export function StudioIconCodeblock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Фоновый холст Miro */}

      {/* Главное окно сниппета */}
      <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.05))">
        <rect x="22" y="22" width="156" height="86" rx="7" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />

        {/* Шапка окна редактора */}
        <path d="M22 29C22 25.134 25.134 22 29 22H171C174.866 22 178 25.134 178 29V38H22V29Z" fill="#F8FAFC" />
        <line x1="22" y1="38" x2="178" y2="38" stroke={MIRO.frameBorder} strokeWidth="1" />

        {/* Точки окна (Mac-style кнопки) */}
        <circle cx="34" cy="30" r="2.5" fill={MIRO.coral} />
        <circle cx="42" cy="30" r="2.5" fill={MIRO.yellow} />
        <circle cx="50" cy="30" r="2.5" fill={MIRO.green} />

        {/* Название вкладки */}
        <rect x="62" y="27" width="28" height="6" rx="2" fill={MIRO.line} />

        {/* Код и синтаксическая подсветка */}
        {/* Строка 1: тег и ключевое слово */}
        <rect x="36" y="48" width="18" height="4" rx="2" fill={MIRO.purpleDark} />
        <rect x="58" y="48" width="34" height="4" rx="2" fill={MIRO.blueDark} />

        {/* Строка 2: отступ, свойства */}
        <rect x="46" y="58" width="24" height="4" rx="2" fill={MIRO.greenDark} />
        <rect x="74" y="58" width="40" height="4" rx="2" fill={MIRO.lineDark} />

        {/* Строка 3: символы скобок и завершение */}
        <rect x="46" y="68" width="32" height="4" rx="2" fill={MIRO.yellowDark} />
        <rect x="82" y="68" width="22" height="4" rx="2" fill={MIRO.line} />

        {/* Строка 4: закрывающий тег */}
        <rect x="36" y="78" width="14" height="4" rx="2" fill={MIRO.purpleDark} />

        {/* Акцентный бейдж языка справа внизу */}
        <rect x="140" y="86" width="30" height="14" rx="3" fill="#EEF2FF" />
        <path d="M148 91L145 93L148 95M162 91L165 93L162 95" stroke={MIRO.purpleDark} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="156" y1="90" x2="154" y2="96" stroke={MIRO.purpleDark} strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}
/** Connected step cards */
export function StudioIconLayers(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="18" y="48" width="34" height="32" rx="8" fill={WHITE} />
      <rect x="24" y="56" width="18" height="4" rx="2" fill={INK} opacity="0.8" />
      <rect x="24" y="64" width="12" height="3" rx="1.5" fill={LINE} />

      <path
        d="M52 64H60"
        stroke={LINE}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      <rect x="60" y="22" width="40" height="32" rx="8" fill={VIOLET_SOFT} />
      <rect x="68" y="30" width="22" height="4" rx="2" fill={VIOLET} />
      <rect x="68" y="38" width="14" height="3" rx="1.5" fill={WHITE} opacity="0.7" />

      <path
        d="M80 54V62"
        stroke={LINE}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      <rect x="60" y="62" width="40" height="32" rx="8" fill={BLUE} />
      <rect x="68" y="70" width="22" height="4" rx="2" fill={WHITE} />
      <rect x="68" y="78" width="14" height="3" rx="1.5" fill={WHITE} opacity="0.55" />

      <path
        d="M100 78H108"
        stroke={LINE}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      <rect x="108" y="48" width="34" height="32" rx="8" fill={WHITE} />
      <rect x="114" y="56" width="18" height="4" rx="2" fill={INK} opacity="0.8" />
      <rect x="114" y="64" width="12" height="3" rx="1.5" fill={LINE} />
    </Scene>
  );
}

/** Numbered tip rows */
export function StudioIconList(props: IconProps) {
  const rows = [
    { c: BLUE, ink: WHITE, w: 52 },
    { c: TEAL, ink: WHITE, w: 44 },
    { c: AMBER, ink: WHITE, w: 38 },
    { c: ROSE, ink: WHITE, w: 30 },
  ] as const;

  return (
    <Scene {...props}>
      <rect x="34" y="18" width="92" height="92" rx="14" fill={WHITE} />
      {rows.map((row, i) => {
        const y = 30 + i * 20;
        return (
          <g key={i}>
            <rect x="44" y={y} width="16" height="16" rx="5" fill={row.c} />
            <text
              x="52"
              y={y + 11.5}
              textAnchor="middle"
              fill={row.ink}
              fontSize="9"
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
              opacity="0.72"
            />
            <rect
              x="66"
              y={y + 10}
              width={Math.max(row.w - 14, 14)}
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
      <rect x="20" y="24" width="52" height="80" rx="12" fill={WHITE} />
      <text
        x="46"
        y="64"
        textAnchor="middle"
        fill={BLUE}
        fontSize="22"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        3×
      </text>
      <rect x="32" y="74" width="28" height="4" rx="2" fill={LINE} />
      <rect x="32" y="82" width="18" height="3" rx="1.5" fill={LINE} />

      <rect x="84" y="64" width="14" height="40" rx="4" fill={AMBER_SOFT} />
      <rect x="102" y="48" width="14" height="56" rx="4" fill={TEAL_SOFT} />
      <rect x="120" y="36" width="14" height="68" rx="4" fill={BLUE_SOFT} />
      <rect x="138" y="28" width="14" height="76" rx="4" fill={VIOLET} />
    </Scene>
  );
}

/** Story beats */
export function StudioIconTrophy(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="18" y="36" width="36" height="56" rx="10" fill={AMBER_SOFT} />
      <circle cx="36" cy="54" r="8" fill={AMBER} />
      <rect x="26" y="70" width="20" height="3" rx="1.5" fill={WHITE} opacity="0.85" />
      <rect x="26" y="78" width="14" height="3" rx="1.5" fill={WHITE} opacity="0.55" />

      <rect x="62" y="24" width="36" height="56" rx="10" fill={WHITE} />
      <rect x="70" y="36" width="20" height="4" rx="2" fill={INK} opacity="0.8" />
      <rect x="70" y="44" width="14" height="3" rx="1.5" fill={LINE} />
      <rect x="70" y="56" width="20" height="12" rx="5" fill={ROSE} />

      <rect x="106" y="36" width="36" height="56" rx="10" fill={TEAL} />
      <path
        d="M116 56L122 62L134 48"
        stroke={WHITE}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="114" y="72" width="20" height="3" rx="1.5" fill={WHITE} opacity="0.75" />
    </Scene>
  );
}

/** Launch timeline */
export function StudioIconRocket(props: IconProps) {
  const bars = [
    { x: 22, c: SAGE_SOFT, h: 26 },
    { x: 46, c: TEAL_SOFT, h: 40 },
    { x: 70, c: BLUE_SOFT, h: 32 },
    { x: 94, c: VIOLET, h: 52 },
    { x: 118, c: CORAL_SOFT, h: 36 },
  ] as const;

  return (
    <Scene {...props}>
      <line
        x1="22"
        y1="88"
        x2="142"
        y2="88"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {bars.map((b) => (
        <g key={b.x}>
          <rect
            x={b.x}
            y={88 - b.h}
            width="16"
            height={b.h}
            rx="5"
            fill={b.c}
          />
          <circle
            cx={b.x + 8}
            cy="88"
            r="3.5"
            fill={WHITE}
            stroke={LINE}
            strokeWidth="1.5"
          />
        </g>
      ))}
      <rect x="108" y="18" width="34" height="16" rx="8" fill={CORAL} />
      <path
        d="M118 23L124 26L118 29M124 26H134"
        stroke={WHITE}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Scene>
  );
}

/** Visual frame grid */
export function StudioIconImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Фоновый холст Miro */}

      {/* Основная карточка изображения (слева) */}
      <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.05))">
        <rect x="24" y="24" width="82" height="82" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        {/* Иллюстрация пейзажа */}
        <rect x="30" y="30" width="70" height="46" rx="4" fill="#E0F2FE" />
        <circle cx="43" cy="42" r="4.5" fill={MIRO.yellow} />
        <path d="M30 68L48 50L60 60L72 47L100 68V76H30V68Z" fill={MIRO.blue} />
        {/* Подпись к изображению */}
        <rect x="32" y="85" width="48" height="4" rx="2" fill={MIRO.lineDark} />
        <rect x="32" y="93" width="28" height="3" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Верхний правый мини-фрейм */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.03))">
        <rect x="114" y="24" width="62" height="38" rx="5" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="120" y="30" width="22" height="26" rx="3" fill={MIRO.purple} opacity="0.5" />
        <rect x="148" y="34" width="22" height="3" rx="1.5" fill={MIRO.lineDark} />
        <rect x="148" y="41" width="16" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="148" y="48" width="12" height="3" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Желтый стикер обратной связи (справа внизу) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))">
        <rect x="118" y="68" width="36" height="36" rx="3" fill={MIRO.yellow} />
        <rect x="124" y="76" width="24" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.75" />
        <rect x="124" y="82" width="18" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.75" />
        <rect x="124" y="88" width="20" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.75" />
      </g>

      {/* Зеленый мини-стикер */}
      <rect x="160" y="76" width="16" height="16" rx="2" fill={MIRO.green} />
    </svg>
  );
}
/** Thread → slide stack */
export function StudioIconMessage(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="16" y="30" width="52" height="60" rx="12" fill={WHITE} />
      <circle cx="32" cy="46" r="7" fill={ROSE_SOFT} />
      <rect x="44" y="42" width="16" height="3.5" rx="1.75" fill={INK} opacity="0.8" />
      <rect x="44" y="50" width="10" height="3" rx="1.5" fill={LINE} />
      <rect x="28" y="64" width="28" height="14" rx="6" fill={ROSE_SOFT} />

      <path
        d="M74 60H84"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M80 54L88 60L80 66"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stacked slides — offset, no messy overlap */}
      <rect x="92" y="26" width="30" height="42" rx="7" fill={BLUE_SOFT} />
      <rect x="104" y="40" width="30" height="42" rx="7" fill={WHITE} />
      <rect x="116" y="54" width="30" height="42" rx="7" fill={BLUE} />
      <rect x="122" y="66" width="16" height="3" rx="1.5" fill={WHITE} />
      <rect x="122" y="74" width="12" height="2.5" rx="1.25" fill={BLUE_SOFT} />
    </Scene>
  );
}

/** Checklist slide */
export function StudioIconCheck(props: IconProps) {
  const rows = [
    { y: 42, done: true, color: TEAL },
    { y: 58, done: true, color: TEAL },
    { y: 74, done: false, color: LINE },
    { y: 90, done: false, color: LINE },
  ] as const;

  return (
    <Scene {...props}>
      <rect x="38" y="16" width="84" height="96" rx="14" fill={WHITE} />
      <rect x="50" y="28" width="52" height="6" rx="3" fill={INK} opacity="0.8" />
      {rows.map((row) => (
        <g key={row.y}>
          <rect
            x="50"
            y={row.y}
            width="14"
            height="14"
            rx="4"
            fill={row.color}
          />
          {row.done ? (
            <path
              d={`M53.5 ${row.y + 7}L56.5 ${row.y + 10}L60.5 ${row.y + 4.5}`}
              stroke={WHITE}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          <rect
            x="70"
            y={row.y + 4}
            width={row.done ? 38 : 28}
            height="5"
            rx="2.5"
            fill={row.done ? INK : LINE}
            opacity={row.done ? 0.72 : 1}
          />
        </g>
      ))}
    </Scene>
  );
}

export function StudioIconPlus(props: IconProps) {
  return (
    <Scene {...props}>
      <svg width="50" height="50" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="70" y="25" width="10" height="100" fill={BLUE_SOFT} />
        <rect x="25" y="80" width="10" height="100" transform="rotate(-90 25 80)" fill={BLUE_SOFT} />
      </svg>

    </Scene>
  );
}

export function StudioIconWand(props: IconProps) {
  return (
    <Scene {...props}>
      <rect x="36" y="20" width="88" height="88" rx="14" fill={WHITE} />
      <path
        d="M56 88L104 40"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M104 28V38M104 28H114M104 28L114 18"
        stroke={VIOLET}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="52" cy="42" r="5" fill={AMBER} />
      <circle cx="112" cy="78" r="4" fill={ROSE} />
      <circle cx="64" cy="70" r="3" fill={TEAL_SOFT} />
    </Scene>
  );
}
export function StudioIconCarousel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>

      {/* Левый слайд (активный) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))">
        <rect x="22" y="24" width="70" height="82" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        {/* Заголовок слайда */}
        <rect x="30" y="34" width="38" height="6" rx="2" fill={MIRO.purpleDark} />
        {/* Строки текста */}
        <rect x="30" y="46" width="54" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="30" y="53" width="46" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="30" y="60" width="34" height="3" rx="1.5" fill={MIRO.line} />
        {/* Заметка-стикер на слайде */}
        <rect x="52" y="72" width="28" height="24" rx="2" fill={MIRO.yellow} />
        <rect x="56" y="78" width="18" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.6" />
        <rect x="56" y="84" width="12" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.6" />
      </g>

      {/* Центральная соединительная стрелка Miro */}
      <path
        d="M96 65C101 65 103 65 107 65"
        stroke={MIRO.purpleDark}
        strokeWidth="1.8"
        strokeDasharray="2.5 2"
        strokeLinecap="round"
      />
      <path
        d="M105 62L108.5 65L105 68"
        stroke={MIRO.purpleDark}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Правый слайд (следующий карточный фрейм) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.03))">
        <rect x="112" y="28" width="66" height="74" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        {/* Медиа-плейсхолдер */}
        <rect x="120" y="37" width="50" height="28" rx="3" fill={MIRO.blue} opacity="0.45" />
        {/* Строки текста */}
        <rect x="120" y="72" width="42" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="120" y="79" width="30" height="3" rx="1.5" fill={MIRO.line} />
      </g>
    </svg>
  );
}

const ICONS: Record<StudioIconName, (props: IconProps) => ReactElement> = {
  codeblock: StudioIconCodeblock,
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
};

export function StudioIcon({
  name,
  className,
  ...props
}: IconProps & { name: StudioIconName }) {
  const Comp = ICONS[name];
  return <Comp className={className} {...props} />;
}
