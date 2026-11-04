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
    front: 'fill-white dark:fill-[#1C1C21]',
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
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 44 44",
  fill: "none",
  className,
});

// Базовая двухслойная подложка в стиле шаблонов Miro
const LayeredPlate: React.FC = () => (
  <>
    {/* Задняя смещенная карточка */}
    <rect
      x="8"
      y="4"
      width="30"
      height="30"
      rx="8"
      className={MIRO_THEME.plate.back}
    />
    {/* Передняя карточка-фрейм */}
    <rect
      x="5"
      y="8"
      width="30"
      height="30"
      rx="8"
      strokeWidth="1.2"
      className={MIRO_THEME.plate.front}
    />
  </>
);

// 1. Text — базовый ввод текста с желтым акцентным стикером Miro
export const MiroTextIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M12 16H28M20 16V28" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 2. Heading — заголовок первого уровня H1 с лавандовой плашкой
export const HeadingIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M12.5 16V28M19.5 16V28M12.5 22H19.5" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    <path 
      d="M24 18.5L26 17V28" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 3. Subtitle — подзаголовок H2 со стикером цвета мяты
export const SubtitleIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M11.5 16.5V27.5M17.5 16.5V27.5M11.5 22H17.5" 
      strokeWidth="2" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    <path 
      d="M22 19C22 17.5 23 16.5 24.8 16.5C26.5 16.5 27.5 17.5 27.5 19C27.5 21 24.5 22.5 22 25H27.5" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 4. Paragraph — строки текста с акцентным голубым маркером списка
export const ParagraphIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M14 16.5H28M14 21.5H28M14 26.5H21" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 5. Quote — цитата с парными кавычками в фирменных оттенках Miro
export const QuoteIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    {/* Левая кавычка */}
    <path 
      d="M12 22.5C12 19 13.5 17.5 15.5 17V18.5C14.2 18.5 13.8 19.5 13.8 20.5H16V25H12V22.5Z" 
      className={MIRO_THEME.glyph.fill}
    />
    {/* Правая кавычка с акцентным стикером */}
    <path 
      d="M18.5 22.5C18.5 19 20 17.5 22 17V18.5C20.7 18.5 20.3 19.5 20.3 20.5H22.5V25H18.5V22.5Z" 
      className={MIRO_THEME.accent.yellow}
    />
  </svg>
);

// 6. Code — скобки кода </> с фиолетовым акцентным слэшем
export const CodeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path 
      d="M14 19L11 22.5L14 26M26 19L29 22.5L26 26" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    <path 
      d="M21.5 16.5L18.5 28.5" 
      strokeWidth="2" 
      strokeLinecap="round" 
      className={MIRO_THEME.accent.purple}
    />
  </svg>
);

// 7. Pencil / Text Area — область текста с угловыми маркерами выделения
export const PencilTextIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <rect 
      x="12" 
      y="15.5" 
      width="16" 
      height="14" 
      rx="2" 
      strokeWidth="1.4" 
      strokeDasharray="2.5 2" 
      className={MIRO_THEME.glyph.stroke}
    />
    <path 
      d="M18 19H22M20 19V26M18 26H22" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    {/* Маркерные ручки фрейма Miro по углам */}
    <rect x="11" y="14.5" width="2.5" height="2.5" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="26.5" y="14.5" width="2.5" height="2.5" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="11" y="27" width="2.5" height="2.5" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="26.5" y="27" width="2.5" height="2.5" rx="0.5" className={MIRO_THEME.accent.blue} />
  </svg>
);