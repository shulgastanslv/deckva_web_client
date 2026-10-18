import type { ReactNode } from "react";

function Card({
  className,
  eyebrow,
  ink,
  title,
  text,
  dark,
  children,
}: {
  className: string;
  eyebrow: string;
  ink: string;
  title: string;
  text: string;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <article className={`overflow-hidden rounded-[2rem] p-6 sm:rounded-[2.4rem] sm:p-7 ${className}`}>
      <p className="text-[13px] font-bold" style={{ color: ink }}>
        {eyebrow}
      </p>
      <h3 className={`mt-2 text-2xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#14151c]"}`}>
        {title}
      </h3>
      <p className={`mt-2 max-w-sm text-[13px] leading-relaxed ${dark ? "text-white/70" : "text-[#5c6170]"}`}>
        {text}
      </p>
      {children}
    </article>
  );
}

export function StudioCapabilities() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-12">
        <Card
          className="bg-[#e4ebff] md:col-span-7"
          eyebrow="Backgrounds"
          ink="#3a4f9a"
          title="Fill, pattern, or a split"
          text="A solid color, a texture, or two halves. Put it on every slide, only the marked ones, or just this frame."
        >
          <BackgroundArt />
        </Card>
        <Card
          className="bg-[#efe7ff] md:col-span-5"
          eyebrow="Grid"
          ink="#6b5f9a"
          title="Columns that snap"
          text="Columns, rows, and a margin. Objects sit on the lines instead of drifting."
        >
          <GridArt />
        </Card>
        <Card
          className="bg-[#fff4cc] md:col-span-5"
          eyebrow="Palette sets"
          ink="#8a7a3a"
          title="A set, not one swatch"
          text="Background, text, and accent move together. Apply the set to the carousel or to one slide."
        >
          <PaletteArt />
        </Card>
        <Card
          className="bg-[#14151c] md:col-span-7"
          eyebrow="Focus"
          ink="#ffe08a"
          title="The slide, nothing else"
          text="Focus mode clears the panels. You edit the frame. Esc brings the studio back."
          dark
        >
          <FocusArt />
        </Card>
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/5 sm:rounded-[2.4rem]">
        <div className="border-b border-black/5 px-6 py-5 sm:px-8 sm:py-6">
          <p className="text-[13px] font-bold tracking-wide text-[#2f5bff]">
            Details
          </p>
          <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#14151c] sm:text-3xl">
            Small tools that finish the post
          </h3>
        </div>
        <ul className="divide-y divide-black/5">
          <ToolRow
            eyebrow="Slides from text"
            title="One line, one slide"
            text="Paste the story. Each line becomes a frame."
          >
            <LinesArt />
          </ToolRow>
          <ToolRow
            eyebrow="Author"
            title="Name in the corner"
            text="Avatar and @handle, dropped onto the slide."
          >
            <AuthorArt />
          </ToolRow>
          <ToolRow
            eyebrow="Swipe"
            title="The cue to continue"
            text="swipe → sits where the thumb lands."
          >
            <SwipeArt />
          </ToolRow>
          <ToolRow
            eyebrow="Numbers"
            title="01 of 08"
            text="Pick the style and the corner. The count follows the deck."
          >
            <NumbersArt />
          </ToolRow>
        </ul>
      </div>
    </div>
  );
}

