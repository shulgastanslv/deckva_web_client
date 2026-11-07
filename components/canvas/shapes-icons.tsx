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

// Улучшенная двухслойная подложка (эффект объема)
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

// 1. Rectangle — карточка-блок
export const RectangleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <rect
      x="12" y="14"
      width="16" height="12"
      rx="2"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 2. Circle — круговой объект диаграммы
export const CircleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <circle cx="20" cy="20" r="7" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 3. Triangle — маркер узла / пирамида
export const TriangleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 13.5L26.5 25.5C27 26.5 26.2 27.5 25 27.5H15C13.8 27.5 13 26.5 13.5 25.5L20 13.5Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 4. Diamond — блок логического решения (Decision Diamond)
export const DiamondShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 13L27 20L20 27L13 20L20 13Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 5. Star — пятиконечная звезда-бейдж
export const StarShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 12.5L21.8 17.8H27.5L22.9 21.1L24.6 26.5L20 23.2L15.4 26.5L17.1 21.1L12.5 17.8H18.2L20 12.5Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 6. Hexagon — полигон для схем
export const HexagonShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 13L26.5 16.5V23.5L20 27L13.5 23.5V16.5L20 13Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 7. Ellipse — горизонтальный эллиптический узел
export const EllipseShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <ellipse cx="20" cy="20" rx="9" ry="6" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 8. Line — фирменный коннектор с точками привязки
export const LineShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    {/* Пунктирная связующая стрелка */}
    <path
      d="M13 27L27 13"
      strokeWidth="2"
      strokeLinecap="round"
      className={MIRO_THEME.glyph.stroke}
    />
    <circle cx="13" cy="27" r="2.5" className={MIRO_THEME.glyph.fill} />
    <circle cx="27" cy="13" r="2.5" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 9. Divider — разделитель с якорными точками
export const DividerShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M11 20H29"
      strokeWidth="2"
      strokeLinecap="round"
      className={MIRO_THEME.glyph.stroke}
    />
    <circle cx="20" cy="15" r="1.5" className={MIRO_THEME.accent.purple} />
    <circle cx="20" cy="25" r="1.5" className={MIRO_THEME.accent.yellow} />
  </svg>
);

// 10. Image Upload — карточка медиа с бейджем загрузки
export const ImageUploadIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    
    {/* Солнце (желтый акцентный стикер) */}
    <circle cx="13" cy="14" r="2.5" className={MIRO_THEME.accent.yellow} />

    {/* Горы / графический объект */}
    <path
      d="M9 25.5L15 17.5L20 23.5L23 20.5L29 25.5H9Z"
      className={MIRO_THEME.glyph.fill}
    />

    {/* Стикер загрузки с плюсом/стрелкой */}
    <g>
      <circle 
        cx="28" 
        cy="12" 
        r="4.5" 
        className={MIRO_THEME.accent.blue} 
      />
      <path
        d="M28 9.5V14.5M25.5 12H30.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-white dark:stroke-[#232135]"
      />
    </g>
  </svg>
);