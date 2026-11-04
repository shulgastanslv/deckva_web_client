import type { ReactElement, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

const BLUE_SOFT = "#d4dcfb";
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
  | "image"
  | "plus"
  | "carousel"
  | "list"
  | "layers"
  | "threads";

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
        <rect x="36" y="48" width="18" height="4" rx="2" fill={MIRO.purpleDark} />
        <rect x="58" y="48" width="34" height="4" rx="2" fill={MIRO.blueDark} />

        <rect x="46" y="58" width="24" height="4" rx="2" fill={MIRO.greenDark} />
        <rect x="74" y="58" width="40" height="4" rx="2" fill={MIRO.lineDark} />

        <rect x="46" y="68" width="32" height="4" rx="2" fill={MIRO.yellowDark} />
        <rect x="82" y="68" width="22" height="4" rx="2" fill={MIRO.line} />

        <rect x="36" y="78" width="14" height="4" rx="2" fill={MIRO.purpleDark} />

        {/* Акцентный бейдж языка справа внизу */}
        <rect x="140" y="86" width="30" height="14" rx="3" fill="#EEF2FF" />
        <path d="M148 91L145 93L148 95M162 91L165 93L162 95" stroke={MIRO.purpleDark} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="156" y1="90" x2="154" y2="96" stroke={MIRO.purpleDark} strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Visual frame grid */
export function StudioIconImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
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

export function StudioIconCarousel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Левый слайд (активный) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))">
        <rect x="22" y="24" width="70" height="82" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="30" y="34" width="38" height="6" rx="2" fill={MIRO.purpleDark} />
        <rect x="30" y="46" width="54" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="30" y="53" width="46" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="30" y="60" width="34" height="3" rx="1.5" fill={MIRO.line} />
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
        <rect x="120" y="37" width="50" height="28" rx="3" fill={MIRO.blue} opacity="0.45" />
        <rect x="120" y="72" width="42" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="120" y="79" width="30" height="3" rx="1.5" fill={MIRO.line} />
      </g>
    </svg>
  );
}

/** Checklists & Tasks / Канбан-список со стикером */
export function StudioIconList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Основная карточка списка */}
      <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.05))">
        <rect x="24" y="22" width="102" height="86" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />

        {/* Заголовок колонки */}
        <rect x="34" y="32" width="36" height="5" rx="2" fill={MIRO.purpleDark} />
        <rect x="74" y="32" width="12" height="5" rx="2" fill={MIRO.purple} opacity="0.6" />
        <line x1="34" y1="43" x2="116" y2="43" stroke={MIRO.line} strokeWidth="1" />

        {/* Пункт 1 (выполнен) */}
        <rect x="34" y="50" width="9" height="9" rx="2" fill={MIRO.greenDark} />
        <path d="M36.5 54.5L38 56L40.5 53" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="48" y="52" width="52" height="3.5" rx="1.5" fill={MIRO.lineDark} />
        <line x1="48" y1="53.7" x2="88" y2="53.7" stroke={MIRO.lineDark} strokeWidth="1" />

        {/* Пункт 2 (в процессе) */}
        <rect x="34" y="65" width="9" height="9" rx="2" fill={MIRO.blue} />
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

      {/* Коралловый мини-стикер тега */}
      <rect x="140" y="78" width="32" height="14" rx="3" fill={MIRO.coral} />
      <rect x="146" y="83" width="20" height="3" rx="1.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

/** Стопка слоев (Layers / 2.5D фреймы на холсте) */
export function StudioIconLayers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Нижний слой (карточка 3) */}
      <g opacity="0.55">
        <rect x="62" y="20" width="88" height="52" rx="6" fill={MIRO.purple} stroke={MIRO.purpleDark} strokeWidth="1" />
        <rect x="72" y="28" width="30" height="3.5" rx="1.5" fill={MIRO.purpleDark} opacity="0.7" />
        <rect x="72" y="35" width="48" height="3" rx="1.5" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Средний слой (карточка 2) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" opacity="0.85">
        <rect x="48" y="38" width="94" height="54" rx="6" fill="#F8FAFC" stroke={MIRO.frameBorder} strokeWidth="1" />
        <rect x="58" y="48" width="36" height="4" rx="2" fill={MIRO.blueDark} />
        <rect x="58" y="57" width="54" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="58" y="64" width="40" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="118" y="48" width="16" height="16" rx="3" fill={MIRO.blue} opacity="0.6" />
      </g>

      {/* Верхний активный слой (карточка 1) */}
      <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.08))">
        <rect x="34" y="56" width="102" height="54" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />
        
        {/* Шапка слоя со статусом */}
        <rect x="44" y="66" width="38" height="4.5" rx="2" fill={MIRO.purpleDark} />
        <rect x="114" y="66" width="14" height="5" rx="2" fill={MIRO.green} />

        <rect x="44" y="76" width="60" height="3" rx="1.5" fill={MIRO.lineDark} />
        <rect x="44" y="83" width="48" height="3" rx="1.5" fill={MIRO.line} />
        <rect x="44" y="90" width="32" height="3" rx="1.5" fill={MIRO.line} />

        {/* Желтый стикер Miro с акцентом */}
        <rect x="144" y="68" width="32" height="32" rx="2" fill={MIRO.yellow} />
        <rect x="148" y="75" width="24" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.8" />
        <rect x="148" y="81" width="16" height="2.5" rx="1" fill={MIRO.yellowDark} opacity="0.8" />
      </g>
    </svg>
  );
}

