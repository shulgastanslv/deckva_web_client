import type { ReactNode } from "react";

function Canvas({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="flex h-64 w-full items-center overflow-hidden bg-[#f6f7f9] px-4 sm:h-80 sm:px-7 [background-image:radial-gradient(circle,rgba(28,29,38,0.14)_1px,transparent_1px)] [background-size:18px_18px]"
    >
      {children}
    </div>
  );
}

function FigmaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className}>
      <path fill="#F24E1E" d="M0 6a6 6 0 0 1 6-6h6v12H6A6 6 0 0 1 0 6Z" />
      <path fill="#FF7262" d="M12 0h6a6 6 0 0 1 0 12h-6V0Z" />
      <path fill="#A259FF" d="M0 18a6 6 0 0 1 6-6h6v12H6a6 6 0 0 1-6-6Z" />
      <path fill="#1ABCFE" d="M18 12a6 6 0 1 0 0 12 6 6 0 1 0 0-12Z" />
      <path fill="#0ACF83" d="M6 36a6 6 0 0 0 6-6v-6H6a6 6 0 0 0 0 12Z" />
    </svg>
  );
}

function LogoTile() {
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] border border-[#1c1d26]/8 bg-white sm:size-[4.25rem]">
      <FigmaMark className="h-8 w-[22px]" />
    </div>
  );
}

function SoftLink({ flip = false }: { flip?: boolean }) {
  const d = flip
    ? "M70 22C44 22 34 30 28 40C20 52 14 56 2 56"
    : "M2 22C28 22 38 30 44 40C52 52 58 56 70 56";

  return (
    <svg viewBox="0 0 72 72" className="h-16 w-11 shrink-0 sm:h-20 sm:w-16">
      <path
        d={d}
        fill="none"
        stroke="#7aa6ff"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="36" cy="40" r="2.3" fill="#7aa6ff" />
    </svg>
  );
}

const SLIDES = [
  { wash: "#e4ecff", plate: "#8eafff" },
  { wash: "#ffe3ee", plate: "#ff9ec4" },
  { wash: "#ddf7e8", plate: "#7ed9ae" },
] as const;

/** A Figma frame arriving on the slide. */
export function FigmaImportArt() {
  return (
    <Canvas>
      <LogoTile />
      <SoftLink />
      <div className="min-w-0 flex-1 rounded-[1.35rem] border border-[#1c1d26]/8 bg-white p-2.5 sm:p-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="rounded-xl bg-[#f3f6ff] px-2.5 py-2">
            <div className="h-1.5 w-2/5 rounded-full bg-[#8eafff]" />
            <div className="mt-1.5 h-1.5 w-3/5 rounded-full bg-[#1c1d26]/10" />
          </div>
          <div className="flex items-end gap-1 rounded-xl bg-[#f7f8fb] px-2.5 py-2">
            <div className="h-2 flex-1 rounded-sm bg-[#d5e2ff]" />
            <div className="h-3.5 flex-1 rounded-sm bg-[#b7cdff]" />
            <div className="h-2.5 flex-1 rounded-sm bg-[#d5e2ff]" />
            <div className="h-5 flex-1 rounded-sm bg-[#8eafff]" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-7 rounded-lg bg-[#ffe7a3]" />
            <div className="h-7 rounded-lg bg-[#ffd0e4]" />
            <div className="h-7 rounded-lg bg-[#c9f5de]" />
          </div>
        </div>
      </div>
    </Canvas>
  );
}

/** Slides leaving the board as a Figma file. */
export function FigmaExportArt() {
  return (
    <Canvas>
      <div className="flex min-w-0 flex-1 gap-1.5 sm:gap-2">
        {SLIDES.map((slide) => (
          <div
            key={slide.wash}
            className="min-w-0 flex-1 rounded-2xl border border-[#1c1d26]/8 bg-white p-1.5"
          >
            <div className="h-8 rounded-lg sm:h-11" style={{ backgroundColor: slide.wash }}>
              <div
                className="h-1/2 rounded-t-lg"
                style={{ backgroundColor: slide.plate }}
              />
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-[#1c1d26]/12" />
            <div className="mt-1 h-1 w-4/5 rounded-full bg-[#1c1d26]/8" />
          </div>
        ))}
      </div>
      <SoftLink flip />
      <LogoTile />
    </Canvas>
  );
}
