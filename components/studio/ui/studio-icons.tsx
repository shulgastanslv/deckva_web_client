import type { ReactElement, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

const VIEW = "0 0 160 128";

const MIRO = {
  canvas: '#F1F0F7',
  frame: '#FFFFFF',
  frameBorder: '#E5E3F0',
  line: '#E2E0EC',
  lineDark: '#CBD5E1',
  yellow: '#FDE047',
  yellowDark: '#EAB308',
  blue: '#93C5FD',
  blueSoft: '#93C5FD',
  blueDark: '#3B82F6',
  green: '#86EFAC',
  greenDark: '#22C55E',
  coral: '#FCA5A5',
};

export type StudioIconName =
  | "codeblock"
  | "image"
  | "plus"
  | "idea"
  | "list"
  | "layers";

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

export function StudioIconCodeblock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
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
        <rect x="36" y="48" width="18" height="4" rx="2" fill={MIRO.blueDark} />
        <rect x="58" y="48" width="34" height="4" rx="2" fill={MIRO.blueDark} />

        <rect x="46" y="58" width="24" height="4" rx="2" fill={MIRO.greenDark} />
        <rect x="74" y="58" width="40" height="4" rx="2" fill={MIRO.lineDark} />

        <rect x="46" y="68" width="32" height="4" rx="2" fill={MIRO.yellowDark} />
        <rect x="82" y="68" width="22" height="4" rx="2" fill={MIRO.line} />

        <rect x="36" y="78" width="14" height="4" rx="2" fill={MIRO.blueDark} />

        {/* Акцентный бейдж языка */}
        <rect x="140" y="86" width="30" height="14" rx="3" fill="#EEF2FF" />
        <path d="M148 91L145 93L148 95M162 91L165 93L162 95" stroke={MIRO.blueDark} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="156" y1="90" x2="154" y2="96" stroke={MIRO.blueDark} strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function StudioIconImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Основная карточка изображения (слева) */}
      <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.05))">
        <rect x="24" y="24" width="82" height="82" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="30" y="30" width="70" height="46" rx="4" fill="#E0F2FE" />
        <circle cx="43" cy="42" r="4.5" fill={MIRO.yellow} />
        <path d="M30 68L48 50L60 60L72 47L100 68V76H30V68Z" fill={MIRO.blueSoft} />
        <rect x="32" y="85" width="48" height="4" rx="2" fill={MIRO.lineDark} />
        <rect x="32" y="93" width="28" height="3" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Верхний правый мини-фрейм */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.03))">
        <rect x="114" y="24" width="62" height="38" rx="5" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="120" y="30" width="22" height="26" rx="3" fill={MIRO.blueDark} opacity="0.5" />
        <rect x="148" y="34" width="22" height="3" rx="1.5" fill={MIRO.lineDark} />
        <rect x="148" y="41" width="16" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="148" y="48" width="12" height="3" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Желтый стикер обратной связи */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))">
        <rect x="118" y="68" width="36" height="36" rx="3" fill={MIRO.yellow} />
        <rect x="124" y="76" width="24" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.75" />
        <rect x="124" y="82" width="18" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.75" />
        <rect x="124" y="88" width="20" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.75" />
      </g>

      <rect x="160" y="76" width="16" height="16" rx="2" fill={MIRO.green} />
    </svg>
  );
}

export function StudioIconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g filter="drop-shadow(0 3px 6px rgba(139,92,246,0.18))">
        {/* Центрируем круг: x = 100 (половина от 200), y = 65 (половина от 130) */}
        <circle cx="100" cy="65" r="18" fill={MIRO.blueDark} />
        
        {/* Центрируем крестик относительно точки (100, 65):
            По горизонтали линии идут от 100-8 (92) до 100+8 (108)
            По вертикали линии идут от 65-8 (57) до 65+8 (73) */}
        <path
          d="M100 57V73M92 65H108"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Idea / Мозговой штурм, инсайт: лампочка, стикеры и соединители */
