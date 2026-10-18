/** Illustrations use only ink / blue / mist (+ white). */

const INK = "#14151c";
const BLUE = "#2f5bff";
const MIST = "#e8ecf7";
const WHITE = "#fff";
const BLUE_SOFT = "#c9d4ff";

/** Open studio: prompt, canvas, cursor, and a free badge. */
export function FreeArt() {
  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full max-w-[380px]" aria-hidden>
      <circle cx="200" cy="140" r="100" fill={MIST} />
      <circle cx="58" cy="58" r="10" fill={WHITE} />
      <rect x="78" y="36" width="230" height="168" rx="24" fill={WHITE} />
      <rect x="94" y="52" width="150" height="28" rx="14" fill={MIST} />
      <circle cx="110" cy="66" r="6" fill={BLUE} />
      <rect x="124" y="62" width="72" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="94" y="92" width="128" height="92" rx="16" fill={MIST} />
      <rect x="108" y="106" width="72" height="10" rx="5" fill={INK} />
      <rect x="108" y="124" width="100" height="42" rx="8" fill={BLUE} />
      <rect x="120" y="136" width="40" height="6" rx="3" fill={WHITE} />
      <path d="M176 128l0 28 6-6 8 12 5-3-8-12 10-2z" fill={INK} />
      <g transform="rotate(-10 292 92)">
        <rect x="248" y="48" width="64" height="84" rx="12" fill={WHITE} />
        <rect x="258" y="60" width="32" height="6" rx="3" fill={BLUE_SOFT} />
        <rect x="258" y="74" width="44" height="28" rx="6" fill={MIST} />
      </g>
      <g transform="rotate(8 300 170)">
        <rect x="262" y="132" width="58" height="76" rx="12" fill={WHITE} />
        <rect x="272" y="146" width="28" height="6" rx="3" fill={BLUE} />
        <rect x="272" y="160" width="38" height="24" rx="6" fill={MIST} />
      </g>
      <g transform="translate(24 168)">
        <rect width="72" height="40" rx="14" fill={INK} />
        <text
          x="36"
          y="26"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill={WHITE}
        >
          Free
        </text>
      </g>
    </svg>
  );
}

export function GenerateArt() {
  return (
    <svg viewBox="0 0 380 220" className="h-auto w-full max-w-[440px]" aria-hidden>
      <circle cx="196" cy="118" r="78" fill={MIST} />
      <g transform="rotate(-14 150 120)">
        <rect x="108" y="58" width="92" height="122" rx="16" fill={WHITE} />
        <rect x="122" y="74" width="48" height="8" rx="4" fill={BLUE_SOFT} />
        <rect x="122" y="90" width="64" height="40" rx="8" fill={MIST} />
      </g>
      <g transform="rotate(12 250 120)">
        <rect x="204" y="52" width="92" height="122" rx="16" fill={WHITE} />
        <rect x="218" y="68" width="48" height="8" rx="4" fill={BLUE} />
        <rect x="218" y="84" width="64" height="40" rx="8" fill={MIST} />
      </g>
      <rect x="146" y="40" width="100" height="132" rx="18" fill={WHITE} />
      <rect x="162" y="56" width="56" height="10" rx="5" fill={INK} />
      <rect x="162" y="74" width="40" height="6" rx="3" fill={MIST} />
      <rect x="162" y="90" width="68" height="46" rx="10" fill={BLUE} />
      <rect x="174" y="104" width="28" height="6" rx="3" fill={WHITE} />
      <rect x="174" y="116" width="18" height="5" rx="2.5" fill={BLUE_SOFT} />
      <circle cx="168" cy="156" r="3.5" fill={BLUE} />
      <circle cx="182" cy="156" r="3.5" fill={MIST} />
      <circle cx="196" cy="156" r="3.5" fill={MIST} />
      <path
        d="M78 150c18-8 28-6 40 2"
        fill="none"
        stroke={WHITE}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M292 78c16 10 22 28 12 42"
        fill="none"
        stroke={WHITE}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M48 52l5 11 11 1.6-8.4 6.6 2.6 10.6L48 76l-10.2 6 2.6-10.6L32 64.8l11-1.6z"
        fill={WHITE}
      />
    </svg>
  );
}

