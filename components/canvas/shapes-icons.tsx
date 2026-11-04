import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

// ----------------------------------------------------------------------
// Константы Miro-палитры (светлые карточки, мягкие границы, фирменные стикеры)
// ----------------------------------------------------------------------
export const MIRO_THEME = {
  // Двухслойные плашки: белая карточка с нежно-лавандовой подложкой сзади
  plate: {
    back: 'fill-[#E8E6F3] dark:fill-white/10',
    front: 'fill-white/80 backdrop-blur-sm dark:fill-[#1C1C21]/80',
  },
  // Строгий темно-графитовый тон линий и фигур (под темную тему — чистый белый)
  glyph: {
    fill: 'fill-[#232135] dark:fill-white',
  },
  // Акцентные стикеры Miro для живого вида
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
    {/* Задняя смещенная карточка (создает глубину бесконечной доски) */}
    <rect
      x="8"
      y="2"
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

// 1. Rectangle — карточка-блок Miro с акцентной рамкой
export const RectangleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <rect
      x="12"
      y="16.5"
      width="16"
      height="13"
      rx="2.5"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 2. Circle — круговой объект диаграммы
export const CircleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <circle cx="20" cy="23" r="6.8" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 3. Triangle — маркер узла / пирамида
export const TriangleShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 15.5L26.5 27.5C27 28.5 26.2 29.5 25 29.5H15C13.8 29.5 13 28.5 13.5 27.5L20 15.5Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 4. Diamond — блок логического решения (Decision Diamond) в блок-схемах Miro
export const DiamondShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 15L27 23L20 31L13 23L20 15Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 5. Star — пятиконечная звезда-бейдж
export const StarShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 15.5L21.8 20.8H27.5L22.9 24.1L24.6 29.5L20 26.2L15.4 29.5L17.1 24.1L12.5 20.8H18.2L20 15.5Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 6. Hexagon — полигон для схем
export const HexagonShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M20 15L26.5 19V27L20 31L13.5 27V19L20 15Z"
      className={MIRO_THEME.glyph.fill}
    />
  </svg>
);

// 7. Ellipse — горизонтальный эллиптический узел
export const EllipseShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <ellipse cx="20" cy="23" rx="8" ry="5.5" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 8. Line — фирменный коннектор Miro с точками привязки
export const LineShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    {/* Пунктирная связующая стрелка */}
    <path
      d="M13 29L27 17"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="13" cy="29" r="2.2" className={MIRO_THEME.glyph.fill} />
    <circle cx="27" cy="17" r="2.2" className={MIRO_THEME.glyph.fill} />
  </svg>
);

// 9. Divider — разделитель с якорными точками
export const DividerShapeIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    <path
      d="M11 23H29"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="18" r="1.5" className={MIRO_THEME.accent.purple} />
    <circle cx="20" cy="28" r="1.5" className={MIRO_THEME.accent.yellow} />
  </svg>
);

// 10. Image Upload — карточка медиа с фирменным стикером Miro в углу
export const ImageUploadIcon: React.FC<IconProps> = ({ size, className, ...props }) => (
  <svg {...baseSvg(size, className)} {...props}>
    <LayeredPlate />
    
    {/* Солнце (желтый акцентный стикер) */}
    <circle cx="14" cy="17.5" r="2.8" className={MIRO_THEME.accent.yellow} />

    {/* Горы / графический объект */}
    <path
      d="M10 28.5L16 20.5L21 26.5L24 23.5L30 28.5H10Z"
      className={MIRO_THEME.glyph.fill}
    />

    {/* Стикер загрузки со стрелкой */}
    <g>
      <circle 
        cx="27.5" 
        cy="15" 
        r="4.5" 
        className={MIRO_THEME.accent.blue} 
      />
      <path
        d="M27.5 12.5V17.5M25 15H30"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  </svg>
);