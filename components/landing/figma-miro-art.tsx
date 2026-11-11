import type { ReactNode } from "react";

function Canvas({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="flex h-full min-h-56 w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#F2F2F2] px-5 sm:min-h-64 sm:rounded-[1.75rem] sm:px-8 dark:bg-[#2a2b33]"
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
    <svg viewBox="0 0 72 72" className="h-16 w-10 shrink-0 sm:h-20 sm:w-14">
      <path
        d={d}
        fill="none"
        stroke="#b7c9f5"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SlideFace({
  image,
  accent,
  className = "",
}: {
  image: string;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-[4/5] w-full flex-col overflow-hidden rounded-xl border border-[#1c1d26]/8 bg-white ${className}`}
    >
      <div className="min-h-0 flex-[3]" style={{ backgroundColor: image }} />
      <div className="flex flex-[2] flex-col justify-center gap-1 px-1.5 sm:px-2">
        <div className="h-1 w-3/5 rounded-full bg-[#1c1d26]/35" />
        <div className="h-0.5 w-full rounded-full bg-[#1c1d26]/12" />
        <div className="h-0.5 w-4/5 rounded-full bg-[#1c1d26]/10" />
        <div className="mt-0.5 h-2 w-2/5 rounded-full" style={{ backgroundColor: accent }} />
      </div>
    </div>
  );
}

const SLIDES = [
  { image: "#dce6ff", accent: "#b7c8f6" },
  { image: "#ffe4ef", accent: "#f3c0d4" },
  { image: "#e3f6ec", accent: "#b7e0cb" },
] as const;

/** A Figma frame arriving in the editor. */
export function FigmaImportArt() {
  return (
    <Canvas>
      <LogoTile />
      <SoftLink />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-[#1c1d26]/8 bg-white">
        <div className="flex items-center gap-2 border-b border-[#1c1d26]/8 px-2.5 py-1.5">
          <FigmaMark className="h-3.5 w-2.5 shrink-0" />
          <div className="h-1.5 w-14 rounded-full bg-[#1c1d26]/25" />
          <div className="ml-auto h-4 w-9 rounded-full bg-[#dce6ff]" />
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-[4.75rem] shrink-0 flex-col gap-1 border-r border-[#1c1d26]/8 bg-[#fafbfc] p-1.5 sm:flex">
            {[
              { tone: SLIDES[0].image, width: "w-8", on: true },
              { tone: SLIDES[1].image, width: "w-10", on: false },
              { tone: SLIDES[2].image, width: "w-7", on: false },
            ].map((layer) => (
              <div
                key={layer.tone}
                className={`flex items-center gap-1 rounded-md px-1 py-1 ${layer.on ? "bg-[#e7eeff]" : ""}`}
              >
                <div
                  className="size-3 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: layer.tone }}
                />
                <div className={`h-1 rounded-full bg-[#1c1d26]/25 ${layer.width}`} />
              </div>
            ))}
          </div>
          <div className="flex flex-1 items-center justify-center bg-[#f3f5f8] p-3 sm:p-4">
            <div className="w-[6.25rem] sm:w-[8.25rem]">
              <SlideFace image={SLIDES[0].image} accent={SLIDES[0].accent} />
            </div>
          </div>
        </div>
      </div>
    </Canvas>
  );
}

/** Finished slides leaving for a Figma file. */
export function FigmaExportArt() {
  return (
    <Canvas>
      <div className="grid min-w-0 flex-1 grid-cols-3 items-center gap-1.5 sm:gap-2.5">
        {SLIDES.map((slide) => (
          <SlideFace key={slide.image} image={slide.image} accent={slide.accent} />
        ))}
      </div>
      <SoftLink flip />
      <LogoTile />
    </Canvas>
  );
}