/** Ветка сообщений с карточкой и официальным логотипом Threads (@) */
export function StudioIconThreads(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Главная карточка треда */}
      <g filter="drop-shadow(0 2px 6px rgba(0,0,0,0.05))">
        <rect x="24" y="20" width="112" height="90" rx="6" fill={MIRO.frame} stroke={MIRO.frameBorder} strokeWidth="1" />

        {/* Аватар автора сообщения */}
        <circle cx="40" cy="38" r="8" fill="#18181B" />
        {/* Логотип Threads внутри аватара */}
        <path
          d="M40 33.6C37.8 33.6 36.2 35.1 36.2 37.5C36.2 40.1 38 41.5 40.4 41.5C42.2 41.5 43.4 40.6 43.7 39.4H42.5C42.2 40.1 41.4 40.5 40.4 40.5C38.6 40.5 37.3 39.4 37.3 37.5C37.3 35.8 38.5 34.6 40 34.6C41.6 34.6 42.6 35.6 42.6 37.2V37.7C42.1 37.5 41.4 37.4 40.7 37.4C39.1 37.4 38.1 38.3 38.1 39.5C38.1 40.6 39 41.3 40.1 41.3C41.2 41.3 42 40.7 42.4 39.9V41.3H43.6V37.2C43.6 35.1 42.2 33.6 40 33.6ZM40.1 40.4C39.5 40.4 39.1 40 39.1 39.4C39.1 38.7 39.6 38.2 40.6 38.2C41.2 38.2 41.8 38.4 42.4 38.6C42.2 39.7 41.3 40.4 40.1 40.4Z"
          fill="#FFFFFF"
        />

        {/* Имя и тег */}
        <rect x="53" y="33" width="34" height="4" rx="2" fill="#18181B" />
        <rect x="53" y="40" width="22" height="3" rx="1.5" fill={MIRO.lineDark} />

        {/* Тело сообщения треда */}
        <rect x="40" y="52" width="84" height="3.5" rx="1.5" fill={MIRO.lineDark} />
        <rect x="40" y="59" width="76" height="3.5" rx="1.5" fill={MIRO.line} />
        <rect x="40" y="66" width="46" height="3.5" rx="1.5" fill={MIRO.line} />

        {/* Вертикальная линия цепочки треда */}
        <line x1="40" y1="76" x2="40" y2="88" stroke={MIRO.lineDark} strokeWidth="1.5" strokeLinecap="round" />

        {/* Ответный аватар */}
        <circle cx="40" cy="94" r="5" fill={MIRO.purpleDark} />
        <rect x="52" y="92" width="56" height="3.5" rx="1.5" fill={MIRO.line} />
      </g>

      {/* Правый блок: акцентная белая карточка с крупным темным логотипом Threads */}
      <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.06))">
        <rect x="144" y="24" width="38" height="40" rx="8" fill="#18181B" />
        <path
          d="M163 35C158 35 154 38.5 154 44.5C154 50.8 158.4 54.5 163.8 54.5C168.1 54.5 171 52.3 171.7 49.3H168.9C168.3 50.9 166.4 52 163.8 52C159.9 52 156.8 49.4 156.8 44.5C156.8 40.3 159.5 37.5 163 37.5C166.8 37.5 169.1 39.8 169.1 43.6V44.7C167.9 44.2 166.4 44 164.7 44C161 44 158.5 46.1 158.5 49C158.5 51.7 160.7 53.3 163.3 53.3C165.9 53.3 167.8 51.9 168.7 50V53.3H171.5V43.6C171.5 38.6 168.1 35 163 35ZM163.3 51C161.9 51 161 50.1 161 48.8C161 47.3 162.2 46.1 164.5 46.1C166 46.1 167.4 46.5 168.7 47C168.3 49.5 166.2 51 163.3 51Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Желтый стикер Miro с пометкой под тредом */}
      <rect x="146" y="72" width="28" height="26" rx="2" fill={MIRO.yellow} />
      <rect x="150" y="78" width="18" height="2" rx="1" fill={MIRO.yellowDark} opacity="0.8" />
      <rect x="150" y="83" width="12" height="2" rx="1" fill={MIRO.yellowDark} opacity="0.8" />
    </svg>
  );
}

const ICONS: Record<StudioIconName, (props: IconProps) => ReactElement> = {
  codeblock: StudioIconCodeblock,
  image: StudioIconImage,
  plus: StudioIconPlus,
  carousel: StudioIconCarousel,
  list: StudioIconList,
  layers: StudioIconLayers,
  threads: StudioIconThreads,
};

export function StudioIcon({
  name,
  className,
  ...props
}: IconProps & { name: StudioIconName }) {
  const Comp = ICONS[name];
  return <Comp className={className} {...props} />;
}