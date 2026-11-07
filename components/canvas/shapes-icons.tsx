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


// 1. Rectangle — карточка-блок
export const RectangleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
      <rect
      x="13" y="15"
      width="18" height="14"
      rx="2"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 2. Circle — круговой объект диаграммы
export const CircleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <circle cx="22" cy="22" r="9" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 3. Triangle — маркер узла / пирамида
export const TriangleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path
      d="M22 13L31 28C31.5 29 30.5 30 29.5 30H14.5C13.5 30 12.5 29 13 28L22 13Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 4. Diamond — блок логического решения (Decision Diamond)
export const DiamondShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path
      d="M22 12.5L31.5 22L22 31.5L12.5 22L22 12.5Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 5. Star — пятиконечная звезда-бейдж
export const StarShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path
      d="M22 13L24.2 18.5H30L25.3 21.8L27 27.5L22 24L17 27.5L18.7 21.8L14 18.5H19.8L22 13Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 6. Hexagon — полигон для схем
export const HexagonShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path
      d="M22 13L30.5 17.5V26.5L22 31L13.5 26.5V17.5L22 13Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 7. Ellipse — горизонтальный эллиптический узел
export const EllipseShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <ellipse cx="22" cy="22" rx="10" ry="7" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 8. Line — фирменный коннектор с точками привязки
export const LineShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path
      d="M14 30L30 14"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={MIRO_THEME.glyph.stroke}
    />
    <circle cx="14" cy="30" r="2.5" className={MIRO_THEME.glyph.fill} />
    <circle cx="30" cy="14" r="2.5" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 9. Divider — разделитель с якорными точками
export const DividerShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <path
      d="M12 22H32"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={MIRO_THEME.glyph.stroke}
    />
  </svg>
);

// 10. Image Upload — карточка медиа с бейджем загрузки
export const ImageUploadIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    
    {/* Солнце (желтый акцентный стикер) */}
    <circle cx="15" cy="15" r="2.5" className={MIRO_THEME.accent.yellow} />

    {/* Горы / графический объект */}
    <path
      d="M11 27L17 19L22 25L25 22L31 27H11Z"
      className={MIRO_THEME.glyph.fill}
    />

    {/* Стикер загрузки с плюсом/стрелкой */}
    <g>
      <circle 
        cx="30" 
        cy="14" 
        r="5" 
        className={MIRO_THEME.accent.blue} 
      />
      <path
        d="M30 11.5V16.5M27.5 14H32.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-white dark:stroke-[#232135]"
      />
    </g>
  </svg>
);