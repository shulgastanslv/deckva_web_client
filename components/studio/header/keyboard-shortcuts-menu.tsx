"use client";

import { Keyboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="ml-1 inline-flex h-5 items-center justify-center rounded-[4px] border border-border/50 bg-muted/40 px-1.5 text-[11px] font-medium text-muted-foreground first:ml-0">
    {children}
  </kbd>
);

const ShortcutItem = ({ label, keys }: { label: string; keys: React.ReactNode[] }) => (
  <DropdownMenuItem className="flex cursor-default items-center justify-between rounded-xl px-3 py-2 text-[13px] text-foreground focus:bg-muted/50">
    <span>{label}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Kbd key={i}>{key}</Kbd>
      ))}
    </div>
  </DropdownMenuItem>
);

export function KeyboardShortcutsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-muted/40 text-muted-foreground shadow-none outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/20"
          title="Keyboard shortcuts"
        >
          <Keyboard className="size-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px] rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2 text-[15px] font-semibold text-foreground">
          Shortcuts
        </DropdownMenuLabel>

        <div className="mt-2">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            General
          </div>
          <DropdownMenuGroup>
            <ShortcutItem label="Play / Pause" keys={["space"]} />
            <ShortcutItem label="Undo" keys={["⌘", "Z"]} />
            <ShortcutItem label="Redo" keys={["⌘", "⇧", "Z"]} />
            <ShortcutItem label="Expand" keys={["⌘", "E"]} />
          </DropdownMenuGroup>
        </div>

        <div className="mt-4">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Animation Editing
          </div>
          <DropdownMenuGroup>
            <ShortcutItem label="Copy" keys={["⌘", "C"]} />
            <ShortcutItem label="Cut" keys={["⌘", "X"]} />
            <ShortcutItem label="Paste" keys={["⌘", "V"]} />
            <ShortcutItem label="Duplicate" keys={["⌘", "D"]} />
            <ShortcutItem label="Hide" keys={["⌘", "⇧", "H"]} />
            <ShortcutItem label="Delete" keys={["delete"]} />
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
