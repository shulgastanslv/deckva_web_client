import type { ReactNode } from "react";

function Canvas({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="flex h-64 w-full items-center gap-3 overflow-hidden bg-[#f4f5f7] px-5 sm:h-72 sm:gap-5 sm:px-8 [background-image:radial-gradient(circle,rgba(28,29,38,0.16)_1px,transparent_1px)] [background-size:16px_16px]"
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

function Link() {
  return <div className="h-px w-8 shrink-0 bg-[#4d8dff] sm:w-14" />;
}

function Bar() {
  return <div className="h-px w-full bg-[#1c1d26]/15" />;
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-[#1c1d26]/10 bg-white p-3 sm:rounded-3xl sm:p-4">
      {children}
    </div>
  );
}

/** A Figma frame arriving on the slide. */
export function FigmaImportArt() {
  return (
    <Canvas>
      <LogoTile />
      <Link />
      <Frame>
        <div className="h-14 rounded-lg bg-[#e8eaef] sm:h-16" />
        <div className="mt-3 space-y-2">
          <Bar />
          <Bar />
          <Bar />
        </div>
      </Frame>
    </Canvas>
  );
}

/** Slides leaving the board as a Figma file. */
export function FigmaExportArt() {
  return (
    <Canvas>
      <Frame>
        <div className="grid grid-cols-3 gap-2">
          {["a", "b", "c"].map((id) => (
            <div key={id} className="space-y-2">
              <div className="h-10 rounded-lg bg-[#e8eaef] sm:h-14" />
              <Bar />
              <Bar />
            </div>
          ))}
        </div>
      </Frame>
      <Link />
      <LogoTile />
    </Canvas>
  );
}