export function StudioIconIdea(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Главная карточка с инсайтом */}
      <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.05))">
        <rect x="24" y="22" width="96" height="86" rx="7" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />

        {/* Лампочка */}
        {/* Колба */}
        <path
          d="M72 40C66.5 40 62 44.5 62 50C62 53.5 64 56.5 66.5 58.5V62C66.5 63 67.5 64 68.5 64H75.5C76.5 64 77.5 63 77.5 62V58.5C80 56.5 82 53.5 82 50C82 44.5 77.5 40 72 40Z"
          fill={MIRO.yellow}
        />
        {/* Цоколь */}
        <rect x="68" y="65" width="8" height="2" rx="1" fill={MIRO.yellowDark} />
        <rect x="69" y="68" width="6" height="1.8" rx="0.9" fill={MIRO.yellowDark} />

        {/* Лучи идеи */}
        <line x1="72" y1="34" x2="72" y2="37" stroke={MIRO.yellowDark} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="57" y1="42" x2="59.5" y2="44.5" stroke={MIRO.yellowDark} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="87" y1="42" x2="84.5" y2="44.5" stroke={MIRO.yellowDark} strokeWidth="1.6" strokeLinecap="round" />

        {/* Текстовые строки вывода */}
        <rect x="36" y="78" width="46" height="4" rx="2" fill={MIRO.blueDark} />
        <rect x="36" y="86" width="70" height="3" rx="1.5" fill={MIRO.lineDark} />
        <rect x="36" y="93" width="52" height="3" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Пунктирные коннекторы к стикерам */}
      <path d="M120 45C128 45 132 40 138 40" stroke={MIRO.blueDark} strokeWidth="1.4" strokeDasharray="2.5 2" strokeLinecap="round" />
      <path d="M120 80C128 80 132 85 138 85" stroke={MIRO.blueDark} strokeWidth="1.4" strokeDasharray="2.5 2" strokeLinecap="round" />

      {/* Верхний стикер идеи (фиолетовый) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))">
        <rect x="138" y="26" width="38" height="32" rx="3" fill={MIRO.blueDark} />
        <rect x="144" y="33" width="26" height="2.5" rx="1" fill={MIRO.blueDark} opacity="0.8" />
        <rect x="144" y="39" width="18" height="2.5" rx="1" fill={MIRO.blueDark} opacity="0.8" />
      </g>

      {/* Нижний стикер идеи (голубой) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))">
        <rect x="138" y="72" width="38" height="34" rx="3" fill={MIRO.blueSoft} />
        <rect x="144" y="79" width="24" height="2.5" rx="1" fill={MIRO.blueDark} opacity="0.8" />
        <rect x="144" y="86" width="20" height="2.5" rx="1" fill={MIRO.blueDark} opacity="0.8" />
        <rect x="144" y="93" width="12" height="2.5" rx="1" fill={MIRO.blueDark} opacity="0.8" />
      </g>
    </svg>
  );
}

/** Checklists & Tasks / Канбан-список со стикером */
export function StudioIconList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.05))">
        <rect x="24" y="22" width="102" height="86" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />

        {/* Заголовок колонки */}
        <rect x="34" y="32" width="36" height="5" rx="2" fill={MIRO.blueDark} />
        <rect x="74" y="32" width="12" height="5" rx="2" fill={MIRO.blueDark} opacity="0.6" />
        <line x1="34" y1="43" x2="116" y2="43" stroke={MIRO.line} strokeWidth="1" />

        {/* Пункт 1 */}
        <rect x="34" y="50" width="9" height="9" rx="2" fill={MIRO.greenDark} />
        <path d="M36.5 54.5L38 56L40.5 53" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="48" y="52" width="52" height="3.5" rx="1.5" fill={MIRO.lineDark} />
        <line x1="48" y1="53.7" x2="88" y2="53.7" stroke={MIRO.lineDark} strokeWidth="1" />

        {/* Пункт 2 */}
        <rect x="34" y="65" width="9" height="9" rx="2" fill={MIRO.blueSoft} />
        <rect x="48" y="67" width="60" height="3.5" rx="1.5" fill={MIRO.lineDark} />

        {/* Пункт 3 */}
        <rect x="34" y="80" width="9" height="9" rx="2" stroke={MIRO.lineDark} strokeWidth="1.2" />
        <rect x="48" y="82" width="42" height="3.5" rx="1.5" fill={MIRO.line} />

        {/* Пункт 4 */}
        <rect x="34" y="95" width="9" height="9" rx="2" stroke={MIRO.lineDark} strokeWidth="1.2" />
        <rect x="48" y="97" width="32" height="3.5" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Желтый стикер быстрой задачи справа */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))">
        <rect x="136" y="28" width="40" height="42" rx="3" fill={MIRO.yellow} />
        <rect x="142" y="37" width="28" height="3" rx="1.5" fill={MIRO.yellowDark} opacity="0.8" />
        <rect x="142" y="44" width="22" height="3" rx="1.5" fill={MIRO.yellowDark} opacity="0.8" />
        <rect x="142" y="51" width="16" height="3" rx="1.5" fill={MIRO.yellowDark} opacity="0.8" />
      </g>

      <rect x="140" y="78" width="32" height="14" rx="3" fill={MIRO.coral} />
      <rect x="146" y="83" width="20" height="3" rx="1.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

/** Стопка слоев (Layers / 2.5D фреймы на холсте) */
export function StudioIconLayers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Нижний слой */}
      <g opacity="0.55">
        <rect x="62" y="20" width="88" height="52" rx="6" fill={MIRO.blueDark} stroke={MIRO.blueDark} strokeWidth="1" />
        <rect x="72" y="28" width="30" height="3.5" rx="1.5" fill={MIRO.blueDark} opacity="0.7" />
        <rect x="72" y="35" width="48" height="3" rx="1.5" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Средний слой */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" opacity="0.85">
        <rect x="48" y="38" width="94" height="54" rx="6" fill="#F8FAFC" stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="58" y="48" width="36" height="4" rx="2" fill={MIRO.blueDark} />
        <rect x="58" y="57" width="54" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="58" y="64" width="40" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="118" y="48" width="16" height="16" rx="3" fill={MIRO.blueSoft} opacity="0.6" />
      </g>

      {/* Верхний активный слой */}
      <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.08))">
        <rect x="34" y="56" width="102" height="54" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="44" y="66" width="38" height="4.5" rx="2" fill={MIRO.blueDark} />
        <rect x="114" y="66" width="14" height="5" rx="2" fill={MIRO.green} />

        <rect x="44" y="76" width="60" height="3" rx="1.5" fill={MIRO.lineDark} />
        <rect x="44" y="83" width="48" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="44" y="90" width="32" height="3" rx="1.5" fill={MIRO.line} />

        <rect x="144" y="68" width="32" height="32" rx="2" fill={MIRO.yellow} />
        <rect x="148" y="75" width="24" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.8" />
        <rect x="148" y="81" width="16" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.8" />
      </g>
    </svg>
  );
}

const ICONS: Record<StudioIconName, (props: IconProps) => ReactElement> = {
  codeblock: StudioIconCodeblock,
  image: StudioIconImage,
  plus: StudioIconPlus,
  idea: StudioIconIdea,
  list: StudioIconList,
  layers: StudioIconLayers,
};

export function StudioIcon({
  name,
  className,
  ...props
}: IconProps & { name: StudioIconName }) {
  const Comp = ICONS[name];
  return <Comp className={className} {...props} />;
}