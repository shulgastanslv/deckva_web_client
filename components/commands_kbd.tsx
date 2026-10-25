"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Command } from "lucide-react";

type Shortcut = { label: string; keys: string; mod?: boolean };

const GROUPS: { title: string; rows: Shortcut[] }[] = [
  {
    title: "Edit",
    rows: [
      { label: "Delete", keys: "Del" },
      { label: "Duplicate", keys: "D", mod: true },
      { label: "Undo", keys: "Z", mod: true },
      { label: "Redo", keys: "⇧Z", mod: true },
      { label: "Redo", keys: "Y", mod: true },
      { label: "Copy", keys: "C", mod: true },
      { label: "Paste", keys: "V", mod: true },
      { label: "Group", keys: "G", mod: true },
      { label: "Ungroup", keys: "⇧G", mod: true },
      { label: "Copy style", keys: "⇧C", mod: true },
      { label: "Paste style", keys: "⇧V", mod: true },
      { label: "Save", keys: "S", mod: true },
    ],
  },
  {
    title: "Place",
    rows: [
      { label: "Center horizontally", keys: "Alt H", mod: true },
      { label: "Center vertically", keys: "Alt V", mod: true },
      { label: "Center on the slide", keys: "Alt C", mod: true },
      { label: "Pan", keys: "Space" },
      { label: "Hand", keys: "H" },
      { label: "Select", keys: "V" },
      { label: "Zoom", keys: "scroll", mod: true },
      { label: "Leave crop", keys: "Esc" },
      { label: "Leave focus", keys: "Esc" },
    ],
  },
  {
    title: "Add",
    rows: [
      { label: "Text", keys: "T" },
      { label: "Rectangle", keys: "R" },
      { label: "Ellipse", keys: "O" },
      { label: "Line", keys: "L" },
    ],
  },
  {
    title: "Panels",
    rows: [
      { label: "Tools", keys: "1" },
      { label: "Elements", keys: "2" },
      { label: "Layers", keys: "3" },
      { label: "Background", keys: "4" },
      { label: "Filter", keys: "5" },
      { label: "Icons", keys: "6" },
    ],
  },
];

function chord(cmdKey: string, row: Shortcut) {
  if (!row.mod) return row.keys;
  if (row.keys === "scroll") return `${cmdKey} scroll`;
  return `${cmdKey} ${row.keys}`;
}

export function CommandsKbd() {
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const cmdKey = isMac ? "⌘" : "Ctrl";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Commands"
          className="h-7 w-7 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground"
        >
          <Command className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] w-64 overflow-y-auto rounded-4xl bg-background/80 p-1.5 shadow-2xl backdrop-blur-md"
      >
        <DropdownMenuLabel>Commands</DropdownMenuLabel>
        {GROUPS.map((group) => (
          <DropdownMenuGroup key={group.title}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground">{group.title}</DropdownMenuLabel>
            {group.rows.map((row) => (
              <DropdownMenuItem
                key={`${group.title}-${row.label}-${row.keys}`}
                className="text-[13px]"
                onSelect={(event) => event.preventDefault()}
              >
                <span>{row.label}</span>
                <Kbd className="ml-auto">{chord(cmdKey, row)}</Kbd>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
