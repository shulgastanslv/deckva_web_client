import type { ReactNode } from "react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaTelegram,
  FaThreads,
  FaXTwitter,
} from "react-icons/fa6";

const NETWORKS = [
  {
    id: "instagram",
    name: "Instagram",
    use: "Feed carousel",
    panel: "#ffe4ef",
    ink: "#9a4f6b",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    use: "Document post",
    panel: "#e4ebff",
    ink: "#3a4f9a",
  },
  {
    id: "telegram",
    name: "Telegram",
    use: "Channel album",
    panel: "#e5f6ea",
    ink: "#3d6b4f",
  },
  {
    id: "threads",
    name: "Threads",
    use: "Short thread",
    panel: "#efe7ff",
    ink: "#6b5f9a",
  },
  {
    id: "x",
    name: "X",
    use: "Timeline frame",
    panel: "#fff4cc",
    ink: "#8a7a3a",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    use: "Tall pin",
    panel: "#14151c",
    ink: "#ffe08a",
  },
] as const;

const MARKS = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  telegram: FaTelegram,
  threads: FaThreads,
  x: FaXTwitter,
  pinterest: FaPinterestP,
} as const;

export function NetworksBlock() {
  return (
    <section id="networks" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-5 sm:px-6">
      <div className="mb-6 max-w-2xl">
        <p className="text-[13px] font-bold tracking-wide text-[#2f5bff]">Networks</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14151c] sm:text-4xl">
          One carousel, every feed
        </h2>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-[#5c6170]">
          The same story, redrawn for the place you post.
        </p>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
        {NETWORKS.map((network) => {
          const Logo = MARKS[network.id];
          const dark = network.id === "pinterest";
          return (
            <article
              key={network.id}
              className="w-[168px] shrink-0 snap-start rounded-[1.6rem] px-2.5 pb-3 pt-3 sm:w-auto"
              style={{ background: network.panel }}
            >
              <MiniPhone>
                <Schematic id={network.id} />
              </MiniPhone>
              <div className="mt-3 flex items-center gap-1.5 px-0.5">
                <Logo className={`size-3.5 shrink-0 ${dark ? "text-[#ffe08a]" : "text-[#14151c]"}`} />
                <div className="min-w-0">
                  <p className={`truncate text-[13px] font-bold leading-none ${dark ? "text-white" : "text-[#14151c]"}`}>
                    {network.name}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium leading-none" style={{ color: network.ink }}>
                    {network.use}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MiniPhone({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-[248px] w-full max-w-[148px] overflow-hidden rounded-[1.35rem] border-[5px] border-[#14151c] bg-white shadow-[0_14px_28px_rgba(20,21,28,0.14)]">
      <div className="absolute left-1/2 top-1.5 z-10 h-1 w-8 -translate-x-1/2 rounded-full bg-[#14151c]/80" />
      <div className="h-full overflow-hidden pt-3.5">{children}</div>
    </div>
  );
}

function Line({ className }: { className?: string }) {
  return <div className={`h-1 rounded-full bg-[#14151c]/15 ${className ?? ""}`} />;
}

function Dots({ light = false }: { light?: boolean }) {
  return (
    <span className="flex gap-0.5">
      <i className={`size-1 rounded-full ${light ? "bg-white" : "bg-[#14151c]"}`} />
      <i className={`size-1 rounded-full ${light ? "bg-white/40" : "bg-[#14151c]/20"}`} />
      <i className={`size-1 rounded-full ${light ? "bg-white/40" : "bg-[#14151c]/20"}`} />
    </span>
  );
}

function Schematic({ id }: { id: (typeof NETWORKS)[number]["id"] }) {
  if (id === "instagram") return <InstagramScheme />;
  if (id === "linkedin") return <LinkedInScheme />;
  if (id === "telegram") return <TelegramScheme />;
  if (id === "threads") return <ThreadsScheme />;
  if (id === "x") return <XScheme />;
  return <PinterestScheme />;
}

function InstagramScheme() {
  return (
    <div className="flex h-full flex-col bg-white px-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="size-4 rounded-full bg-[#ffe4ef]" />
        <Line className="w-10 bg-[#14151c]/50" />
      </div>
      <div className="relative mt-1.5 min-h-0 flex-1 overflow-hidden rounded-lg bg-[#ffe4ef]">
        <div className="absolute left-1.5 top-1.5 h-1 w-8 rounded-full bg-[#9a4f6b]" />
        <div className="absolute inset-x-1.5 bottom-4 h-[38%] rounded-md bg-[#2f5bff]" />
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
          <Dots light />
        </span>
      </div>
      <div className="mt-1.5 flex gap-1">
        <span className="size-2 rounded-full bg-[#14151c]/70" />
        <span className="size-2 rounded-full bg-[#14151c]/25" />
        <span className="size-2 rounded-full bg-[#14151c]/25" />
      </div>
    </div>
  );
}

function LinkedInScheme() {
  return (
    <div className="flex h-full flex-col bg-white px-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="size-4 rounded-[4px] bg-[#2f5bff]" />
        <Line className="w-8 bg-[#14151c]/50" />
      </div>
      <Line className="mt-2 w-12" />
      <div className="relative mx-auto mt-1.5 aspect-square w-full overflow-hidden rounded-lg bg-[#e4ebff]">
        <div className="absolute left-1.5 top-1.5 h-1 w-7 rounded-full bg-[#3a4f9a]" />
        <div className="absolute inset-x-1.5 bottom-4 h-[40%] rounded-md bg-[#2f5bff]" />
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
          <Dots />
        </span>
      </div>
      <Line className="mt-auto w-14" />
    </div>
  );
}

function TelegramScheme() {
  return (
    <div className="flex h-full flex-col bg-[#e5f6ea]">
      <div className="flex h-5 items-center gap-1 bg-[#3d6b4f] px-2">
        <span className="size-2.5 rounded-full bg-white/80" />
        <span className="h-1 w-8 rounded-full bg-white/70" />
      </div>
      <div className="m-1.5 rounded-xl rounded-tl-sm bg-white p-1">
        <div className="grid grid-cols-2 gap-0.5">
          <span className="aspect-square rounded-md bg-[#2f5bff]" />
          <span className="aspect-square rounded-md bg-[#e4ebff]" />
          <span className="aspect-square rounded-md bg-[#fff4cc]" />
          <span className="aspect-square rounded-md bg-[#efe7ff]" />
        </div>
        <Line className="mx-0.5 mt-1 w-12" />
      </div>
    </div>
  );
}

function ThreadsScheme() {
  return (
    <div className="flex h-full flex-col bg-white px-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="size-4 rounded-full bg-[#efe7ff]" />
        <div className="space-y-0.5">
          <Line className="w-8 bg-[#14151c]/50" />
          <Line className="w-5" />
        </div>
      </div>
      <Line className="mt-2 w-full" />
      <Line className="mt-1 w-2/3" />
      <div className="relative mt-1.5 aspect-square w-full overflow-hidden rounded-lg bg-[#efe7ff]">
        <div className="absolute inset-x-1.5 bottom-4 top-1.5 rounded-md bg-[#6b5f9a]/80" />
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
          <Dots light />
        </span>
      </div>
    </div>
  );
}

function XScheme() {
  return (
    <div className="flex h-full flex-col bg-white px-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="size-4 rounded-full bg-[#14151c]" />
        <Line className="w-10 bg-[#14151c]/50" />
      </div>
      <Line className="mt-2 w-full" />
      <Line className="mt-1 w-3/4" />
      <div className="relative mt-1.5 aspect-video w-full overflow-hidden rounded-lg bg-[#fff4cc]">
        <div className="absolute left-1.5 top-1.5 h-1 w-8 rounded-full bg-[#8a7a3a]" />
        <div className="absolute inset-x-1.5 bottom-1.5 h-[42%] rounded-md bg-[#14151c]" />
      </div>
      <div className="mt-auto flex gap-1">
        <Line className="w-4" />
        <Line className="w-4" />
        <Line className="w-4" />
      </div>
    </div>
  );
}

function PinterestScheme() {
  return (
    <div className="flex h-full flex-col bg-white px-2 pb-2">
      <div className="flex items-center justify-between">
        <span className="size-3.5 rounded-full bg-[#9a4f6b]" />
        <span className="h-3 w-7 rounded-full bg-[#14151c]" />
      </div>
      <div className="relative mt-1.5 min-h-0 flex-1 overflow-hidden rounded-xl bg-[#ffe4ef]">
        <div className="absolute left-1.5 top-2 h-1 w-8 rounded-full bg-[#9a4f6b]" />
        <div className="absolute inset-x-1.5 bottom-2 top-6 rounded-lg bg-[#2f5bff]" />
      </div>
      <Line className="mt-1.5 w-12 bg-[#14151c]/40" />
    </div>
  );
}
