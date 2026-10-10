import {
  ArrowUp,
  Focus,
  Folder,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Redo2,
  Shapes,
  Sparkles,
  Sticker,
  Undo2,
  WandSparkles,
} from "lucide-react";
import Logo from "@/components/logo";

const RAIL = [Sparkles, WandSparkles, Shapes, Folder, Layers, LayoutTemplate, ImageIcon, Sticker];
const RATIOS = ["4:5", "1:1", "9:16", "16:9"] as const;

export function EditorStage() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]" aria-hidden>
      <div className="relative rounded-t-[1.45rem] bg-[#14151c] p-2 pb-0 shadow-[0_28px_60px_rgba(20,21,28,0.16)]">
        <div className="absolute left-1/2 top-[7px] z-10 size-1.5 -translate-x-1/2 rounded-full bg-white/25" />
        <div className="overflow-hidden rounded-t-[0.95rem] bg-white text-[#14151c]">
      <header className="flex h-9 items-center justify-between gap-2 border-b border-black/[0.06] px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Logo   width={20} height={20}/>
          <span className="truncate rounded-full bg-[#f4f5f9] px-2 py-0.5 text-[10px] font-medium">
            Untitled Project
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#8b90a0]">
          <Undo2 className="size-3" />
          <Redo2 className="size-3" />
          <span className="rounded-full bg-[#f4f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#14151c]">
            Save
          </span>
          <Focus className="size-3" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#2f5bff] px-2 py-0.5 text-[10px] font-semibold text-white">
          <ArrowUp className="size-2.5" />
          Export
        </span>
      </header>

      <div className="grid grid-cols-[34px_minmax(0,1fr)_78px]">
        <aside className="flex flex-col items-center gap-1 border-r border-black/[0.06] py-2">
          {RAIL.map((Icon, index) => (
            <span
              key={index}
              className={`grid size-5 place-items-center rounded-full ${
                index === 0 ? "bg-[#f4f5f9] text-[#14151c]" : "text-[#8b90a0]"
              }`}
            >
              <Icon className="size-3" strokeWidth={2} />
            </span>
          ))}
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex h-8 items-center gap-1.5 border-b border-black/[0.06] px-2">
            <span className="text-[9px] font-medium uppercase tracking-wide text-[#8b90a0]">Ratio</span>
            <div className="flex rounded-full bg-[#f4f5f9] p-0.5">
              {RATIOS.map((ratio) => (
                <span
                  key={ratio}
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                    ratio === "4:5" ? "bg-white text-[#14151c] shadow-sm" : "text-[#8b90a0]"
                  }`}
                >
                  {ratio}
                </span>
              ))}
            </div>
          </div>

          <div
            className="flex flex-1 items-center justify-center py-3"
            style={{
              backgroundImage: "radial-gradient(#d5d8e4 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          >
            <div className="w-[46%] overflow-hidden rounded-lg bg-white shadow-[0_10px_24px_rgba(20,21,28,0.12)]">
              <div className="aspect-[4/5] bg-white p-2">
                <div className="h-1.5 w-2/3 rounded-full bg-muted" />
                <div className="mt-1 h-1 w-1/2 rounded-full bg-muted" />
                <div className="mt-2 h-[46%] rounded-md bg-muted" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 border-t border-black/[0.06] px-2 py-1.5">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-8 w-[22px] rounded-md bg-muted ${
                  index === 0 ? "ring-2 ring-black" : "opacity-60"
                }`}
              />
            ))}
            <span className="grid size-5 place-items-center rounded-full bg-[#f4f5f9] text-[12px] text-[#8b90a0]">
              +
            </span>
          </div>
        </div>

        <aside className="space-y-1.5 border-l border-black/[0.06] p-1.5">
          <div className="rounded-lg bg-[#f4f5f9] p-1.5">
            <p className="text-[8px] font-bold text-[#8b90a0]">Text</p>
            <div className="mt-1 h-1 rounded-full bg-[#14151c]/25" />
            <div className="mt-0.5 h-1 w-2/3 rounded-full bg-[#14151c]/10" />
          </div>
          <div className="rounded-lg bg-[#f4f5f9] p-1.5">
            <p className="text-[8px] font-bold text-[#8b90a0]">Fill</p>
            <div className="mt-1 flex gap-1">
              <span className="size-2.5 rounded-full bg-[#2f5bff]" />
              <span className="size-2.5 rounded-full bg-[#14151c]" />
              <span className="size-2.5 rounded-full bg-[#ffe08a]" />
            </div>
          </div>
          <div className="rounded-lg bg-[#f4f5f9] p-1.5">
            <p className="text-[8px] font-bold text-[#8b90a0]">Layers</p>
            <div className="mt-1 space-y-0.5">
              <div className="h-1 rounded-full bg-[#2f5bff]/50" />
              <div className="h-1 w-4/5 rounded-full bg-[#14151c]/15" />
            </div>
          </div>
        </aside>
      </div>
        </div>
      </div>
      <div className="h-2.5 rounded-b-[0.55rem] bg-[#14151c]" />
      <div className="relative -mt-px h-3.5 w-full rounded-b-[1.1rem] bg-gradient-to-b from-[#d8dbe4] to-[#b4b8c4] shadow-[0_14px_28px_rgba(20,21,28,0.12)] sm:w-[106%] sm:-translate-x-[3%]">
        <div className="absolute left-1/2 top-0 h-1.5 w-14 -translate-x-1/2 rounded-b-md bg-[#14151c]" />
      </div>
    </div>
  );
}
