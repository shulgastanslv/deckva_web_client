import type { ReactNode } from "react";

function Board({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div className={`relative h-64 w-full overflow-hidden sm:h-72 ${className}`}>
      {children}
    </div>
  );
}

function Slide({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-14 flex-col gap-1.5 rounded-xl bg-white p-1.5 sm:w-16 ${className}`}>
      <div className="h-12 rounded-lg bg-[#d9e4ff] sm:h-14" />
      <div className="h-1.5 w-8 rounded-full bg-[#1c1d26]/15" />
      <div className="h-1.5 w-10 rounded-full bg-[#1c1d26]/10" />
    </div>
  );
}

/** A frame leaving Figma and landing as slides on a board. */
export function FigmaImportArt() {
  return (
    <Board className="bg-[#f3efff]">
      <div className="absolute top-6 left-[7%] w-[34%] rounded-2xl bg-white p-3">
        <p className="text-[11px] font-medium text-[#1c1d26]/45">Frame</p>
        <div className="mt-2 h-16 rounded-xl bg-[#c4b5fd] sm:h-20" />
        <div className="mt-2 h-1.5 w-16 rounded-full bg-[#1c1d26]/15" />
        <div className="mt-1.5 h-1.5 w-24 rounded-full bg-[#1c1d26]/10" />
      </div>

      <svg
        aria-hidden
        viewBox="0 0 80 24"
        className="absolute top-[46%] left-[42%] w-[12%] text-[#4262ff]"
      >
        <path
          d="M2 12h62M52 4l12 8-12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute top-8 right-[6%] rounded-2xl bg-[#e7e4ff] p-3">
        <p className="mb-2 text-[11px] font-medium text-[#1c1d26]/45">Slides</p>
        <div className="flex gap-2">
          <Slide />
          <Slide />
          <Slide />
        </div>
      </div>

      <div className="absolute bottom-5 left-[38%] hidden w-24 rotate-[-6deg] rounded-xl bg-[#ffe56a] p-2 text-[11px] leading-tight font-medium text-[#1c1d26] sm:block">
        Keep the order
      </div>
    </Board>
  );
}

/** Slides leaving the board as a file. */
export function FigmaExportArt() {
  return (
    <Board className="bg-[#eaf2ff]">
      <div className="absolute top-8 left-[6%] rounded-2xl bg-[#dce8ff] p-3">
        <p className="mb-2 text-[11px] font-medium text-[#1c1d26]/45">Slides</p>
        <div className="flex gap-2">
          <Slide />
          <Slide />
          <Slide />
        </div>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 80 24"
        className="absolute top-[46%] left-[46%] w-[12%] text-[#4262ff]"
      >
        <path
          d="M2 12h62M52 4l12 8-12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute top-6 right-[7%] w-[30%] rounded-2xl bg-white p-3">
        <p className="text-[11px] font-medium text-[#1c1d26]/45">File</p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f6fb] px-2 py-1.5">
            <div className="size-6 rounded-lg bg-[#4262ff]" />
            <div className="h-1.5 w-12 rounded-full bg-[#1c1d26]/20" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f6fb] px-2 py-1.5">
            <div className="size-6 rounded-lg bg-[#ffd6e8]" />
            <div className="h-1.5 w-10 rounded-full bg-[#1c1d26]/20" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f6fb] px-2 py-1.5">
            <div className="size-6 rounded-lg bg-[#d7f5e3]" />
            <div className="h-1.5 w-14 rounded-full bg-[#1c1d26]/20" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-[40%] hidden w-20 rotate-[5deg] rounded-xl bg-[#ffd6e8] p-2 text-[11px] leading-tight font-medium text-[#1c1d26] sm:block">
        PNG and ZIP
      </div>
    </Board>
  );
}