export function FeedArt() {
  return (
    <svg viewBox="0 0 220 250" className="h-auto w-[150px] sm:w-[170px]" aria-hidden>
      <rect x="48" y="8" width="124" height="230" rx="28" fill={INK} />
      <rect x="58" y="22" width="104" height="198" rx="20" fill={MIST} />
      <rect x="70" y="36" width="80" height="148" rx="12" fill={WHITE} />
      <rect x="80" y="48" width="44" height="7" rx="3.5" fill={INK} />
      <rect x="80" y="62" width="60" height="36" rx="6" fill={BLUE} />
      <rect x="80" y="106" width="48" height="6" rx="3" fill={MIST} />
      <rect x="80" y="118" width="36" height="5" rx="2.5" fill={BLUE_SOFT} />
      <rect x="80" y="136" width="18" height="28" rx="4" fill={MIST} />
      <rect x="102" y="136" width="18" height="28" rx="4" fill={BLUE} />
      <rect x="124" y="136" width="18" height="28" rx="4" fill={INK} />
      <circle cx="178" cy="46" r="18" fill={BLUE} />
      <path
        d="M178 38c2 4 6 6 8 6-4 2-6 6-6 10-2-4-6-6-10-6 4-2 6-6 8-10z"
        fill={WHITE}
      />
    </svg>
  );
}

