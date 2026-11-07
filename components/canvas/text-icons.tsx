import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

// ----------------------------------------------------------------------
// Константы Miro-палитры (светлые карточки, мягкие границы, фирменные стикеры)
// ----------------------------------------------------------------------
export const MIRO_THEME = {
  plate: {
    back: 'fill-[#E8E6F3] dark:fill-white/10',
    front: 'fill-muted/60 backdrop-blur-sm dark:fill-muted/60',
  },
  glyph: {
    fill: 'fill-[#232135] dark:fill-white',
    stroke: 'stroke-[#232135] dark:stroke-white',
  },
  accent: {
    yellow: 'fill-[#FDE047] dark:fill-[#EAB308]',
    purple: 'fill-[#C4B5FD] dark:fill-[#A78BFA]',
    blue: 'fill-[#93C5FD] dark:fill-[#60A5FA]',
    green: 'fill-[#86EFAC] dark:fill-[#4ADE80]',
  },
} as const;

const baseSvg = (size: number | string = 44, className = '') => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: size,
  height: size,
  viewBox: '0 0 44 44',
  fill: 'none',
  className,
});

// Улучшенная двухслойная подложка: добавлена тень (back) для объема и выровнен центр
const LayeredPlate: React.FC = () => (
  <>
    {/* Задний слой (эффект объема/тени) */}
    <rect 
      x="8" y="8" 
      width="28" height="28" 
      rx="7" 
      className={MIRO_THEME.plate.back} 
    />
    {/* Основная карточка */}
    <rect 
      x="6" y="6" 
      width="28" height="28" 
      rx="7" 
      strokeWidth="1" 
      strokeOpacity="0.08" 
      stroke="currentColor" 
      className={MIRO_THEME.plate.front} 
    />
  </>
);

// 1. Text — базовый ввод текста с желтым акцентным маркером
export const MiroTextIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <rect x="14" y="23" width="16" height="6" rx="2" className={MIRO_THEME.glyph.fill} />
    <path 
      d="M14 16H30M22 16V28" 
      strokeWidth="2" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 2. Heading — заголовок H1 с фиолетовым акцентом
export const HeadingIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M13 16V28M21 16V28M13 22H21" 
      strokeWidth="2" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    {/* Цифра 1 */}
    <path 
      d="M25 18L27 16V28" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 3. Subtitle — подзаголовок H2 с мятным блоком
export const SubtitleIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M14 17V27M20 17V27M14 22H20" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    {/* Цифра 2 */}
    <path 
      d="M23 20.5C23 18.5 24.5 17.5 26 17.5C27.5 17.5 29 18.5 29 20C29 22 23 25 23 27.5H29" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 4. Paragraph — строки текста с акцентными голубыми буллитами
export const ParagraphIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    {/* Маркеры списка */}
    <circle cx="15" cy="17" r="2" className={MIRO_THEME.accent.blue} />
    <circle cx="15" cy="22" r="2" className={MIRO_THEME.accent.blue} />
    <circle cx="15" cy="27" r="2" className={MIRO_THEME.accent.blue} />
    {/* Строки текста */}
    <path 
      d="M20 17H31M20 22H31M20 27H26" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 5. Quote — цитата с геометричными кавычками и желтым стикером
export const QuoteIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M14 24C14 19 16.5 17 18 17V20C16.5 20 16 20.5 16 21.5H19V26H14V24Z" 
      className={MIRO_THEME.glyph.fill}
    />
    <path 
      d="M22 24C22 19 24.5 17 26 17V20C24.5 20 24 20.5 24 21.5H27V26H22V24Z" 
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 6. Code — скобки кода </> с наклонным фиолетовым слэшем (сделан через заливку)
export const CodeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <rect 
      x="21" y="14" 
      width="2" height="16" 
      rx="1" 
      transform="rotate(20 22 22)" 
    />
    <path 
      d="M17 17L12 22L17 27M27 17L32 22L27 27" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 7. Pencil / Text Area — область текста с курсором и точками трансформации
export const PencilTextIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <rect 
      x="12.5" y="12.5" 
      width="19" height="19" 
      rx="2" 
      strokeWidth="1.5" 
      strokeDasharray="3 3" 
      className={MIRO_THEME.glyph.stroke}
      opacity="0.4"
    />
    {/* I-cursor в центре */}
    <path 
      d="M20 17H24M22 17V27M20 27H24" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    {/* Маркерные ручки фрейма Miro по углам (голубые квадраты) */}
    <rect x="11" y="11" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="30" y="11" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="11" y="30" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="30" y="30" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
  </svg>
);