function ToolRow({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <li className="grid items-center gap-4 px-6 py-5 sm:grid-cols-[1fr_200px] sm:gap-8 sm:px-8 sm:py-6">
      <div>
        <p className="text-[13px] font-bold text-[#2f5bff]">{eyebrow}</p>
        <h4 className="mt-1 text-xl font-extrabold tracking-tight text-[#14151c]">
          {title}
        </h4>
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-[#5c6170]">
          {text}
        </p>
      </div>
      <div className="justify-self-start sm:justify-self-end">{children}</div>
    </li>
  );
}

function BackgroundArt() {
  return (
    <svg viewBox="0 0 420 170" className="mt-5 h-auto w-full" aria-hidden>
      <circle cx="210" cy="96" r="72" fill="#fff" opacity="0.55" />

      {/* fill */}
      <rect x="54" y="34" width="88" height="108" rx="18" fill="#2f5bff" />
      <rect x="70" y="58" width="40" height="5" rx="2.5" fill="#fff" opacity="0.85" />
      <rect x="70" y="70" width="26" height="4" rx="2" fill="#fff" opacity="0.3" />

      {/* pattern */}
      <rect x="166" y="26" width="88" height="118" rx="18" fill="#fff" />
      <path
        d="M178 48h64M178 64h64M178 80h64M178 96h64M178 112h40"
        stroke="#c9d4ff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* split */}
      <clipPath id="bg-split">
        <rect x="278" y="34" width="88" height="108" rx="18" />
      </clipPath>
      <g clipPath="url(#bg-split)">
        <rect x="278" y="34" width="88" height="108" fill="#14151c" />
        <rect x="278" y="34" width="44" height="108" fill="#ffe08a" />
      </g>
    </svg>
  );
}

function GridArt() {
  return (
    <svg viewBox="0 0 280 170" className="mt-5 h-auto w-full" aria-hidden>
      <rect x="48" y="18" width="184" height="134" rx="20" fill="#fff" />

      {/* selection grid */}
      <path
        d="M84 34v102M120 34v102M156 34v102M192 34v102M64 54h152M64 74h152M64 94h152M64 114h152"
        stroke="#cfc3ef"
        strokeWidth="1.75"
      />

      {/* muted square snapped to cells */}
      <rect x="120" y="74" width="72" height="40" rx="6" fill="#f9f9f9" />

      {/* selection outline */}
      <rect
        x="120"
        y="74"
        width="72"
        height="40"
        rx="6"
        fill="none"
        stroke="#2f5bff"
        strokeWidth="2"
      />

      {/* selection handles */}
      <circle cx="120" cy="74" r="3.5" fill="#2f5bff" />
      <circle cx="192" cy="74" r="3.5" fill="#2f5bff" />
      <circle cx="120" cy="114" r="3.5" fill="#2f5bff" />
      <circle cx="192" cy="114" r="3.5" fill="#2f5bff" />
    </svg>
  );
}

function PaletteArt() {
  return (
    <svg viewBox="0 0 280 150" className="mt-3 h-auto w-full" aria-hidden>
      {/* three themed carousel slides */}
      <rect x="16" y="28" width="72" height="88" rx="12" fill="#14151c" />
      <rect x="28" y="44" width="36" height="5" rx="2.5" fill="#fff" />
      <rect x="28" y="56" width="24" height="4" rx="2" fill="#5c6170" />
      <rect x="28" y="88" width="28" height="12" rx="4" fill="#2f5bff" />

      <rect x="100" y="20" width="80" height="100" rx="12" fill="#fff" />
      <rect x="114" y="40" width="40" height="5" rx="2.5" fill="#14151c" />
      <rect x="114" y="52" width="28" height="4" rx="2" fill="#c9d4ff" />
      <rect x="114" y="88" width="32" height="14" rx="4" fill="#ffe08a" />

      <rect x="192" y="28" width="72" height="88" rx="12" fill="#e5f6ea" />
      <rect x="204" y="44" width="36" height="5" rx="2.5" fill="#3d6b4f" />
      <rect x="204" y="56" width="24" height="4" rx="2" fill="#3d6b4f" opacity="0.35" />
      <rect x="204" y="88" width="28" height="12" rx="4" fill="#3d6b4f" />
    </svg>
  );
}

function FocusArt() {
  return (
    <svg viewBox="0 0 420 170" className="mt-5 h-auto w-full" aria-hidden>
      {/* faded neighbors — almost gone */}
      <rect x="48" y="42" width="64" height="86" rx="16" fill="#2a2c38" opacity="0.45" />
      <rect x="308" y="42" width="64" height="86" rx="16" fill="#2a2c38" opacity="0.45" />

      {/* the only slide that matters */}
      <rect x="140" y="18" width="140" height="134" rx="22" fill="#fff" />
      <rect x="164" y="48" width="56" height="6" rx="3" fill="#14151c" />
      <rect x="164" y="62" width="36" height="4" rx="2" fill="#d5d8e4" />
      <rect x="164" y="84" width="92" height="36" rx="10" fill="#2f5bff" />
      <rect x="176" y="98" width="28" height="4" rx="2" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function LinesArt() {
  return (
    <svg viewBox="0 0 220 100" className="h-auto w-full" aria-hidden>
      {/* text lines */}
      <rect x="8" y="22" width="56" height="5" rx="2.5" fill="#14151c" />
      <rect x="8" y="36" width="44" height="5" rx="2.5" fill="#c9d4ff" />
      <rect x="8" y="50" width="50" height="5" rx="2.5" fill="#e4ebff" />
      <rect x="8" y="64" width="36" height="5" rx="2.5" fill="#c9d4ff" />
      {/* arrow */}
      <path d="M78 48h18" stroke="#2f5bff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M90 42l8 6-8 6" fill="none" stroke="#2f5bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* resulting carousel frames */}
      <rect x="112" y="18" width="28" height="64" rx="7" fill="#fff" stroke="#e4ebff" strokeWidth="2" />
      <rect x="118" y="30" width="16" height="3" rx="1.5" fill="#14151c" />
      <rect x="146" y="18" width="28" height="64" rx="7" fill="#fff" stroke="#e4ebff" strokeWidth="2" />
      <rect x="152" y="30" width="16" height="3" rx="1.5" fill="#14151c" />
      <rect x="180" y="18" width="28" height="64" rx="7" fill="#2f5bff" />
      <rect x="186" y="30" width="16" height="3" rx="1.5" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function AuthorArt() {
  return (
    <svg viewBox="0 0 220 100" className="h-auto w-full" aria-hidden>
      {/* peek previous */}
      <rect x="8" y="22" width="36" height="56" rx="8" fill="#e4ebff" />
      {/* main slide with author badge */}
      <rect x="52" y="8" width="100" height="84" rx="12" fill="#fff" />
      <rect x="68" y="24" width="52" height="6" rx="3" fill="#14151c" />
      <rect x="68" y="38" width="36" height="4" rx="2" fill="#e4ebff" />
      <circle cx="70" cy="74" r="9" fill="#14151c" />
      <rect x="84" y="70" width="40" height="5" rx="2.5" fill="#14151c" />
      <rect x="84" y="78" width="22" height="3.5" rx="1.75" fill="#c9d4ff" />
      {/* peek next */}
      <rect x="160" y="22" width="36" height="56" rx="8" fill="#e4ebff" />
    </svg>
  );
}

function SwipeArt() {
  return (
    <svg viewBox="0 0 220 100" className="h-auto w-full" aria-hidden>
      <rect x="28" y="8" width="100" height="84" rx="12" fill="#fff" />
      <rect x="44" y="24" width="52" height="6" rx="3" fill="#14151c" />
      <rect x="44" y="38" width="36" height="4" rx="2" fill="#e4ebff" />
      {/* swipe cue */}
      <rect x="52" y="68" width="52" height="14" rx="7" fill="#14151c" />
      <path d="M68 75h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M80 71l6 4-6 4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* next frames sliding in */}
      <rect x="140" y="18" width="32" height="64" rx="8" fill="#c9d4ff" />
      <rect x="180" y="28" width="28" height="44" rx="7" fill="#e4ebff" />
    </svg>
  );
}

function NumbersArt() {
  return (
    <svg viewBox="0 0 220 100" className="h-auto w-full" aria-hidden>
      {/* carousel stack */}
      <rect x="24" y="28" width="40" height="52" rx="8" fill="#e4ebff" />
      <rect x="72" y="16" width="76" height="68" rx="10" fill="#14151c" />
      <rect x="88" y="32" width="36" height="5" rx="2.5" fill="#fff" opacity="0.9" />
      <rect x="88" y="44" width="24" height="4" rx="2" fill="#5c6170" />
      {/* counter badge */}
      <rect x="88" y="58" width="44" height="14" rx="7" fill="#2f5bff" />
      <text x="110" y="68" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">
        01 / 08
      </text>
      <rect x="156" y="28" width="40" height="52" rx="8" fill="#e4ebff" />
    </svg>
  );
}
