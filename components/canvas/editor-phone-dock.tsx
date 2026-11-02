"use client";

import { Shapes, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export function EditorPhoneDock({
  libraryOpen,
  styleOpen,
  onLibrary,
  onStyle,
}: {
  libraryOpen: boolean;
  styleOpen: boolean;
  onLibrary: () => void;
  onStyle: () => void;
}) {
  return (
    <nav
      aria-label="Editor"
      className="flex shrink-0 items-stretch justify-around bg-muted/20 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <button
        type="button"
        onClick={onLibrary}
        aria-pressed={libraryOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
          libraryOpen ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <Shapes className="size-5 stroke-[1.75]" />
        Library
      </button>
      <button
        type="button"
        onClick={onStyle}
        aria-pressed={styleOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
          styleOpen ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <SlidersHorizontal className="size-5 stroke-[1.75]" />
        Style
      </button>
    </nav>
  );
}
