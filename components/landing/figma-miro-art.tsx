import type { ReactNode } from "react";

function Canvas({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="flex h-72 w-full items-center gap-1 overflow-hidden bg-[#f4f5f7] px-4 sm:h-80 sm:gap-2 sm:px-7 [background-image:radial-gradient(circle,rgba(28,29,38,0.16)_1px,transparent_1px)] [background-size:16px_16px]"
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
    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#1c1d26]/10 bg-white sm:size-16">
      <FigmaMark className="h-8 w-[22px]" />
    </div>
  );
}

function Curve() {
  return (
    <svg viewBox="0 0 96 48" className="h-12 w-12 shrink-0 sm:w-20">
      <path
        d="M2 16C34 16 48 30 94 30"
        fill="none"
        stroke="#4d8dff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="46" cy="23" r="2.6" fill="#4d8dff" />
    </svg>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1c1d26]/10 bg-white px-2.5 py-1 text-[11px] font-medium text-[#1c1d26]/70">
      {children}
    </div>
  );
}

function Lines({ widths }: { widths: string[] }) {
  return (
    <div className="space-y-1.5">
      {widths.map((width) => (
        <div key={width} className={`h-1.5 rounded-full bg-[#1c1d26]/12 ${width}`} />
      ))}
    </div>
  );
}

/** A Figma frame arriving on the slide. */
export function FigmaImportArt() {
  return (
    <Canvas>
      <LogoTile />
      <Curve />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Pill>
          <span className="size-1.5 rounded-full bg-[#1abcfe]" />
          Frame
        </Pill>
        <div className="rounded-2xl border border-[#1c1d26]/10 bg-white p-3 sm:rounded-3xl sm:p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-14 rounded-full bg-[#1c1d26]/18" />
            <div className="h-2 w-8 rounded-full bg-[#1c1d26]/10" />
          </div>
          <div className="mt-3 grid grid-cols-[1.15fr_0.85fr] gap-2">
            <div className="rounded-xl bg-[#f3f5fb] p-2.5">
              <div className="h-9 rounded-lg bg-[#dfe7ff] sm:h-12" />
              <div className="mt-2">
                <Lines widths={["w-4/5", "w-3/5"]} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-xl bg-[#fff6d6] p-2">
                <Lines widths={["w-8", "w-10"]} />
              </div>
              <div className="rounded-xl bg-[#e7f7ee] p-2">
                <div className="flex gap-1">
                  <span className="size-2 rounded-full bg-[#7dcea0]" />
                  <span className="size-2 rounded-full bg-[#f6c945]" />
                  <span className="size-2 rounded-full bg-[#f0a0b8]" />
                </div>
                <div className="mt-2 h-1.5 w-8 rounded-full bg-[#1c1d26]/15" />
              </div>
            </div>
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
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Pill>
          <span className="size-1.5 rounded-full bg-[#0acf83]" />
          Slides
        </Pill>
        <div className="rounded-2xl border border-[#1c1d26]/10 bg-white p-3 sm:rounded-3xl sm:p-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              "bg-[#dfe7ff]",
              "bg-[#ffe3ef]",
              "bg-[#e7f7ee]",
            ].map((tone) => (
              <div key={tone} className="rounded-xl bg-[#f6f7fb] p-1.5">
                <div className={`h-8 rounded-lg sm:h-11 ${tone}`} />
                <div className="mt-1.5 h-1 w-4/5 rounded-full bg-[#1c1d26]/15" />
                <div className="mt-1 h-1 w-3/5 rounded-full bg-[#1c1d26]/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Curve />
      <div className="flex shrink-0 flex-col items-center gap-2">
        <LogoTile />
        <Pill>PNG · ZIP</Pill>
      </div>
    </Canvas>
  );
}
