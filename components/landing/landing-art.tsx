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
    <svg viewBox="0 0 400 240" className="h-auto w-full max-w-[440px]" aria-hidden>
      <circle cx="210" cy="128" r="88" fill={MIST} />

      {/* Topic prompt */}
      <rect x="28" y="72" width="118" height="96" rx="20" fill={WHITE} />
      <circle cx="48" cy="94" r="8" fill={BLUE} />
      <path
        d="M48 90v8M44 94h8"
        stroke={WHITE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="62" y="88" width="64" height="8" rx="4" fill={INK} />
      <rect x="44" y="112" width="86" height="7" rx="3.5" fill={BLUE_SOFT} />
      <rect x="44" y="126" width="68" height="7" rx="3.5" fill={MIST} />
      <rect x="44" y="140" width="52" height="7" rx="3.5" fill={MIST} />

      {/* Topic → carousel */}
      <path
        d="M156 120h28"
        fill="none"
        stroke={BLUE}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M176 112l12 8-12 8"
        fill="none"
        stroke={BLUE}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ending slide */}
      <g transform="rotate(11 308 128)">
        <rect x="262" y="62" width="88" height="118" rx="16" fill={WHITE} />
        <rect x="276" y="78" width="40" height="7" rx="3.5" fill={BLUE_SOFT} />
        <rect x="276" y="94" width="58" height="36" rx="8" fill={MIST} />
        <rect x="276" y="140" width="34" height="6" rx="3" fill={MIST} />
      </g>

      {/* Middle slide */}
      <g transform="rotate(-9 232 130)">
        <rect x="188" y="58" width="88" height="118" rx="16" fill={WHITE} />
        <rect x="202" y="74" width="44" height="7" rx="3.5" fill={INK} />
        <rect x="202" y="90" width="58" height="42" rx="8" fill={MIST} />
        <rect x="202" y="142" width="28" height="6" rx="3" fill={BLUE_SOFT} />
      </g>

      {/* Cover slide */}
      <rect x="224" y="42" width="96" height="128" rx="18" fill={WHITE} />
      <rect x="240" y="58" width="52" height="9" rx="4.5" fill={INK} />
      <rect x="240" y="74" width="36" height="6" rx="3" fill={MIST} />
      <rect x="240" y="92" width="64" height="44" rx="10" fill={BLUE} />
      <rect x="252" y="106" width="28" height="6" rx="3" fill={WHITE} />
      <rect x="252" y="118" width="18" height="5" rx="2.5" fill={BLUE_SOFT} />
      <circle cx="248" cy="152" r="3.5" fill={BLUE} />
      <circle cx="262" cy="152" r="3.5" fill={MIST} />
      <circle cx="276" cy="152" r="3.5" fill={MIST} />

      {/* Spark */}
      <path
        d="M342 48l4 9 9 1.4-7 5.4 2.2 8.8L342 68l-8.2 4.6 2.2-8.8-7-5.4 9-1.4z"
        fill={BLUE}
      />
      <circle cx="56" cy="48" r="6" fill={BLUE_SOFT} />
      <circle cx="368" cy="168" r="5" fill={WHITE} />
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
    <svg viewBox="0 0 320 120" className="mt-6 h-auto w-full" aria-hidden>
      <rect x="24" y="32" width="272" height="56" rx="28" fill={WHITE} />
      <circle
        cx="52"
        cy="60"
        r="10"
        fill="none"
        stroke={BLUE}
        strokeWidth="3"
      />
      <path
        d="M60 68l8 8"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="80"
        y="66"
        fontSize="18"
        fontWeight="700"
        fill={INK}
        fontFamily="system-ui, sans-serif"
      >
        Icons
      </text>
      <rect x="222" y="46" width="2.5" height="28" rx="1.25" fill={BLUE} />
    </svg>
  );
}

export function TemplatesArt() {
  return (
    <svg viewBox="0 0 320 200" className="mt-4 h-auto w-full" aria-hidden>
      {/* Back template */}
      <g transform="rotate(-10 88 108)">
        <rect x="28" y="36" width="100" height="132" rx="18" fill={WHITE} />
        <rect x="44" y="52" width="56" height="8" rx="4" fill={BLUE_SOFT} />
        <rect x="44" y="68" width="68" height="42" rx="10" fill={MIST} />
        <rect x="44" y="122" width="40" height="6" rx="3" fill={MIST} />
        <rect x="44" y="136" width="28" height="6" rx="3" fill={MIST} />
      </g>

      {/* Middle template */}
      <g transform="rotate(7 248 112)">
        <rect x="196" y="32" width="100" height="132" rx="18" fill={WHITE} />
        <rect x="212" y="48" width="52" height="8" rx="4" fill={INK} />
        <rect x="212" y="64" width="68" height="48" rx="10" fill={MIST} />
        <circle cx="246" cy="140" r="10" fill={BLUE_SOFT} />
      </g>

      {/* Front cover template */}
      <rect x="110" y="24" width="108" height="144" rx="20" fill={WHITE} />
      <rect x="126" y="42" width="60" height="10" rx="5" fill={INK} />
      <rect x="126" y="60" width="40" height="6" rx="3" fill={MIST} />
      <rect x="126" y="80" width="76" height="52" rx="12" fill={BLUE} />
      <rect x="140" y="96" width="32" height="6" rx="3" fill={WHITE} />
      <rect x="140" y="110" width="22" height="5" rx="2.5" fill={BLUE_SOFT} />
      <circle cx="140" cy="150" r="3.5" fill={BLUE} />
      <circle cx="154" cy="150" r="3.5" fill={MIST} />
      <circle cx="168" cy="150" r="3.5" fill={MIST} />
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