export function StudioArt() {
  return (
    <svg viewBox="0 0 280 150" className="h-auto w-full" aria-hidden>
      <rect x="16" y="18" width="168" height="114" rx="20" fill={WHITE} />
      <rect x="30" y="32" width="108" height="78" rx="12" fill={MIST} />
      <rect x="48" y="46" width="52" height="8" rx="4" fill={INK} />
      <rect x="48" y="62" width="36" height="6" rx="3" fill={WHITE} />
      <rect
        x="46"
        y="40"
        width="76"
        height="58"
        rx="8"
        fill="none"
        stroke={BLUE}
        strokeWidth="2"
      />
      <circle cx="46" cy="40" r="3" fill={BLUE} />
      <circle cx="122" cy="40" r="3" fill={BLUE} />
      <circle cx="46" cy="98" r="3" fill={BLUE} />
      <circle cx="122" cy="98" r="3" fill={BLUE} />
      <path d="M214 36l0 48 10-10 14 22 8-5-14-22 16-3z" fill={WHITE} />
      <path
        d="M214 36l0 48 10-10 14 22 8-5-14-22 16-3z"
        fill="none"
        stroke={BLUE_SOFT}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconsArt() {
  return (
    <svg viewBox="0 0 320 190" className="mt-4 h-auto w-full" aria-hidden>
      <rect x="36" y="78" width="248" height="44" rx="22" fill={WHITE} />
      <circle
        cx="62"
        cy="100"
        r="8"
        fill="none"
        stroke={BLUE}
        strokeWidth="2.5"
      />
      <path
        d="M68 106l6 6"
        stroke={BLUE}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="86" y="94" width="92" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="186" y="94" width="48" height="8" rx="4" fill={MIST} />
      <g transform="rotate(-14 58 48)">
        <rect x="28" y="18" width="52" height="52" rx="16" fill={WHITE} />
        <path
          d="M54 32l2.6 6.6 7 .4-5.4 4.4 1.8 7L54 46.4 48 50.4l1.8-7-5.4-4.4 7-.4z"
          fill={BLUE}
        />
      </g>
      <g transform="rotate(10 262 46)">
        <rect x="236" y="0" width="52" height="52" rx="16" fill={WHITE} />
        <path
          d="M262 30c-6-4-11-8-11-13 0-3 2.4-5.4 5.4-5.4 1.8 0 3.4.8 4.6 2.4 1.2-1.6 2.8-2.4 4.6-2.4 3 0 5.4 2.4 5.4 5.4 0 5-5 9-9 13z"
          fill={BLUE_SOFT}
        />
      </g>
      <g transform="rotate(8 70 156)">
        <rect x="18" y="128" width="48" height="48" rx="16" fill={WHITE} />
        <path d="M46 140l-8 12h6l-3 12 10-14h-6z" fill={BLUE} />
      </g>
      <g transform="rotate(-8 250 158)">
        <rect x="226" y="132" width="48" height="48" rx="16" fill={WHITE} />
        <path
          d="M242 156c0-5 3.2-8 8-8s8 3 8 8-2.6 6.4-6.4 7.4v4.6h-3.2v-4.2c-3.6-.8-6.4-3.6-6.4-7.8z"
          fill={INK}
        />
      </g>
      <g transform="translate(132 18)">
        <rect width="56" height="56" rx="18" fill={WHITE} />
        <path d="M28 16l8 8-8 8-8-8z" fill={BLUE} />
        <path
          d="M20 36h16"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function TemplatesArt() {
  return (
    <svg viewBox="0 0 320 180" className="mt-4 h-auto w-full" aria-hidden>
      <g transform="rotate(-8 90 100)">
        <rect x="24" y="28" width="120" height="132" rx="20" fill={WHITE} />
        <rect x="40" y="46" width="72" height="10" rx="5" fill={INK} />
        <rect x="40" y="64" width="48" height="7" rx="3.5" fill={BLUE_SOFT} />
        <rect x="40" y="84" width="88" height="48" rx="12" fill={MIST} />
      </g>
      <g transform="rotate(6 220 100)">
        <rect x="156" y="22" width="120" height="132" rx="20" fill={WHITE} />
        <rect x="172" y="40" width="72" height="10" rx="5" fill={BLUE} />
        <rect x="172" y="58" width="52" height="7" rx="3.5" fill={MIST} />
        <rect x="186" y="78" width="60" height="40" rx="10" fill={MIST} />
        <rect x="196" y="88" width="28" height="6" rx="3" fill={BLUE} />
      </g>
    </svg>
  );
}

export function FormatsArt() {
  return (
    <svg viewBox="0 0 280 160" className="h-auto w-full" aria-hidden>
      <rect
        x="18"
        y="28"
        width="72"
        height="96"
        rx="16"
        fill={WHITE}
        transform="rotate(-8 54 76)"
      />
      <rect
        x="28"
        y="42"
        width="40"
        height="8"
        rx="4"
        fill={BLUE_SOFT}
        transform="rotate(-8 48 46)"
      />
      <rect
        x="28"
        y="56"
        width="28"
        height="6"
        rx="3"
        fill={MIST}
        transform="rotate(-8 42 59)"
      />
      <rect x="104" y="18" width="72" height="108" rx="16" fill={WHITE} />
      <rect x="118" y="34" width="44" height="8" rx="4" fill={BLUE} />
      <rect x="118" y="50" width="32" height="6" rx="3" fill={MIST} />
      <circle cx="140" cy="92" r="16" fill={INK} />
      <rect
        x="186"
        y="36"
        width="72"
        height="84"
        rx="16"
        fill={WHITE}
        transform="rotate(8 222 78)"
      />
      <rect
        x="198"
        y="52"
        width="36"
        height="8"
        rx="4"
        fill={BLUE}
        transform="rotate(8 216 56)"
      />
    </svg>
  );
}

export function SavedArt() {
  return (
    <svg viewBox="0 0 280 150" className="h-auto w-full" aria-hidden>
      <rect
        x="36"
        y="36"
        width="120"
        height="86"
        rx="18"
        fill={WHITE}
        transform="rotate(-6 96 79)"
      />
      <rect x="92" y="22" width="120" height="86" rx="18" fill={WHITE} />
      <rect x="108" y="40" width="48" height="28" rx="8" fill={MIST} />
      <rect x="112" y="80" width="64" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="112" y="94" width="40" height="6" rx="3" fill={MIST} />
      <circle cx="214" cy="108" r="22" fill={INK} />
      <path
        d="M204 108l7 7 14-16"
        fill="none"
        stroke={WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CleanArt() {
  return (
    <svg
      viewBox="0 0 220 150"
      className="ml-auto h-auto w-full max-w-[220px]"
      aria-hidden
    >
      <rect x="28" y="18" width="110" height="114" rx="22" fill={WHITE} />
      <rect x="44" y="36" width="62" height="10" rx="5" fill={MIST} />
      <rect x="44" y="54" width="44" height="8" rx="4" fill={BLUE_SOFT} />
      <circle cx="78" cy="96" r="18" fill={BLUE} />
      <path
        d="M78 88v16M70 96h16"
        stroke={WHITE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="168" cy="46" r="28" fill={WHITE} />
      <path
        d="M168 34v16M160 50h16"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="188" cy="108" r="8" fill={WHITE} />
    </svg>
  );
}

export function EditorStageArt() {
  return (
    <svg viewBox="0 0 420 320" className="h-auto w-full" aria-hidden>
      <rect x="24" y="20" width="300" height="250" rx="28" fill={WHITE} />
      <rect x="44" y="40" width="36" height="210" rx="14" fill={MIST} />
      <circle cx="62" cy="68" r="8" fill={BLUE} />
      <circle cx="62" cy="96" r="8" fill={BLUE_SOFT} />
      <circle cx="62" cy="124" r="8" fill={BLUE_SOFT} />
      <rect x="96" y="48" width="150" height="168" rx="16" fill={MIST} />
      <rect x="112" y="66" width="86" height="12" rx="6" fill={INK} />
      <rect x="112" y="88" width="58" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="112" y="108" width="118" height="72" rx="12" fill={BLUE} />
      <rect x="126" y="128" width="52" height="8" rx="4" fill={WHITE} />
      <rect x="126" y="144" width="34" height="6" rx="3" fill={BLUE_SOFT} />
      <rect x="258" y="48" width="48" height="70" rx="12" fill={MIST} />
      <rect x="268" y="60" width="28" height="6" rx="3" fill={INK} />
      <rect x="268" y="74" width="22" height="5" rx="2.5" fill={WHITE} />
      <rect x="258" y="128" width="48" height="52" rx="12" fill={MIST} />
      <rect x="96" y="228" width="28" height="36" rx="6" fill={MIST} />
      <rect x="130" y="228" width="28" height="36" rx="6" fill={BLUE} />
      <rect x="164" y="228" width="28" height="36" rx="6" fill={INK} />
      <rect x="198" y="228" width="28" height="36" rx="6" fill={BLUE_SOFT} />
      <g transform="translate(300 150)">
        <rect
          width="72"
          height="96"
          rx="14"
          fill={WHITE}
          transform="rotate(-8 36 48)"
        />
        <rect x="28" y="8" width="72" height="96" rx="14" fill={WHITE} />
        <rect x="42" y="24" width="36" height="7" rx="3.5" fill={INK} />
        <rect x="42" y="40" width="44" height="32" rx="8" fill={MIST} />
      </g>
    </svg>
  );
}

export function ExportArt() {
  return (
    <svg viewBox="0 0 280 140" className="mt-2 h-auto w-full" aria-hidden>
      <rect x="16" y="28" width="150" height="88" rx="18" fill={WHITE} />
      <rect x="32" y="44" width="78" height="10" rx="5" fill={INK} />
      <rect x="32" y="62" width="118" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="32" y="78" width="96" height="8" rx="4" fill={MIST} />
      <rect x="32" y="94" width="64" height="8" rx="4" fill={MIST} />
      <g transform="translate(176 18)">
        <rect width="78" height="104" rx="16" fill={WHITE} />
        <rect x="14" y="16" width="36" height="8" rx="4" fill={BLUE} />
        <rect x="14" y="34" width="50" height="40" rx="8" fill={MIST} />
        <text
          x="39"
          y="92"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill={BLUE}
        >
          PNG
        </text>
      </g>
    </svg>
  );
}

export function PublishArt() {
  return (
    <svg viewBox="0 0 240 130" className="h-auto w-full max-w-[240px]" aria-hidden>
      <rect x="8" y="32" width="52" height="68" rx="12" fill={WHITE} />
      <rect x="18" y="44" width="28" height="6" rx="3" fill={BLUE} />
      <rect x="18" y="56" width="32" height="24" rx="6" fill={MIST} />
      <path
        d="M72 66h26"
        stroke={WHITE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M90 58l10 8-10 8"
        fill="none"
        stroke={WHITE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="112"
        y="22"
        width="40"
        height="54"
        rx="10"
        fill={WHITE}
        transform="rotate(-8 132 49)"
      />
      <rect x="136" y="16" width="40" height="54" rx="10" fill={WHITE} />
      <rect
        x="160"
        y="24"
        width="40"
        height="54"
        rx="10"
        fill={WHITE}
        transform="rotate(8 180 51)"
      />
      <circle cx="196" cy="96" r="16" fill={INK} />
      <path
        d="M190 96l4 4 8-9"
        fill="none"
        stroke={WHITE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
