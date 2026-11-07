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


export const MiroTextIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <rect x="14" y="23" width="16" height="6" rx="2" className={MIRO_THEME.accent.yellow} opacity="0.8" />
    <path 
      d="M14 15H30M22 15V29" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

export const HeadingIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path 
      d="M14 15V29M21 15V29M14 22H21" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    {/* Цифра 1 */}
    <path 
      d="M26 17L28 15V29" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

export const SubtitleIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path 
      d="M14 16V28M20 16V28M14 22H20" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
    {/* Цифра 2 */}
    <path 
      d="M25 19C25 16.5 29 16.5 29 19.5C29 22 25 25 25 28H29" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

export const ParagraphIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path 
      d="M19 16H31M19 22H31M19 28H27" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

export const QuoteIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path 
      d="M15 16H19V22L17 26H15L17 22H15V16Z" 
      className={MIRO_THEME.glyph.fill}
    />
    <path 
      d="M23 16H27V22L25 26H23L25 22H23V16Z" 
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path 
      d="M17 16L12 22L17 28M27 16L32 22L27 28" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 7. Pencil / Text Area — область текста с курсором
export const PencilTextIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <rect 
      x="12" y="12" 
      width="20" height="20" 
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
    {/* Маркерные ручки фрейма по углам */}
    <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="30.5" y="10.5" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="10.5" y="30.5" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
    <rect x="30.5" y="30.5" width="3" height="3" rx="0.5" className={MIRO_THEME.accent.blue} />
  </svg>
);