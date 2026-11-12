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
import {
  Command,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

type Shortcut = { label: string; keys: string; mod?: boolean };

function chord(cmdKey: string, row: Shortcut) {
  if (!row.mod) return row.keys;
  if (row.keys === "scroll") return `${cmdKey} scroll`;
  return `${cmdKey} ${row.keys}`;
}

export function CommandsKbd() {
  const t = useTranslations("editor.commands");
  const tc = useTranslations("common");
  const te = useTranslations("editor");
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const cmdKey = isMac ? "⌘" : t("ctrl");

  const groups: { title: string; rows: Shortcut[] }[] = [
    {
      title: t("sections.edit"),
      rows: [
        { label: tc("delete"), keys: "Del" },
        { label: tc("duplicate"), keys: "D", mod: true },
        { label: tc("undo"), keys: "Z", mod: true },
        { label: tc("redo"), keys: "⇧Z", mod: true },
        { label: tc("redo"), keys: "Y", mod: true },
        { label: tc("copy"), keys: "C", mod: true },
        { label: tc("paste"), keys: "V", mod: true },
        { label: tc("group"), keys: "G", mod: true },
        { label: tc("ungroup"), keys: "⇧G", mod: true },
        { label: t("copyStyle"), keys: "⇧C", mod: true },
        { label: t("pasteStyle"), keys: "⇧V", mod: true },
        { label: tc("save"), keys: "S", mod: true },
      ],
    },
    {
      title: t("sections.place"),
      rows: [
        { label: t("centerH"), keys: "Alt H", mod: true },
        { label: t("centerV"), keys: "Alt V", mod: true },
        { label: t("centerSlide"), keys: "Alt C", mod: true },
        { label: t("sections.pan"), keys: "Space" },
        { label: t("hand"), keys: "H" },
        { label: t("select"), keys: "V" },
        { label: t("zoom"), keys: "scroll" },
        { label: t("stepSlides"), keys: "scroll", mod: true },
        { label: t("browseSlides"), keys: "↔" },
        { label: t("leaveCrop"), keys: "Esc" },
        { label: t("leaveFocus"), keys: "Esc" },
      ],
    },
    {
      title: t("sections.add"),
      rows: [
        { label: te("elements.text"), keys: "T" },
        { label: te("elements.rectangle"), keys: "R" },
        { label: te("elements.ellipse"), keys: "O" },
        { label: te("elements.line"), keys: "L" },
      ],
    },
    {
      title: t("sections.panels"),
      rows: [
        { label: te("panels.tools"), keys: "1" },
        { label: te("panels.elements"), keys: "2" },
        { label: te("panels.layers"), keys: "3" },
        { label: te("panels.background"), keys: "4" },
        { label: t("sections.filter"), keys: "5" },
        { label: t("icons"), keys: "6" },
      ],
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t("title")}
          className="size-9 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground"
        >
          <Command className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] w-64 overflow-y-auto rounded-4xl bg-background/80 p-1.5 shadow-2xl backdrop-blur-md"
      >
        <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
        {groups.map((group) => (
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
