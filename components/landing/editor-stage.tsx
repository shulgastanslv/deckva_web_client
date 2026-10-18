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
      <div className="relative rounded-t-[1.45rem] bg-land-ink p-2 pb-0 shadow-[0_28px_60px_rgba(20,21,28,0.16)]">
        <div className="absolute left-1/2 top-[7px] z-10 size-1.5 -translate-x-1/2 rounded-full bg-white/25" />
        <div className="overflow-hidden rounded-t-[0.95rem] bg-white text-land-ink">
      <header className="flex h-9 items-center justify-between gap-2 border-b border-land-ink/6 px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Logo width={20} height={20} />
          <span className="truncate rounded-full bg-land-mist px-2 py-0.5 text-[10px] font-medium">
            Untitled Project
          </span>
        </div>
        <div className="flex items-center gap-1 text-land-ink/40">
          <Undo2 className="size-3" />
          <Redo2 className="size-3" />
          <span className="rounded-full bg-land-mist px-2 py-0.5 text-[10px] font-semibold text-land-ink">
            Save
          </span>
          <Focus className="size-3" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-land-blue px-2 py-0.5 text-[10px] font-semibold text-white">
          <ArrowUp className="size-2.5" />
          Export
        </span>
      </header>

      <div className="grid grid-cols-[34px_minmax(0,1fr)_78px]">
        <aside className="flex flex-col items-center gap-1 border-r border-land-ink/6 py-2">
          {RAIL.map((Icon, index) => (
            <span
              key={index}
              className={`grid size-5 place-items-center rounded-full ${
                index === 0 ? "bg-land-mist text-land-ink" : "text-land-ink/40"
              }`}
            >
              <Icon className="size-3" strokeWidth={2} />
            </span>
          ))}
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex h-8 items-center gap-1.5 border-b border-land-ink/6 px-2">
            <span className="text-[9px] font-medium uppercase tracking-wide text-land-ink/40">Ratio</span>
            <div className="flex rounded-full bg-land-mist p-0.5">
              {RATIOS.map((ratio) => (
                <span
                  key={ratio}
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                    ratio === "4:5" ? "bg-white text-land-ink shadow-sm" : "text-land-ink/40"
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
              backgroundImage: "radial-gradient(#c9d4ff 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          >
            <div className="w-[46%] overflow-hidden rounded-lg bg-white shadow-[0_10px_24px_rgba(20,21,28,0.12)]">
              <div className="aspect-[4/5] bg-white p-2">
                <div className="h-1.5 w-2/3 rounded-full bg-land-mist" />
                <div className="mt-1 h-1 w-1/2 rounded-full bg-land-mist" />
                <div className="mt-2 h-[46%] rounded-md bg-land-mist" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 border-t border-land-ink/6 px-2 py-1.5">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-8 w-[22px] rounded-md bg-land-mist ${
                  index === 0 ? "ring-2 ring-land-ink" : "opacity-60"
                }`}
              />
            ))}
            <span className="grid size-5 place-items-center rounded-full bg-land-mist text-[12px] text-land-ink/40">
              +
            </span>
          </div>
        </div>

        <aside className="space-y-1.5 border-l border-land-ink/6 p-1.5">
          <div className="rounded-lg bg-land-mist p-1.5">
            <p className="text-[8px] font-bold text-land-ink/40">Text</p>
            <div className="mt-1 h-1 rounded-full bg-land-ink/25" />
            <div className="mt-0.5 h-1 w-2/3 rounded-full bg-land-ink/10" />
          </div>
          <div className="rounded-lg bg-land-mist p-1.5">
            <p className="text-[8px] font-bold text-land-ink/40">Fill</p>
            <div className="mt-1 flex gap-1">
              <span className="size-2.5 rounded-full bg-land-blue" />
              <span className="size-2.5 rounded-full bg-land-ink" />
              <span className="size-2.5 rounded-full bg-[#c9d4ff]" />
            </div>
          </div>
          <div className="rounded-lg bg-land-mist p-1.5">
            <p className="text-[8px] font-bold text-land-ink/40">Layers</p>
            <div className="mt-1 space-y-0.5">
              <div className="h-1 rounded-full bg-land-blue/50" />
              <div className="h-1 w-4/5 rounded-full bg-land-ink/15" />
            </div>
          </div>
        </aside>
      </div>
        </div>
      </div>
      <div className="h-2.5 rounded-b-[0.55rem] bg-land-ink" />
      <div className="relative -mt-px h-3.5 w-full rounded-b-[1.1rem] bg-gradient-to-b from-[#c9d4ff] to-[#a8b6e8] shadow-[0_14px_28px_rgba(20,21,28,0.12)] sm:w-[106%] sm:-translate-x-[3%]">
        <div className="absolute left-1/2 top-0 h-1.5 w-14 -translate-x-1/2 rounded-b-md bg-land-ink" />
      </div>
    </div>
  );
}
